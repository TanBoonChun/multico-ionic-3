import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { SvtProvider, SvtUtil } from '../../providers/svt/svt';

/**
 * Asset Profile (redesign section 7a): everything about one machine, independent of any
 * ticket - specifications, hour meter history, warranties and service history.
 *
 * API: GET asset/profile/{id | barcode | machinery no}
 *   -> { asset, warranty[], under_warranty, hour_meter[], history[], open_tickets }
 */
@IonicPage()
@Component({
  selector: 'page-svtassetprofile',
  templateUrl: 'svtassetprofile.html',
})
export class SvtAssetprofilePage {

  @ViewChild(Content) content: Content;

  key: any;
  profile: any = null;
  error = '';
  bars: any[] = [];
  pretty = SvtUtil.pretty;

  constructor(private nav: NavController, private params: NavParams, private svt: SvtProvider) {
    this.key = this.params.get('key');
  }

  ionViewDidLoad() {
    this.svt.get('/asset/profile/' + encodeURIComponent(this.key)).then((res) => {
      this.profile = res;
      this.buildChart();
      this.relayout();
    }, (err) => {
      this.error = this.svt.errorMessage(err, 'Could not load the asset.');
    });
  }

  /**
   * The footer button only exists once the profile has loaded. Ionic measures the footer when the page opens,
   * so without this the content runs under the button and the last cards (Service history) cannot be scrolled into view.
   */
  private relayout() {
    setTimeout(() => { if (this.content) { this.content.resize(); } }, 50);
  }

  /** Oldest to newest, bar height relative to the highest reading. */
  private buildChart() {
    const rows = (this.profile.hour_meter || []).slice().reverse();
    let max = 0;
    for (const r of rows) { max = Math.max(max, parseFloat(r.Hours) || 0); }
    this.bars = rows.map((r) => {
      const hours = parseFloat(r.Hours) || 0;
      const d = SvtUtil.parseDate(r.ReadingDate);
      const label = d ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + String(d.getFullYear()).substr(2) : '';
      return {
        label: label,
        value: Math.round(hours).toLocaleString(),
        height: max > 0 ? Math.max(6, Math.round(hours / max * 90)) : 6,
      };
    });
  }

  isOpen(t: any): boolean {
    return t.Status && t.Status !== 'Completed' && t.Status !== 'Cancelled';
  }

  scan() {
    this.nav.push('SvtFindassetPage');
  }

  createTicket() {
    this.nav.push('SvtCreatePage', { asset: this.profile.asset, underWarranty: this.profile.under_warranty });
  }
}
