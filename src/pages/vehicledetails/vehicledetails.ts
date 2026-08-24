import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,ToastController, LoadingController, ModalController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the VehicledetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

@IonicPage()
@Component({
  selector: 'page-vehicledetails',
  templateUrl: 'vehicledetails.html',
})
export class VehicledetailsPage {
  public vehicle : any;
  public Id : any;
  public type : any;
  public myAngularxQrCode : any = "Id:";
  public transaction : any = [{Date:"12-Jan-2021",Type:"Return",Details:"Return from ABC",Class:"success"}];
  public me : any;
  public Remarks : any;
  public transacType : any;
  public UserId2 : any;
  public permission : boolean = false;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: HttpClient,
    private storage: Storage,
    public alertCtrl: AlertController,
    public toast: ToastController,
    public loading : LoadingController,
    public modal : ModalController
    ) {
      this.Id = this.navParams.get('Id');
      this.type = this.navParams.get('type');
      this.permission = this.navParams.get('permission') ? this.navParams.get('permission') : false;
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData(){
    this.storage.get('token').then((val) => {
      this.http.get(SERVER_URL + '/getVehicle??token=' + val.token, { 'params' : {Id:this.Id} })
      .subscribe( (result:any) => {
          // let owner = this.me.UserId == result.vehicle.holder ? true : false;
          this.vehicle = result;
          this.myAngularxQrCode = "Vehicle_No:"+this.vehicle.Car_No+"\n";
          this.transaction = result.transaction;
          console.log(this.vehicle,'baba')
      })
    });

    this.storage.get('user').then((val) => {
        this.me = val;
    });
  }

  openModal(type)
  {
    this.transacType = type;
    let modal = this.modal.create('VehicletransferPage', {
      'type' : this.transacType
    });
    modal.present();
    modal.onDidDismiss(data => {
      if(data)
      {
        this.Remarks = data.Remarks;
        this.UserId2 = data.UserId2;
        this.submit();
      }
    });
  }

  submit()
  {
      let loading=this.loading.create({content:"Please Wait..."});
      loading.present();
      
      this.storage.get('token').then((val) => {
        this.http.post('http://crm.midascom.my/api/asset/updateVehicle?token=' + val.token,
          {
              Id : this.Id,
              UserId2 : this.UserId2,
              Remarks : this.Remarks,
              Type : this.transacType,
              Src : "Manual"
          },{})
        .subscribe(
          (res: any) =>{
            loading.dismiss();
            this.showToast('Success',1);
          }, (error) => {
            let msg = error.error.error;
            loading.dismiss();
            this.showToast(msg);
          }
        )
      });
  }

  showToast(message,leave = null)
  {
    this.toast.create({
      message: message,
      duration: 3000
    }).present();

    if(leave)
    {
      this.navCtrl.push('VehiclehomePage');
    }
  }

}
