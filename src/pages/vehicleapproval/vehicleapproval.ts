import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,ToastController, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

/**
 * Generated class for the VehicleapprovalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-vehicleapproval',
  templateUrl: 'vehicleapproval.html',
})
export class VehicleapprovalPage {
  public approvals : any;
  public vehicle : any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: HttpClient,
    private storage: Storage,
    public alertCtrl: AlertController,
    public toast: ToastController,
    public loading : LoadingController
    ) {
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData(){
    this.storage.get('token').then((val) => {
      this.http.get('http://crm.midascom.my/api/asset/getVehicleApproval?token=' + val.token, {})
      .subscribe( (result:any) => {
          this.approvals = result;
          console.log(this.approvals);
      })
    });

  }

  show(item)
  {
    let prompt = this.alertCtrl.create({
      title: 'Approve',
      message: "Are you sure to proceed ?",
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: data => {
            this.submit(item);
          }
        }
      ]
    });
    prompt.present();
  }

  submit(item)
  {
      let loading=this.loading.create({content:"Please Wait..."});
      loading.present();
      
      this.storage.get('token').then((val) => {
        this.http.post('http://crm.midascom.my/api/asset/approveVehicle?token=' + val.token,
          item,{})
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
      this.loadData();
    }
  }
}
