import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, IonicPage } from 'ionic-angular';
import { App } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}


import { Badge } from '@ionic-native/badge';

@IonicPage()

@Component({
  selector: 'page-stock',
  templateUrl: 'stock.html',
})

export class StockPage {


  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private toast: Toast,
    private badge: Badge,

  ) {


  }

  ionViewDidEnter() {
    this.loadData();

  }

  loadData(){
    let data:Observable<any>;

  }

  // badge icon count
  async setBadges(badgeNumber: number) {
    try {
      let badges = await this.badge.set(badgeNumber);
      console.log(badges);
    } catch (e) {
      console.error(e);
    }
  }


  StockReceive(){
    this.navCtrl.push('StockreceivePage')
  }

  StockReturn(){
    // this.navCtrl.push(StockreturnPage)
  }


}
