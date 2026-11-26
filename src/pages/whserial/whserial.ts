import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SvtProvider } from '../../providers/svt/svt';
import { WarehouseProvider } from '../../providers/warehouse/warehouse';
import { WhSerial, WhSerialEvent } from '../../models/stock';

/**
 * Scan serial: scan (or type) the serial number on a unit and see which part it is, its
 * condition, where it is now (in the store, with a technician, on delivery, on site), who has it,
 * which receiving it came in on, and its history.
 *
 * API: GET wh/serial?code=..., GET wh/serial/{id}/history
 */
@IonicPage()
@Component({
  selector: 'page-whserial',
  templateUrl: 'whserial.html',
})
export class WhserialPage {

  code: string = '';
  serials: WhSerial[] = [];
  itemMatch: any = null;        // the code is a part label, not a serial number
  selected: WhSerial = null;
  events: WhSerialEvent[] = [];
  busy = false;
  historyBusy = false;
  message = '';

  constructor(
    private nav: NavController,
    private svt: SvtProvider,
    private wh: WarehouseProvider,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController,
  ) {}

  scan() {
    this.scanner.scan().then((result) => {
      if (result.cancelled || !result.text) { return; }
      this.code = result.text.trim();
      this.lookup();
    }, (err) => {
      this.alertCtrl.create({ title: 'Scanner', subTitle: 'Could not open the camera: ' + err, buttons: ['OK'] }).present();
    });
  }

  lookup() {
    const code = this.code ? this.code.trim() : '';
    this.selected = null;
    this.events = [];
    this.serials = [];
    this.itemMatch = null;
    this.message = '';
    if (!code) {
      this.message = 'Scan or type a serial number.';
      return;
    }

    this.busy = true;
    this.wh.serial(code).then((res) => {
      this.busy = false;
      this.serials = res && res.serials ? res.serials : [];
      this.itemMatch = res ? res.item_match : null;
      if (this.serials.length === 1) {
        this.open(this.serials[0]);
      } else if (this.serials.length === 0 && !this.itemMatch) {
        this.message = 'No serial number matches ' + code + '.';
      }
    }, (err) => {
      this.busy = false;
      this.message = this.svt.errorMessage(err, 'Could not look up the serial number.');
    });
  }

  /** Show one unit and load its history. */
  open(s: WhSerial) {
    this.selected = s;
    this.events = [];
    this.historyBusy = true;
    this.wh.serialHistory(s.id).then((res) => {
      this.historyBusy = false;
      this.events = res && res.events ? res.events : [];
    }, (err) => {
      this.historyBusy = false;
      this.alertCtrl.create({ title: 'Error', subTitle: this.svt.errorMessage(err, 'Could not load the history.'), buttons: ['OK'] }).present();
    });
  }

  back() {
    this.selected = null;
    this.events = [];
  }

  /** Open Stock check for the part of this unit (or the part whose label was scanned). */
  openPart(itemCode: string) {
    this.nav.push('WhstockcheckPage', { q: itemCode });
  }

  stateClass(s: WhSerial): string {
    if (s.state === 'technician') { return 'svt-pill-orange'; }
    if (s.state === 'delivery') { return 'svt-pill-blue'; }
    if (s.state === 'site') { return 'svt-pill-purple'; }
    return 'svt-pill-green';
  }

  conditionClass(condition: string): string {
    const c = (condition || '').toLowerCase();
    if (c === 'good' || c === 'new' || c === 'none' || c === '') { return 'svt-pill-green'; }
    return 'svt-pill-red';
  }

  eventClass(type: string): string {
    if (type === 'Received') { return 'svt-pill-green'; }
    if (type === 'Allocated' || type === 'On Delivery') { return 'svt-pill-blue'; }
    if (type === 'On Hand') { return 'svt-pill-orange'; }
    if (type === 'On Site') { return 'svt-pill-purple'; }
    if (type === 'Status') { return 'svt-pill-red'; }
    return 'svt-pill-grey';
  }

  /** '2026-11-26 14:05:00' -> '2026-11-26 14:05' */
  when(date: string): string {
    return date ? String(date).substr(0, 16) : '';
  }
}
