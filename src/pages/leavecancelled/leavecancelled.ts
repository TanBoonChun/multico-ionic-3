import { Component } from '@angular/core';
import { NavController, NavParams, App, IonicPage } from 'ionic-angular';
import { Leavedetail4Page } from '../leavedetail4/leavedetail4';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';
/**
 * Generated class for the LeavecancelledPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leavecancelled',
  templateUrl: 'leavecancelled.html',
})
export class LeavecancelledPage {

  leavedetail4 = "Leavedetail4Page";

  public items:any;
  private token: string = '';
  public notifications: any = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeavecancelledPage');
  }

  ionViewWillEnter() {
    this.loadData();
  }

  gotoPage(item){
    let nav = this.app.getRootNav();
    nav.push(this.leavedetail4, item)
  }


  loadData(){
    
    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getleavescancelled?token=' + val.token);
      data.subscribe(result => {
      this.items = result;
      })
      this.storage.get('token').then((val) => {
        this.http.get<{badge_count: any, notifications: any}>(SERVER_URL + '/notifications/leavecancelled?token=' + val.token).subscribe(result => {
          let that = this
          result.notifications.map(function(value) {
            that.notifications[value.TargetId] = value
          })
  
          console.log(this.notifications)        
        })
      });
    });
  }
 


}
