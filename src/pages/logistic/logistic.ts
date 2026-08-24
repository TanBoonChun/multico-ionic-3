import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { LogisticinventorybagPage } from '../Logisticinventorybag/logisticinventorybag';
import { GoodreturnnoteformPage } from '../goodreturnnoteform/goodreturnnoteform';
import { GoodreceivingformPage } from '../goodreceivingform/goodreceivingform';
import { GoodreceivinglistPage } from '../goodreceivinglist/goodreceivinglist';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

@IonicPage()

@Component({
  selector: 'page-logistic',
  templateUrl: 'logistic.html',
})

export class LogisticPage {


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient
  ){
  }
  

  LogisticstockstatusPage(){
    // this.navCtrl.push(LogisticstockstatusPage);
  }

  LogisticdostatusPage(){
    // this.navCtrl.push(LogisticdostatusPage);
  }
  
  LogisticinventorybagPage(){
    this.navCtrl.push(LogisticinventorybagPage)
  }

  Stock(){
    this.navCtrl.push('StockPage')
  }

  GRN(){
    this.navCtrl.push(GoodreturnnoteformPage)
  }

  GRF(){
    this.navCtrl.push(GoodreceivingformPage)
  }

  STO(){
    this.navCtrl.push("StoPage")
  }

  goodreceivinglist(){
    this.navCtrl.push(GoodreceivinglistPage)
  }

  GoodMain(){
    this.navCtrl.push('GoodmainPage')
  }

  Replacement(){
    this.navCtrl.push('ReplacementmainPage')
  }

  Vehicle(){

    this.navCtrl.push('VehiclehomePage')
  }

}
