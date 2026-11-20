import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { SERVER_URL } from '../../environment';
import { SvtUtil } from '../../providers/svt/svt';

@IonicPage()
@Component({
  selector: 'page-gensetcomplete',
  templateUrl: 'gensetcomplete.html',
})
export class GensetcompletePage {

  public items: any = [];

  public serviceTypeOptions: string[] = [
    'Preventive Maintenance',
    'Corrective Maintenance',
    'WARRANTY / WARRANTY SERVICE',
    'FULL SERVICE',
  ];

  public startDate: string = '';
  public endDate: string = '';
  public selectedTypes: string[] = [];
  public q: string = '';      // search text: ticket no, company, asset, site...
  public searched = false;   // nothing is listed until a filter has been applied
  public loading = false;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private navCtrl: NavController
  ) {}

  ionViewWillEnter() {
    // coming back from a ticket: refresh the current results, but never list everything on first open
    if (this.searched) {
      this.load();
    }
  }

  /** The loaded tickets narrowed by the search text (every word must appear on the ticket). */
  get visibleItems(): any[] {
    const list = Array.isArray(this.items) ? this.items : [];
    const words = this.q.toLowerCase().split(/\s+/).filter((w) => w !== '');
    if (!words.length) { return list; }
    return list.filter((t) => {
      const hay = [t.service_id, t.customer_name, t.genset_no, t.Loc_Name, t.service_type, t.job_type, t.model, t.service_date].join(' ').toLowerCase();
      return words.every((w) => hay.indexOf(w) >= 0);
    });
  }

  pretty(v: any): string {
    return SvtUtil.pretty(v);
  }

  isSelected(type: string): boolean {
    return this.selectedTypes.indexOf(type) >= 0;
  }

  toggleType(type: string) {
    const i = this.selectedTypes.indexOf(type);
    if (i >= 0) { this.selectedTypes.splice(i, 1); } else { this.selectedTypes.push(type); }
  }

  get hasFilter(): boolean {
    return !!(this.startDate || this.endDate || this.selectedTypes.length > 0 || this.q.trim());
  }

  // Converts an ion-datetime ISO value (YYYY-MM-DD) into the "DD-Mon-YYYY"
  // format the backend expects (matches serviceticket.service_date storage).
  private formatForApi(isoDate: string): string {
    if (!isoDate) {
      return '';
    }

    const d = new Date(isoDate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = ('0' + d.getDate()).slice(-2);

    return day + '-' + months[d.getMonth()] + '-' + d.getFullYear();
  }

  applyFilter() {
    if (!this.hasFilter) {
      this.searched = false;
      this.items = [];
      return;
    }
    this.searched = true;
    this.load();
  }

  clearFilter() {
    this.q = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedTypes = [];
    this.searched = false;
    this.items = [];
  }

  load() {
    this.loading = true;
    this.storage.get('token').then((val) => {
      const params: any = { token: val.token };

      if (this.startDate) {
        params.start_date = this.formatForApi(this.startDate);
      } else if (this.q.trim()) {
        // searching by text without dates looks through all completed tickets, not only last month and this month
        params.start_date = '01-Jan-2000';
      }
      if (this.endDate) {
        params.end_date = this.formatForApi(this.endDate);
      }
      if (this.selectedTypes.length > 0) {
        params['service_type[]'] = this.selectedTypes;
      }

      this.http.get(SERVER_URL + '/serviceticket/getCompleted', { params: params })
        .subscribe((result: any) => {
          this.items = result;
          this.loading = false;
        }, () => {
          this.items = [];
          this.loading = false;
        });
    });
  }

  page(item) {
    this.navCtrl.push('GensetcompletedetailsPage', item);
  }

}
