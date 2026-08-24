import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,LoadingController, ToastController } from 'ionic-angular';
import { QRCodeModule } from 'angularx-qrcode';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the VehiclehomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-vehiclehome',
  templateUrl: 'vehiclehome.html',
})
export class VehiclehomePage {
  public myAngularxQrCode: string = null;
  public qrcode : any;
  public vehicledetails = 'VehicledetailsPage';
  public myvehicles : any = [];
  public me : any = [];
  vec:any=[];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private barcode: BarcodeScanner,
    public alertCtrl : AlertController,
    public http: HttpClient,
    private storage: Storage,
    public toast: ToastController,
    public loading : LoadingController,
  ) {
    this.myAngularxQrCode = "A";
  }

  ionViewWillEnter() {
    this.loadData();
  }

  getCode() {
    this.barcode.scan().then(data => {
      let qr2 = data.text.split("\n");
      let owner = qr2[2].split(':')[1];
      this.qrcode = qr2[0].split(':')[1];

      if (!this.qrcode) {
        const alert = this.alertCtrl.create({
          title: "Error",
          subTitle: "Incorrect QR",
          buttons:['OK']
        });
        alert.present();
      }
      else if(owner){
        let loading=this.loading.create({content:"Please Wait..."});
        loading.present();
        
        this.storage.get('token').then((val) => {
          this.http.post('http://crm.midascom.my/api/asset/updateVehicle?token=' + val.token,
            {
                Id : this.qrcode,
                Type : 'Transfer',
                Src : "Scan",
                Remarks : ""
            },{})
          .subscribe(
            (res: any) =>{
              loading.dismiss();
              this.showToast('Success');
            }, (error) => {
              let msg = error.error.error;
              loading.dismiss();
              this.showToast(msg);
            }
          )
        });
      }
      else{
        this.navCtrl.push('VehicledetailsPage',{Id:this.qrcode,type:'scan'});
      }

    })
  }

  loadData(){
    this.storage.get('token').then((val) => {
      this.http.get('http://crm.midascom.my/api/asset/getMyVehicles?token=' + val.token)
      .subscribe( (result:any) => {
          this.myvehicles = result;
      })
    });

    this.storage.get('user').then((val) => {
      this.me = val;
    });

    this.storage.get('token').then((val) => {
      this.http.get(SERVER_URL + '/getVehicle?token=' + val.token)
      .subscribe( (result:any) => {
          this.vec = result;
      })
    });
  }

  showToast(message)
  {
    this.toast.create({
      message: message,
      duration: 3000
    }).present();
  }

}
