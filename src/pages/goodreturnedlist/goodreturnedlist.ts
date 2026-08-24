import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoodreturneddetailsPage } from '../goodreturneddetails/goodreturneddetails';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GoodreturnedlistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

// @IonicPage()
@Component({
  selector: 'page-goodreturnedlist',
  templateUrl: 'goodreturnedlist.html',
})
export class GoodreturnedlistPage {
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
        SERVER_URL + "/getreturnedlist?token=" + val.token
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

  goToReturnedDetail(item){
    this.navCtrl.push(GoodreturneddetailsPage,item)
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