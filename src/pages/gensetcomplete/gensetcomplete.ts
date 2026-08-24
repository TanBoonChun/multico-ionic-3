import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { SERVER_URL } from '../../environment';

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

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private navCtrl: NavController
  ) {}

  ionViewWillEnter() {
    this.load();
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
    this.load();
  }

  clearFilter() {
    this.startDate = '';
    this.endDate = '';
    this.selectedTypes = [];
    this.load();
  }

  load() {
    this.storage.get('token').then((val) => {
      const params: any = { token: val.token };

      if (this.startDate) {
        params.start_date = this.formatForApi(this.startDate);
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
        });
    });
  }

  page(item) {
    this.navCtrl.push('GensetcompletedetailsPage', item);
  }

}
