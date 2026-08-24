import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoodreturnnoteformPage } from '../goodreturnnoteform/goodreturnnoteform';
import { GoodreceivingformPage } from '../goodreceivingform/goodreceivingform';
import { GoodreceivinglistPage } from '../goodreceivinglist/goodreceivinglist';
import { GoodreturnedlistPage } from '../goodreturnedlist/goodreturnedlist';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}


@IonicPage()
@Component({
  selector: 'page-goodmain',
  templateUrl: 'goodmain.html',
})
export class GoodmainPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public http: HttpClient) {
  }


  GRN(){
    this.navCtrl.push(GoodreturnnoteformPage)
  }

  GRF(){
    this.navCtrl.push(GoodreceivingformPage)
  }

  goodreceivinglist(){
    this.navCtrl.push(GoodreceivinglistPage)
  }
  
  goodreturnedlist(){
    this.navCtrl.push(GoodreturnedlistPage)
  }

}
