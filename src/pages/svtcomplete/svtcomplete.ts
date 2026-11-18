import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController, LoadingController } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { SvtProvider, SvtUtil } from '../../providers/svt/svt';

/**
 * Service Complete (redesign section 5): what the technician fills in at the end of a visit
 * before the Completion Report.
 *
 *  - work period: read only, built from the Start task / End task pairs
 *  - failures (edit / delete / add) and parts used (qty -/+, scan / add)
 *  - service recommendation, hour meter now, next service hour and date
 *  - warranty claim card (only for WARRANTY order type)
 *
 * API used:
 *   GET  serviceticket/completion/{id}            time entries, parts, saved header
 *   GET  gensetnote/{id}?type=Failure             failures (+ gensetnote/details/{id} for photos)
 *   POST serviceticket/completion/save            parts, Recommendation, HourMeter, NextServiceHour/Date
 *   POST asset/hourMeter/save                     the hour meter reading
 *
 * Not connected yet (no API on the server): deleting a failure, and the warranty claim card.
 * They are on screen as designed; see the notes at those methods.
 *
 * Navigation params: ticket (the ticket object from the list), asset (asset from asset/profile).
 */
@IonicPage()
@Component({
  selector: 'page-svtcomplete',
  templateUrl: 'svtcomplete.html',
})
export class SvtCompletePage {

  t: any;
  asset: any;
  times: any[] = [];
  totalOnSite = '';
  failures: any[] = [];
  parts: any[] = [];
  closed = false;

  recommendation = '';
  hourNow: any = '';
  nextHour: any = '';
  nextDate = '';           // YYYY-MM-DD
  private lastHour: any = null;

  scopes = ['Repair', 'Commissioning', 'Warranty'];
  scope = '';

  // warranty claim card (not saved anywhere yet)
  claimCovers = 'Parts';
  claimReason = '';

  constructor(
    private nav: NavController,
    private params: NavParams,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toast: Toast,
    private svt: SvtProvider,
  ) {
    this.t = this.params.get('ticket') || {};
    this.asset = this.params.get('asset');
    this.scope = this.t.scope_of_work || '';
  }

  get isWarrantyOrder(): boolean {
    return String(this.t.order_type || '').toUpperCase() === 'WARRANTY';
  }

  ionViewDidLoad() {
    this.loadCompletion();
    this.loadFailures();
    if (this.asset && this.asset.Id) {
      this.svt.get('/asset/hourMeter/' + this.asset.Id).then((rows) => {
        if (Array.isArray(rows) && rows.length) {
          this.lastHour = rows[0];
          if (this.hourNow === '') { this.hourNow = rows[0].Hours; }
        }
      }, () => {});
    }
  }

  private loadCompletion() {
    this.svt.get('/serviceticket/completion/' + this.t.Id).then((res) => {
      if (!res) { return; }
      const c = res.completion || {};
      this.times = res.times || [];
      this.parts = (res.parts || []).map((p) => ({ PartNo: p.PartNo, Particulars: p.Particulars, Qty: Number(p.Qty) || 1 }));
      this.closed = !!res.closed;
      this.recommendation = c.Recommendation || '';
      if (c.HourMeter !== null && c.HourMeter !== undefined && c.HourMeter !== '') { this.hourNow = c.HourMeter; }
      this.nextHour = c.NextServiceHour !== null && c.NextServiceHour !== undefined ? c.NextServiceHour : '';
      this.nextDate = c.NextServiceDate || '';
      this.sumTimes();
    }, (err) => {
      this.toast.show(this.svt.errorMessage(err, 'Could not load the work period'), '5000', 'center').subscribe();
    });
  }

  private sumTimes() {
    let total = 0;
    for (const r of this.times) {
      const a = SvtUtil.minutes(r.StartTime);
      const b = SvtUtil.minutes(r.StopTime);
      if (a !== null && b !== null) { total += b >= a ? b - a : b + 1440 - a; }
    }
    this.totalOnSite = total ? SvtUtil.formatMinutes(total) : '0h 00m';
  }

  duration(r: any): string {
    return SvtUtil.duration(r.StartTime, r.StopTime);
  }

  private loadFailures() {
    this.svt.get('/gensetnote/' + this.t.Id, { type: 'Failure' }).then((res) => {
      this.failures = Array.isArray(res) ? res : [];
      this.failures.forEach((f) => {
        this.svt.get('/gensetnote/details/' + f.Id).then((d) => { f.images = d && d.images ? d.images : []; }, () => { f.images = []; });
      });
    }, () => { this.failures = []; });
  }

  thumb(f: any): string {
    return f.images && f.images.length ? this.svt.fileUrl(f.images[0].Image_Path) : '';
  }

  // ---------------------------------------------------------------- failures

  addFailure() {
    const modal = this.modalCtrl.create('SvtFailurePage', { serviceId: this.t.Id });
    modal.onDidDismiss((saved) => { if (saved) { this.loadFailures(); } });
    modal.present();
  }

  editFailure(f: any) {
    const modal = this.modalCtrl.create('SvtFailurePage', { serviceId: this.t.Id, noteId: f.Id });
    modal.onDidDismiss((saved) => { if (saved) { this.loadFailures(); } });
    modal.present();
  }

  /**
   * The server has no API to delete a failure yet (only gensetnote create / update). This
   * calls POST gensetnote/delete {Id}, the route name the rest of the app would expect; until
   * the backend adds it the technician gets a clear message instead of a silent failure.
   */
  deleteFailure(f: any) {
    this.alertCtrl.create({
      title: 'Delete failure',
      message: 'Delete "' + (f.Title || 'Failure') + '"?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          handler: () => {
            this.svt.post('/gensetnote/delete', { Id: f.Id }).then(() => {
              this.loadFailures();
            }, (err) => {
              this.toast.show(this.svt.errorMessage(err, 'Deleting a failure is not available on the server yet.'), '5000', 'center').subscribe();
            });
          },
        },
      ],
    }).present();
  }

  // ---------------------------------------------------------------- parts

  addPart() {
    const modal = this.modalCtrl.create('SvtPartPage');
    modal.onDidDismiss((part) => {
      if (!part) { return; }
      const label = part.Warranty ? part.Particulars + ' (warranty ' + part.Warranty + ')' : part.Particulars;
      this.parts.push({ PartNo: part.PartNo, Particulars: label, Qty: part.Qty });
    });
    modal.present();
  }

  qtyUp(p: any) { p.Qty = Number(p.Qty) + 1; }

  qtyDown(p: any) {
    if (Number(p.Qty) > 1) { p.Qty = Number(p.Qty) - 1; }
  }

  removePart(i: number) {
    this.parts.splice(i, 1);
  }

  // ---------------------------------------------------------------- continue

  pickScope(s: string) {
    this.scope = s;   // display only: there is no field for it on the server yet
  }

  continue() {
    if (this.closed) {
      this.toast.show('This ticket is closed', '3000', 'center').subscribe();
      this.nav.push('SvtCompletionPage', { ticket: this.t, asset: this.asset });
      return;
    }

    const loader = this.loadingCtrl.create({ content: 'Saving...' });
    loader.present();

    const body: any = {
      ServiceId: this.t.Id,
      parts: this.parts.map((p) => ({ PartNo: p.PartNo, Particulars: p.Particulars, Qty: p.Qty })),
      Recommendation: this.recommendation,
    };
    if (this.hourNow !== '' && this.hourNow !== null) { body.HourMeter = this.hourNow; }
    if (this.nextHour !== '' && this.nextHour !== null) { body.NextServiceHour = this.nextHour; }
    if (this.nextDate) { body.NextServiceDate = this.nextDate; }

    this.svt.post('/serviceticket/completion/save', body).then(() => {
      // log the reading on the asset too when it changed
      const hours = parseFloat(this.hourNow);
      const last = this.lastHour ? parseFloat(this.lastHour.Hours) : null;
      if (this.asset && this.asset.Id && !isNaN(hours) && hours !== last) {
        return this.svt.post('/asset/hourMeter/save', {
          InventoryId: this.asset.Id, ServiceId: this.t.Id, ReadingDate: SvtUtil.ymd(new Date()), Hours: hours,
        });
      }
    }).then(() => {
      loader.dismiss();
      this.nav.push('SvtCompletionPage', { ticket: this.t, asset: this.asset });
    }, (err) => {
      loader.dismiss();
      this.toast.show(this.svt.errorMessage(err, 'Could not save'), '5000', 'center').subscribe();
    });
  }
}
