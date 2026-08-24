import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LeavependingPage } from '../leavepending/leavepending';
import { LeaverejectedPage } from '../leaverejected/leaverejected';
import { LeavecancelledPage } from '../leavecancelled/leavecancelled';
import { LeaveapprovePage } from '../leaveapprove/leaveapprove';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the LeavestatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-leavestatus',
  templateUrl: 'leavestatus.html',
})
export class LeavestatusPage {
tab1:any;
tab2:any;
tab3:any;
tab4:any;
approvedLeaveBadgeCount: any;
rejectedLeaveBadgeCount: any;
cancelledLeaveBadgeCount: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private storage: Storage,
    public http: HttpClient) {
    this.tab1 = "LeavependingPage";
    this.tab2 = "LeaveapprovePage";
    this.tab3 = "LeaverejectedPage";
    this.tab4 = "LeavecancelledPage";
    this.approvedLeaveBadgeCount = 0;
    this.rejectedLeaveBadgeCount = 0;
    this.cancelledLeaveBadgeCount = 0;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeavestatusPage');
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {
    
    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/leaveapproved?token=' + val.token).subscribe(result => {
        this.approvedLeaveBadgeCount = result.badge_count > 0 ? result.badge_count : null;
      
      })
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/leaverejected?token=' + val.token).subscribe(result => {
        this.rejectedLeaveBadgeCount = result.badge_count > 0 ? result.badge_count : null;
      
      })
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/leavecancelled?token=' + val.token).subscribe(result => {
        this.cancelledLeaveBadgeCount = result.badge_count > 0 ? result.badge_count : null;
      
      })
    });

  }

}
