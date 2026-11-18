import { Component } from '@angular/core';
import { IonicPage, ViewController, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SvtProvider } from '../../providers/svt/svt';

/**
 * Add part (redesign section 5a): pick a part from the technician's bag, either by scanning
 * its barcode or by searching the bag, then set the quantity and an optional warranty period.
 *
 * API: GET serviceticket/getItem?code=...   (one bag item by barcode)
 *      GET serviceticket/getItemInv         (everything in the technician's bag)
 *
 * Dismisses with { PartNo, Particulars, Qty, Warranty, InvId } or nothing when cancelled.
 */
@IonicPage()
@Component({
  selector: 'page-svtpart',
  templateUrl: 'svtpart.html',
})
export class SvtPartPage {

  bag: any[] = [];
  q = '';
  picked: any = null;       // { PartNo, name, Balance, InvId }
  qty = 1;
  warranty = '';
  loaded = false;

  constructor(
    private view: ViewController,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController,
    private svt: SvtProvider,
  ) {}

  ionViewDidLoad() {
    this.svt.get('/serviceticket/getItemInv').then((res) => {
      this.bag = Array.isArray(res) ? res : [];
      this.loaded = true;
    }, () => { this.loaded = true; });
  }

  close() {
    this.view.dismiss();
  }

  /** The bag filtered by what was typed (part no or name). */
  filtered(): any[] {
    const q = this.q.trim().toLowerCase();
    if (!q) { return this.bag; }
    return this.bag.filter((b) =>
      (b.name || '').toLowerCase().indexOf(q) >= 0 || (b.barcode || '').toLowerCase().indexOf(q) >= 0);
  }

  pick(item: any) {
    this.picked = { PartNo: item.barcode || '', name: item.name, Balance: parseFloat(item.Balance) || 0, InvId: item.Id };
    this.qty = 1;
  }

  scan() {
    this.scanner.scan().then((result) => {
      if (result.cancelled || !result.text) { return; }
      const code = result.text.trim();
      this.svt.get('/serviceticket/getItem', { code: code }).then((item) => {
        if (item && item.name) {
          this.picked = { PartNo: code, name: item.name, Balance: parseFloat(item.Balance) || 0, InvId: item.Id };
          this.qty = 1;
        } else {
          this.alertCtrl.create({ title: 'Not in your bag', subTitle: 'No part with the code ' + code + ' is in your technician bag.', buttons: ['OK'] }).present();
        }
      }, (err) => {
        this.alertCtrl.create({ title: 'Error', subTitle: this.svt.errorMessage(err, 'Could not look up the part.'), buttons: ['OK'] }).present();
      });
    }, (err) => {
      this.alertCtrl.create({ title: 'Scanner', subTitle: 'Could not open the camera: ' + err, buttons: ['OK'] }).present();
    });
  }

  add() {
    if (!this.picked) {
      this.alertCtrl.create({ title: 'Part', subTitle: 'Scan a barcode or pick a part from your bag first.', buttons: ['OK'] }).present();
      return;
    }
    const qty = Number(this.qty);
    if (!qty || qty <= 0) {
      this.alertCtrl.create({ title: 'Quantity', subTitle: 'Enter a quantity above 0.', buttons: ['OK'] }).present();
      return;
    }
    if (this.picked.Balance && qty > this.picked.Balance) {
      this.alertCtrl.create({ title: 'Quantity', subTitle: 'Only ' + this.picked.Balance + ' in your bag.', buttons: ['OK'] }).present();
      return;
    }
    this.view.dismiss({
      PartNo: this.picked.PartNo,
      Particulars: this.picked.name,
      Qty: qty,
      Warranty: this.warranty.trim(),
      InvId: this.picked.InvId,
    });
  }
}
