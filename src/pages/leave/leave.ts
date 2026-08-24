import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the LeavePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-leave',
  templateUrl: 'leave.html',
})

export class LeavePage {

  pendingLeaveBadgeCount: any;
  allLeaveBadgeCount: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private storage: Storage,
    public http: HttpClient
  ){
    this.pendingLeaveBadgeCount = 0;
    this.allLeaveBadgeCount = 0;
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {
    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/leavepending?token=' + val.token).subscribe(result => {
        this.pendingLeaveBadgeCount = result.badge_count;
      })
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/leaveall?token=' + val.token).subscribe(result => {
        this.allLeaveBadgeCount = result.badge_count;
      })
    });
  
  }

  myLeave(){
    this.navCtrl.push("MyleavePage")
  }

  myapproval(){
    this.navCtrl.push("MyapprovalPage")
  }
  leavestatus(){
    this.navCtrl.push("LeavestatusPage")
  }
  
}
