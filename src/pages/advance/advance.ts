import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

@IonicPage()

@Component({
  selector: 'page-advance',
  templateUrl: 'advance.html',
})
export class AdvancePage {

  public pendingAdvanceBadgeCount: any;
  public approvedAdvanceBadgeCount: any;
  public rejectedAdvanceBadgeCount: any;
  financeAdvanceBadgeCount:any;
  paymentDoneBadgeCount:any;
  user:any='';
  advCount:any=''
  myAppCount:any=''

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public http: HttpClient
  ){
    this.pendingAdvanceBadgeCount = 0;
    this.approvedAdvanceBadgeCount = 0;
    this.rejectedAdvanceBadgeCount = 0;
    this.paymentDoneBadgeCount = 0;
    this.financeAdvanceBadgeCount = 0;
    this.advCount=0;
    this.myAppCount = 0;
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {
    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/advancepending?token=' + val.token).subscribe(result => {
        this.pendingAdvanceBadgeCount = result.badge_count;
      })
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/advanceapproved?token=' + val.token).subscribe(result => {
        this.approvedAdvanceBadgeCount = result.badge_count;

      })
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/advancerejected?token=' + val.token).subscribe(result => {
        this.rejectedAdvanceBadgeCount = result.badge_count;

      })
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/advancepaymentdone?token=' + val.token).subscribe(result => {
        this.paymentDoneBadgeCount = result.badge_count;

      })
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/financeAdvance?token=' + val.token).subscribe(result => {
        this.financeAdvanceBadgeCount = result.badge_count;

      })
    });
    
    let data:Observable<any>;

    this.storage.get('token').then((val) => {
      data=this.http.get(SERVER_URL + '/getuser?token=' + val.token)
      data.subscribe(result => {
        this.user = result;
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/advancemanagement?token=' + val.token );
      data.subscribe(result => {
        console.log(result);
          this.advCount = result.count;
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getmyadvance2?token=' + val.token );
      data.subscribe(result => {
        console.log(result);
          this.myAppCount = result.Appcount;
      })
    });


  }

  advanceSite(){
    this.navCtrl.push('AdvancesitePage')
  }


  advancePending(){
    this.navCtrl.push('AdvancependingPage')
  }

  advanceApproved(){
    this.navCtrl.push('AdvanceapprovedPage')
  }

  advanceRejected(){
    this.navCtrl.push('AdvancerejectedPage')
  }

  advancemanagementPending(){
    this.navCtrl.push('AdvancemanagementpendingPage')
  }

  advancemanagementApproved(){
    this.navCtrl.push('AdvancemanagementapprovedPage')
  }

  advancemanagementRejected(){
    this.navCtrl.push('AdvancemanagementrejectedPage')
  }

  advancePaymentDone(){
    this.navCtrl.push('AdvancepaymentdonePage')
  }

  advancefinanceready(){
    this.navCtrl.push('AdvancefinancereadyPage')
  }

}