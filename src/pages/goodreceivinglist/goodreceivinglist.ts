import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoodreceivingdetailsPage } from '../goodreceivingdetails/goodreceivingdetails';
import { SERVER_URL } from '../../environment';
/**
 * Generated class for the GoodreceivinglistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-goodreceivinglist',
  templateUrl: 'goodreceivinglist.html',
})
export class GoodreceivinglistPage {
  
  a:any='';
  b:any='';
  cuslist:any;

  constructor(
    public navCtrl: NavController, 
    public http: HttpClient,
    public navParams: NavParams,
    public storage: Storage) {
      this.loadData();
  }

  loadData(){
    let data: Observable<any>;


    // Receiving
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getreceivinglist?token=" + val.token
      );
      data.subscribe((result) => {
        // console.log(result);
        // let inv = result.inventories;
        // inv.forEach(function(ele)
        // {
        //   console.log(ele.buncon.split(','));
        // });
        // this.inventories = result.inventories;
        // this.inventories2 = result.inventories;
        // this.a = result.mysto;
        this.b = result.list;
      });
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GoodreceivinglistPage');
  }

  ionViewWIllEnter(){
    this.loadData();
  }

  goToReceivingDetail(item){
    this.navCtrl.push(GoodreceivingdetailsPage,item)
  }

  onCancel(ev) {
    // Reset the field
    console.log('reset')
    ev.target.value = '';
    this.loadData();
  }

  gen(){
    this.cuslist = this.b;
  }

  getList(ev: any) {
    console.log(ev.target.value);
    this.gen();
    let serVal = ev.target.value;
    console.log(serVal)
    if (serVal && serVal.trim() != '') {
      this.b = this.b.filter((item) => {
        return (
          item.Type.toLowerCase().indexOf(serVal.toLowerCase()) > -1 ||
          item.Receiving_No.toLowerCase().indexOf(serVal.toLowerCase()) > -1 || 
          item.Company.toLowerCase().indexOf(serVal.toLowerCase()) > -1 || 
          item.Ownership.toLowerCase().indexOf(serVal.toLowerCase()) > -1 || 
          item.Vendor_Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1)
      })
    }else{
      this.onCancel(ev);
    }
  }

}
