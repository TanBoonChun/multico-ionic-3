import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

import { Leavedetail3Page } from '../leavedetail3/leavedetail3';
import { SERVER_URL } from '../../environment';
/**
 * Generated class for the LeaverejectedPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leaverejected',
  templateUrl: 'leaverejected.html',
})
export class LeaverejectedPage {

  public items:any;
  private token: string = '';
  public notifications: any = [];
  leavedetail3 = "Leavedetail3Page";

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: HttpClient,
    public app: App,
    private storage: Storage) {
  }
  
  ionViewDidLoad() {
    console.log('ionViewDidLoad LeaverejectedPage');
  }

  ionViewDidEnter() {
    this.loadData();
  }

  gotoPage(item){
    let nav = this.app.getRootNav();
    nav.push(this.leavedetail3, item)
  }

  loadData(){

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getleavesrejected?token=' + val.token);
      data.subscribe(result => {
        this.items = result;
      })
      this.storage.get('token').then((val) => {
        this.http.get<{badge_count: any, notifications: any}>(SERVER_URL + '/notifications/leaverejected?token=' + val.token).subscribe(result => {
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