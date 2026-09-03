import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { SERVER_URL } from '../../environment';

@IonicPage()
@Component({
  selector: 'page-crm',
  templateUrl: 'crm.html',
})
export class CrmPage {

  department: any = '';

  scheduleStats = {
    plan: 0,
  };

  dealStats = {
    new: 0,
    pending: 0,
    opportunity: 0,
    dealed: 0,
    lost: 0,
    void: 0,
  };

  leadStats = {
    unassigned: 0,
    currentyear: 0,
    currentmonth: 0,
  };

  constructor(
    public navCtrl: NavController,
    public storage: Storage,
    public http: HttpClient,
    public loadingCtrl: LoadingController,
  ) {}

  ionViewWillEnter() {
    this.loadDashboardStats();
  }

  doRefresh(refresher) {
    this.loadDashboardStats();

    setTimeout(() => {
      refresher.complete();
    }, 3000);
  }

  loadDashboardStats() {
    let loading = this.loadingCtrl.create({
      content: 'Loading content',
      spinner: 'crescent',
    });
    loading.present();

    this.storage.get('user').then((user) => {
      this.department = user ? user.Department : '';
    });

    this.storage.get('token').then((val) => {
      this.http.get(SERVER_URL + '/getAllDashboardStats?token=' + val.token)
        .subscribe(
          (result: any) => {
            loading.dismiss();

            if (result.success) {
              this.scheduleStats = result.data.schedules;
              this.dealStats = result.data.deals;
              this.leadStats = result.data.leads;
            } else {
              console.log('Error loading dashboard data');
            }
          },
          (error) => {
            loading.dismiss();
            console.error('Error loading dashboard:', error);
          }
        );
    });
  }

  navigateToSchedule() {
    this.navCtrl.push('SchedulePage');
  }

  navigateToDeals(status: string) {
    this.navCtrl.push('DealPage', { status: status, type: '', department: this.department });
  }

  navigateToUnassigned() {
    this.navCtrl.push('UnassignedPage', { department: this.department });
  }

  navigateToLeads(type: string) {
    this.navCtrl.push('CustomerPage', { type: type });
  }

  goToMyTeam() {
    this.navCtrl.push('MyteamPage');
  }

  goToLead() {
    this.navCtrl.push('CustomerPage', { type: '' });
  }

}
