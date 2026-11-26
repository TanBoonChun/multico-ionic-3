import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SvtProvider } from '../../providers/svt/svt';
import { WarehouseProvider } from '../../providers/warehouse/warehouse';
import { CountQueue, FlushResult } from '../../providers/warehouse/count-queue';
import { WhStocktake, WhStocktakeLine, WhQueuedCount } from '../../models/stock';

/**
 * Count one stock take: type the counted quantity per line, or scan a part label to jump to its
 * line. A count is kept on the phone until the server has it (CountQueue), so it survives a bad
 * signal. When every line is counted, someone who may post (Parts Coordinator, Senior Manager)
 * submits the stock take and the variance goes to the stock ledger.
 *
 * API: GET wh/stocktakes/{id}, POST wh/stocktakes/{id}/counts, POST wh/stocktakes/{id}/post
 */
@IonicPage()
@Component({
  selector: 'page-whstocktakecount',
  templateUrl: 'whstocktakecount.html',
})
export class WhstocktakecountPage {

  id: number;
  stocktake: WhStocktake = null;
  lines: WhStocktakeLine[] = [];
  shown: WhStocktakeLine[] = [];
  matching = 0;                 // lines that pass the tab and the search
  limit = 100;
  tab: string = 'todo';         // 'todo' | 'done' | 'all'
  q: string = '';

  busy = true;
  message = '';
  waiting = 0;                  // counts typed here that the server does not have yet
  counted = 0;                  // lines counted in the current round
  total = 0;                    // lines to count in the current round

  canCount = true;
  posting = false;

  constructor(
    private nav: NavController,
    private params: NavParams,
    private svt: SvtProvider,
    private wh: WarehouseProvider,
    private queue: CountQueue,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController,
  ) {}

  ionViewDidLoad() {
    this.id = Number(this.params.get('id'));
    this.wh.me().then((p) => {
      this.canCount = !!(p && p.can_count);
    }, () => {});
    this.load();
  }

  isOpen(): boolean {
    return !!this.stocktake && (this.stocktake.status === 'Open' || this.stocktake.status === 'Recount');
  }

  /** Upload what is waiting, then load the lines. */
  load() {
    this.busy = true;
    this.message = '';
    this.queue.flush(this.id).then((res: FlushResult) => {
      this.refused(res);
      return this.wh.stocktake(this.id);
    }).then((res) => {
      this.stocktake = res.stocktake;
      this.lines = res.lines;
      for (let i = 0; i < this.lines.length; i++) {
        const l = this.lines[i];
        l.input = l.counted_qty === null ? '' : l.counted_qty;
        l.pending = false;
      }
      return this.queue.pending(this.id);
    }).then((pending: WhQueuedCount[]) => {
      this.applyPending(pending);
      this.busy = false;
      this.applyFilter();
    }).catch((err) => {
      this.busy = false;
      this.message = this.svt.errorMessage(err, 'Could not load the stock take.');
    });
  }

  /** Show the counts that are still only on this phone. */
  private applyPending(pending: WhQueuedCount[]) {
    for (let i = 0; i < pending.length; i++) {
      for (let j = 0; j < this.lines.length; j++) {
        if (this.lines[j].id === pending[i].lineId) {
          this.lines[j].counted_qty = pending[i].qty;
          this.lines[j].input = pending[i].qty;
          this.lines[j].pending = true;
        }
      }
    }
    this.waiting = pending.length;
    this.refreshStats();
  }

  private refreshStats() {
    let n = 0;
    let all = 0;
    for (let i = 0; i < this.lines.length; i++) {
      if (!this.lines[i].countable) { continue; }
      all++;
      if (this.lines[i].counted_qty !== null && this.lines[i].counted_qty !== undefined) { n++; }
    }
    this.counted = n;
    this.total = all;
    if (this.stocktake) { this.stocktake.counted = n; }
  }

  private refused(res: FlushResult) {
    if (res && res.message) {
      this.alertCtrl.create({ title: 'Counts not saved', subTitle: res.message, buttons: ['OK'] }).present();
    }
  }

  pickTab(tab: string) {
    this.tab = tab;
    this.limit = 100;
    this.applyFilter();
  }

  applyFilter() {
    const needle = this.q ? this.q.trim().toLowerCase() : '';
    const out: WhStocktakeLine[] = [];
    for (let i = 0; i < this.lines.length; i++) {
      const l = this.lines[i];
      const isCounted = l.counted_qty !== null && l.counted_qty !== undefined;
      // in the 2nd count only the lines sent for a recount are worked on; 'All' still shows every line
      if (!l.countable && this.tab !== 'all') { continue; }
      if (this.tab === 'todo' && isCounted) { continue; }
      if (this.tab === 'done' && !isCounted) { continue; }
      if (needle) {
        const text = ((l.item_code || '') + ' ' + (l.part_name || '') + ' ' + (l.location || '')).toLowerCase();
        if (text.indexOf(needle) < 0) { continue; }
      }
      out.push(l);
    }
    this.matching = out.length;
    this.shown = out.slice(0, this.limit);
  }

  searchChanged() {
    this.limit = 100;
    this.applyFilter();
  }

  more() {
    this.limit += 100;
    this.applyFilter();
  }

  variance(l: WhStocktakeLine): number {
    return Math.round((Number(l.counted_qty) - Number(l.system_qty)) * 1000) / 1000;
  }

  hasCount(l: WhStocktakeLine): boolean {
    return l.counted_qty !== null && l.counted_qty !== undefined;
  }

  /** The user typed a quantity: keep it on the phone, then try to upload it. */
  onCount(l: WhStocktakeLine) {
    if (!l.countable) { return; }
    const raw = l.input;
    if (raw === '' || raw === null || raw === undefined) { return; }
    const qty = Number(raw);
    if (isNaN(qty) || qty < 0) {
      this.alertCtrl.create({ title: 'Quantity', subTitle: 'Enter a number, 0 or more.', buttons: ['OK'] }).present();
      l.input = this.hasCount(l) ? l.counted_qty : '';
      return;
    }
    l.counted_qty = qty;
    l.pending = true;
    this.refreshStats();
    this.queue.add(this.id, l.id, qty).then(() => this.sync());
  }

  /** Try to upload the waiting counts; what fails stays for the next try. */
  sync() {
    return this.queue.flush(this.id).then((res: FlushResult) => {
      this.refused(res);
      return this.queue.pending(this.id);
    }).then((pending: WhQueuedCount[]) => {
      this.waiting = pending.length;
      for (let j = 0; j < this.lines.length; j++) {
        let still = false;
        for (let i = 0; i < pending.length; i++) {
          if (pending[i].lineId === this.lines[j].id) { still = true; }
        }
        this.lines[j].pending = still;
      }
    });
  }

  scan() {
    this.scanner.scan().then((result) => {
      if (result.cancelled || !result.text) { return; }
      const code = result.text.trim();
      const lower = code.toLowerCase();

      // the label is the part number itself
      for (let i = 0; i < this.lines.length; i++) {
        if ((this.lines[i].item_code || '').toLowerCase() === lower) {
          this.showPart(this.lines[i].item_code);
          return;
        }
      }

      // otherwise ask the server which part the code belongs to
      this.busy = true;
      this.wh.itemsByCode(code).then((items) => {
        this.busy = false;
        if (items.length > 0) {
          this.showPart(items[0].item_code);
        } else {
          this.alertCtrl.create({ title: 'Part not found', subTitle: 'No part matches the code ' + code + '.', buttons: ['OK'] }).present();
        }
      }, (err) => {
        this.busy = false;
        this.alertCtrl.create({ title: 'Error', subTitle: this.svt.errorMessage(err, 'Could not look up the part.'), buttons: ['OK'] }).present();
      });
    }, (err) => {
      this.alertCtrl.create({ title: 'Scanner', subTitle: 'Could not open the camera: ' + err, buttons: ['OK'] }).present();
    });
  }

  /** Filter the list down to one part number. */
  private showPart(itemCode: string) {
    this.q = itemCode;
    this.tab = 'all';
    this.limit = 100;
    this.applyFilter();
    if (this.matching === 0) {
      this.alertCtrl.create({ title: 'Not on this stock take', subTitle: itemCode + ' has no line in this stock take.', buttons: ['OK'] }).present();
    }
  }

  submit() {
    if (this.waiting > 0) {
      this.alertCtrl.create({ title: 'Counts waiting', subTitle: this.waiting + ' count(s) are not uploaded yet. Check the connection and try again.', buttons: ['OK'] }).present();
      return;
    }
    const left = this.total - this.counted;
    if (left > 0) {
      this.alertCtrl.create({ title: 'Not finished', subTitle: left + ' line(s) have no count. Enter 0 when nothing was found.', buttons: ['OK'] }).present();
      return;
    }
    this.alertCtrl.create({
      title: 'Submit counts',
      message: 'Counting is finished. The variance is reviewed and approved on the web. After this you cannot change the counts here.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Submit', handler: () => { this.doSubmit(); } },
      ],
    }).present();
  }

  private doSubmit() {
    this.posting = true;
    this.queue.flush(this.id).then(() => this.queue.pending(this.id)).then((pending: WhQueuedCount[]): Promise<any> => {
      if (pending.length > 0) {
        this.posting = false;
        this.waiting = pending.length;
        this.alertCtrl.create({ title: 'Counts waiting', subTitle: 'Some counts are not uploaded yet. Try again.', buttons: ['OK'] }).present();
        return Promise.resolve(null);
      }
      return this.wh.submitCounts(this.id).then((res) => {
        this.posting = false;
        const done = this.alertCtrl.create({
          title: 'Done',
          subTitle: res && res.message ? res.message : 'Counts submitted.',
          buttons: [{ text: 'OK', handler: () => { this.nav.pop(); } }],
        });
        done.present();
      }, (err) => {
        this.posting = false;
        this.alertCtrl.create({ title: 'Could not submit', subTitle: this.svt.errorMessage(err, 'Could not submit the stock take.'), buttons: ['OK'] }).present();
      });
    });
  }
}
