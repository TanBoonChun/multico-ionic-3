import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SvtProvider } from '../../providers/svt/svt';
import { WarehouseProvider } from '../../providers/warehouse/warehouse';
import { WhItem, WhItemLocation } from '../../models/stock';

/**
 * Stock check: search a part (or scan its label) and see on hand, reserved, available and the
 * safety level, with the on hand per location for the part you tap.
 *
 * API: GET wh/items?q=... or ?barcode=..., GET wh/items/{id}/stock
 */
@IonicPage()
@Component({
  selector: 'page-whstockcheck',
  templateUrl: 'whstockcheck.html',
})
export class WhstockcheckPage {

  q: string = '';
  items: WhItem[] = [];
  selected: WhItem = null;
  locations: WhItemLocation[] = [];
  busy = false;
  detailBusy = false;
  message = '';
  /** Opened from "Item history" on the home page: picking a part goes straight to its history. */
  historyMode = false;
  private timer: any;

  constructor(
    private nav: NavController,
    private params: NavParams,
    private svt: SvtProvider,
    private wh: WarehouseProvider,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController,
  ) {}

  ionViewDidLoad() {
    this.historyMode = this.params.get('mode') === 'history';

    // opened from Scan serial with the part to look at
    const q = this.params.get('q');
    if (q) {
      this.q = String(q);
      this.search();
    }
  }

  /** Wait for a pause in typing before asking the server. */
  typing() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.search(), 400);
  }

  search() {
    const text = this.q ? this.q.trim() : '';
    this.selected = null;
    this.locations = [];
    if (text.length < 2) {
      this.items = [];
      this.message = text.length === 0 ? '' : 'Type at least 2 characters.';
      return;
    }
    this.busy = true;
    this.message = '';
    this.wh.searchItems(text).then((list) => {
      this.items = list;
      this.busy = false;
      if (list.length === 0) { this.message = 'No part found.'; }
    }, (err) => {
      this.items = [];
      this.busy = false;
      this.message = this.svt.errorMessage(err, 'Could not search the parts.');
    });
  }

  scan() {
    this.scanner.scan().then((result) => {
      if (result.cancelled || !result.text) { return; }
      const code = result.text.trim();
      this.q = code;

      this.busy = true;
      this.message = '';
      this.wh.itemsByCode(code).then((list) => {
        this.busy = false;
        this.items = list;
        this.selected = null;
        this.locations = [];
        if (list.length === 1) {
          this.open(list[0]);
        } else if (list.length === 0) {
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

  /** Show the stock per location of one part. */
  open(item: WhItem) {
    if (this.historyMode) {
      this.history(item, null);
      return;
    }
    this.selected = item;
    this.locations = [];
    this.detailBusy = true;
    this.wh.itemStock(item.id).then((res) => {
      this.detailBusy = false;
      if (res && res.item) { this.selected = res.item; }
      this.locations = res && res.locations ? res.locations : [];
    }, (err) => {
      this.detailBusy = false;
      this.alertCtrl.create({ title: 'Error', subTitle: this.svt.errorMessage(err, 'Could not load the stock of this part.'), buttons: ['OK'] }).present();
    });
  }

  /** Movements of the part, optionally of one location only. */
  history(item: WhItem, roomId: number) {
    const params: any = { itemId: item.id, itemCode: item.item_code, partName: item.part_name };
    if (roomId) { params.roomId = roomId; }
    this.nav.push('WhhistoryPage', params);
  }

  back() {
    this.selected = null;
    this.locations = [];
  }

  isLow(item: WhItem): boolean {
    return !!item && item.safety > 0 && item.available <= item.safety;
  }
}
