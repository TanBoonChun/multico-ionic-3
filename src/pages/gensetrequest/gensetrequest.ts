import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GensetrequestPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-gensetrequest',
  templateUrl: 'gensetrequest.html',
})

export class GensetrequestPage {

  private serId: any;
  private reqId: any;
  hideUI: any;

  constructor(
    public navCtrl: NavController, 
    private storage: Storage, 
    private http: HttpClient,
    private toast:Toast,
    private navParam:NavParams,
    private alert:AlertController,
    private barcode:BarcodeScanner
  ) {
    this.serId = this.navParam.get('serId');
    this.reqId = this.navParam.get('reqId');
    console.log(this.serId)
    console.log(this.navParam)
    this.storage.get('token').then(val => {
      this.http.get(SERVER_URL + '/serviceticket/getItemOption?token=' + val.token).subscribe(result => {
        this.itemList = result;
      })
    })
  }

  private item: any;
  private itemList: any;
  private itemName:any;
  private qty: any = 0;
  private count:any=1;
  arr = new Array();

  private newQr: any;
  private new_num: any = 0;
  private namaitem:any;

  add() {
    let checkItemCode=this.arr.filter(a=>a.name == this.newQr);
    if(checkItemCode.length != 0){
      return this.alert.create({
        title:"Error",
        message:"Duplicate item.",
        buttons:['Ok']
      }).present();
    }
    this.arr.push({
      id: this.item,
      qty: this.qty,
      name:this.newQr,
      row:this.count,
      nama:this.namaitem,
    });
    this.item = "";
    this.qty = 0;
    this.count++;
  }

  scanSub: any;
  getItemCode(arr) {
    let temp;
    for (let x = 0, i = arr.length; x < i; x++) {
      if (arr[x].indexOf('Item Code') !== -1) {
        temp = arr[x];
        temp = temp.split(':');
        return temp[1];

      }
    }
  }

  getNamaItem(arr){
    let temp;
    for (let x = 0, i = arr.length; x < i; x++) {
      if (arr[x].indexOf('Item Name') !== -1) {
        temp = arr[x];
        temp = temp.split(':');
        return temp[1];

      }
    }
  }
  getCode(type) {
    this.barcode.scan().then(data => {
      let temp = data.text.split(/\n/);
      
     this.newQr=this.getItemCode(temp);
     this.namaitem=this.getNamaItem(temp);

     console.log(data);
    })
  }

  request() {
    this.hideUI = true;

    this.storage.get('token').then(val => {
      this.http.post(SERVER_URL + '/serviceticket/requestItemtest?token=' + val.token, {item:this.arr,req:this.reqId,serId:this.serId }, {})
      //   .subscribe(result => {
      //     {
      //       this.navCtrl.pop();
      //       console.log(result);
      //       this.toast.show('Success','5000','center').subscribe();
      //     }
      // })  
      .subscribe(
        (res: any) => {
          this.hideUI = false;

          console.log(res)

          if (res == 1) {
            // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
            this.navCtrl.pop();

            this.toast.show('Success', '5000', 'center').subscribe(
              toast => {}
            );
          } else {
            this.toast.show(res, '5000', 'center').subscribe();
          }
        })
    });
  }

  onChange() {
    let filter=this.itemList.filter(i=>i.Id == this.item)
    this.itemName = filter[0].name;
  }

  remove(row){
    let filter=this.arr.filter(a=>a.row != row);
    this.arr=filter;
  }

  calQty(type) {
    if(type == 'add'){
      this.qty += 1;
    }
    if (type == 'minus') {
      if (this.qty != 0) {
        this.qty -= 1;
      }
    }
  }
  
}
