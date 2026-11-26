import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController } from 'ionic-angular';
import { SvtProvider } from '../../providers/svt/svt';
import { WarehouseProvider } from '../../providers/warehouse/warehouse';
import { WhStocktake, WhLocation } from '../../models/stock';

/**
 * Stock takes: the open ones to count, the posted ones, and a form to start a new one by
 * location or by part number (the same stock takes the web shows in Parts Control).
 *
 * API: GET wh/stocktakes, POST wh/stocktakes, GET wh/locations, GET wh/me
 */
@IonicPage()
@Component({
  selector: 'page-whstocktakelist',
  templateUrl: 'whstocktakelist.html',
})
export class WhstocktakelistPage {

  // statuses to load: still to count, handed in (review, approval, posted), or everything
  readonly TO_COUNT = 'Open,Recount';
  readonly HANDED_IN = 'Review,Pending Approval,Approved,Posted';
  filter: string = 'Open,Recount';
  list: WhStocktake[] = [];
  busy = false;
  message = '';

  canCount = false;
  showNew = false;
  locations: WhLocation[] = [];
  scope: string = 'location';   // 'location' | 'part'
  roomId: any = null;
  parts: string = '';
  remarks: string = '';
  creating = false;

  constructor(
    private nav: NavController,
    private svt: SvtProvider,
    private wh: WarehouseProvider,
    private alertCtrl: AlertController,
  ) {}

  ionViewDidLoad() {
    this.wh.me().then((p) => {
      this.canCount = !!(p && p.can_count);
    }, () => { this.canCount = false; });

    this.wh.locations().then((list) => {
      this.locations = list;
    }, () => { this.locations = []; });
  }

  /** Reload every time the page is shown, so progress is fresh after counting. */
  ionViewDidEnter() {
    this.load();
  }

  pick(filter: string) {
    this.filter = filter;
    this.load();
  }

  load() {
    this.busy = true;
    this.message = '';
    this.wh.stocktakes(this.filter).then((list) => {
      this.list = list;
      this.busy = false;
      if (list.length === 0) { this.message = 'No stock take found.'; }
    }, (err) => {
      this.list = [];
      this.busy = false;
      this.message = this.svt.errorMessage(err, 'Could not load the stock takes.');
    });
  }

  open(s: WhStocktake) {
    this.nav.push('WhstocktakecountPage', { id: s.id });
  }

  statusClass(s: WhStocktake): string {
    if (s.status === 'Posted') { return 'svt-pill-green'; }
    if (s.status === 'Cancelled') { return 'svt-pill-grey'; }
    if (s.status === 'Review' || s.status === 'Pending Approval' || s.status === 'Approved') { return 'svt-pill-blue'; }
    return 'svt-pill-orange';
  }

  toggleNew() {
    this.showNew = !this.showNew;
  }

  create() {
    if (this.scope === 'location' && !this.roomId) {
      this.alertCtrl.create({ title: 'Location', subTitle: 'Choose the location to count.', buttons: ['OK'] }).present();
      return;
    }
    if (this.scope === 'part' && !(this.parts && this.parts.trim())) {
      this.alertCtrl.create({ title: 'Part numbers', subTitle: 'Enter the part numbers to count, separated by commas.', buttons: ['OK'] }).present();
      return;
    }

    const body: any = { scope: this.scope, remarks: this.remarks };
    if (this.roomId) { body.room_id = this.roomId; }
    if (this.scope === 'part') { body.parts = this.parts; }

    this.creating = true;
    this.wh.createStocktake(body).then((res) => {
      this.creating = false;
      this.showNew = false;
      this.parts = '';
      this.remarks = '';
      if (res && res.id) {
        this.nav.push('WhstocktakecountPage', { id: res.id });
      } else {
        this.load();
      }
    }, (err) => {
      this.creating = false;
      this.alertCtrl.create({ title: 'Could not start', subTitle: this.svt.errorMessage(err, 'Could not start the stock take.'), buttons: ['OK'] }).present();
    });
  }
}
