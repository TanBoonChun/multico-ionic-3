import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
// import { QRScanner,QRScannerStatus } from '@ionic-native/qr-scanner';
import { Platform } from 'ionic-angular/platform/platform';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Toast } from '@ionic-native/toast';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GensetrequestconfirmationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-logisticrequestconfirm',
  templateUrl: 'logisticrequestconfirm.html',
})
export class LogisticrequestconfirmPage {
  // private items: any;
  private reqId: any;
  private qty: any=0;
  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, private http: HttpClient,
    private navParam: NavParams, private alert: AlertController,
    // private qrScanner: QRScanner,
    private platform: Platform, private zone: NgZone,
    private loading:LoadingController,
    private barcode: BarcodeScanner,
    private toast:Toast) {

  }

  // ionApp = <HTMLElement>document.getElementsByTagName('ion-app')[0];
  // scanSub: any;
  // private qr: any;
  getItemCode(arr) {
    let temp;
    for (let x = 0, i = arr.length; x < i; x++) {
      if (arr[x].indexOf('barcode') !== -1) {
        temp = arr[x];
        temp = temp.split(':');
        return temp[1];
      }
    }
  }
  arr = [];
  add() {
    this.qty += 1;
  }
  minus() {
    if (this.qty != 0) {
      this.qty -= 1;
    }
  }
  private hide:boolean=true;
  temp: any;
  addConfirmItem() {
    const index = this.items.findIndex((e) => e.barcode === this.temp.barcode);
    this.items[index].checked=true;
    this.arr.push({
      id:this.temp.Id,
      qty: this.qty,
      reqItemId: this.temp.reqItemId,
      reqId:this.temp.reqId
    })
    this.hide = true;
    this.qty = 0;
    this.temp=null;
    console.log(this.arr);
  }

  qrCode(){
    this.barcode.scan().then(data => {
      let code=data.text.split(/\n/);
      code = this.getItemCode(code).split(' ')[1];
      let filter = this.items.filter(function (i) { console.log(code); return i.barcode.indexOf(code) !== -1});
      if (filter) {
        this.hide = false;
        this.qty = parseInt(filter[0].Qty);
        this.temp = filter[0];

      } else {
        const error = this.alert.create({
          title: "Error",
          message: "The code is not in the list..Please Scan the correct qr"
        });
        error.present();
      }

    }).catch(err => {
      const error = this.alert.create({
        title: "Error",
        message: "Something went wrong.."
      });
      error.present();
     });
  }

  submit() {
    const alt = this.alert.create({
      title: "Confirmation",
      message:'Are you sure you want to confirm this items?',
      buttons: [
        {
          text: "Cancel",
          role:'cancel'
        },
        {
          text: "Confirm",
          handler: () => {
            this.storage.get('token').then(data => {
              this.http.post(SERVER_URL + '/serviceticket/updateRequisition?token='+data.token,{arr:this.arr,type:"Confirmed"}).subscribe(result => {
                if(result > 0){
                  console.log(result);
                  
                  // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
                  this.navCtrl.pop();
                  this.toast.show('Success', '6000', 'center');
                }
              },
              err=>{
                const alert=this.alert.create({
                  title:"Error",
                  subTitle:"Something went wrong...",
                  buttons:['OK']
                });
                alert.present();
              });
            });
          }
        }
      ]
    })
    // if (this.items.length == this.arr.length) {
      alt.present();
    // } else {
    //   const error = this.alert.create({
    //     title: "Error",
    //     message:"Must confirmed for all items",
    //     buttons:['OK']
    //   })
    //   error.present();
    // }
  }
  
  ionViewWillEnter() {
    this.reqId = this.navParam.data;
    this.storage.get('token').then(data => {
      this.http.get(SERVER_URL + '/serviceticket/getRequisitionItems?token=' + data.token, {
        params: {
          reqId: this.reqId,
          status:'Prepared',
          type:'Prepared',
        }
        }).subscribe(result => {
        // this.items = result;
        console.log(result);
      })
    })
  }

  items:any[]=[
        {
            id:1,
            model: "Gascet",
            name: "Gascet 20mm",
            barcode: "ETF20010",
            qty: 2
        },
        {
            id:2,
            model: "Filter",
            name: "Oil filter cap",
            barcode: "EG25010",
            qty: 4
        },
        {
            id:3,
            model: "Skrew",
            name: "Philips 10mm",
            barcode: "FGT29030",
            qty: 2
        },
    ]
  



}
