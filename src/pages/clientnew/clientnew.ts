import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { ClientPage } from '../client/client';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the CustomernewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-clientnew',
  templateUrl: 'clientnew.html',
})
export class ClientnewPage {

  CU_Name: any='';
  CO_Name: any='';
  CO_No: any='';
  Office_No: any='';
  Fax_No: any='';
  Email: any='';
  Address: any='';
  Remarks: any='';
  CO_Code: any='';

  PIC_name:any='';
  PIC_no:any;
  PIC_email:any;
  Company:any;

  items:any;
  com:any;
  sales:any;
  Status: any='';
  Company_Name:any='';
  Salesman:any=[];
  cId:any='';

  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    public alertCtrl: AlertController,
    public http: HttpClient,
    private toast: ToastController,  
    public navParams: NavParams) {

    this.Company_Name=this.navParams.get('Company_Name');
    this.cId=this.navParams.get('companyId');
    console.log('Company Name',this.Company_Name)
    console.log('companyId',this.cId)


    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getcompany?token=' + val.token );
      data.subscribe(result => {
        this.com = result;
      })
    });

    // Salesman
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getdownline?token=' + val.token );
      data.subscribe(result => {
        this.sales = result;
      })
    });
  
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientnewPage');
  }

  submit() {
    // let loading = this.loadingCtrl.create({
    //   content: "Submitting schedule application",
    //   spinner: 'crescent'
    // });

    if(this.Status==""){
      this.Status="Active";
    }
    console.log(this.Salesman,'salesman')
  
    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/newclient?token=' + val.token, {
        Status: this.Status,
        PIC_name: this.PIC_name,
        PIC_no: this.PIC_no,
        PIC_email: this.PIC_email,
        companyId: this.Company.Id,
        Remarks: this.Remarks,
        cId: this.cId
     
      },
        httpOptions)
      .subscribe(
        (res: any) =>{
          if(res==1){
          this.navCtrl.pop();
          let toast = this.toast.create({
            message: "New Client Created",
            position: "middle",
            closeButtonText: "Ok",
            showCloseButton: true,
            cssClass: "red",
          });

          toast.present();
        }else{
          var obj = res;
          console.log(obj);
          var errormessage = "";
          for (var item in obj) {
            errormessage = obj[item][0];
          }
          this.displayErrorAlert(errormessage);
                
        }
      })
    });
  }

  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }

  cancel(){
    this.navCtrl.pop();
  }

}

