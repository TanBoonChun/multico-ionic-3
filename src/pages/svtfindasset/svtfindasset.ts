import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SvtProvider } from '../../providers/svt/svt';

/**
 * Find asset (redesign section 7): scan the QR code on the machine, or search by asset type
 * and text. Tapping a result opens the Asset Profile.
 *
 * API: GET asset/types, GET asset/search?barcode=...  or  ?type=...&q=...
 */
@IonicPage()
@Component({
  selector: 'page-svtfindasset',
  templateUrl: 'svtfindasset.html',
})
export class SvtFindassetPage {

  types: string[] = [];
  type: string = '';          // '' = All
  q: string = '';
  assets: any[] = [];
  busy = false;
  message = '';
  private timer: any;

  constructor(
    private nav: NavController,
    private svt: SvtProvider,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController,
  ) {}

  ionViewDidLoad() {
    this.svt.get('/asset/types').then((res) => {
      this.types = res && res.types ? res.types : [];
    }, () => { this.types = []; });

    // the camera is never opened by itself: the user taps "Scan asset QR code"
    this.search();
  }

  pickType(type: string) {
    this.type = type;
    this.search();
  }

  /** Wait for a pause in typing before asking the server. */
  typing() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.search(), 400);
  }

  search() {
    this.busy = true;
    this.message = '';
    const params: any = {};
    if (this.type) { params.type = this.type; }
    if (this.q && this.q.trim()) { params.q = this.q.trim(); }

    this.svt.get('/asset/search', params).then((res) => {
      this.assets = res && res.assets ? res.assets : [];
      this.busy = false;
      if (this.assets.length === 0) { this.message = 'No asset found.'; }
    }, (err) => {
      this.assets = [];
      this.busy = false;
      this.message = this.svt.errorMessage(err, 'Could not load assets.');
    });
  }

  scan() {
    this.scanner.scan().then((result) => {
      if (result.cancelled || !result.text) { return; }
      const code = result.text.trim();

      this.busy = true;
      this.svt.get('/asset/search', { barcode: code }).then((res) => {
        this.busy = false;
        const found = res && res.assets ? res.assets : [];
        if (found.length === 1) {
          this.open(found[0]);
        } else if (found.length > 1) {
          this.assets = found;
          this.message = '';
        } else {
          this.alertCtrl.create({ title: 'Asset not found', subTitle: 'No asset matches the code ' + code + '.', buttons: ['OK'] }).present();
        }
      }, (err) => {
        this.busy = false;
        this.alertCtrl.create({ title: 'Error', subTitle: this.svt.errorMessage(err, 'Could not look up the asset.'), buttons: ['OK'] }).present();
      });
    }, (err) => {
      this.alertCtrl.create({ title: 'Scanner', subTitle: 'Could not open the camera: ' + err, buttons: ['OK'] }).present();
    });
  }

  open(asset: any) {
    this.nav.push('SvtAssetprofilePage', { key: asset.Id });
  }
}
