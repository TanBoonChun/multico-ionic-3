import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
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
 * Generated class for the clientupdate page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-clientupdate',
  templateUrl: 'clientupdate.html',
})
export class ClientupdatePage {

  CU_Name: any='';
  CO_Name: any='';
  CO_No: any='';
  Office_No: any='';
  Fax_No: any='';
  Email: any='';
  Address: any='';
  Remarks: any='';
  CO_Code: any='';

  PIC_name:any;
  PIC_no:any;
  PIC_email:any;
  Company:any;

  items:any;
  com:any;
  sales:any;
  Status: any='';
  Company_Name:any='';
  Salesman:any='';
  cId:any='';

  Id:any;
  Company_Code:any;
  Remarks2:any;
  Customer_Of:any;
  companyId:any;

  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    public http: HttpClient,
    private toast: ToastController,  
    public navParams: NavParams) {

    // this.Company_Name=this.navParams.get('Company_Name');
    this.cId=this.navParams.get('companyId');
    this.Id=this.navParams.get('Id');
    this.Company_Name=this.navParams.get('Company_Name');
    this.Company_Code=this.navParams.get('Company_Code');
    this.CO_No=this.navParams.get('CO_No');
    this.Status=this.navParams.get('Status');
    this.Address=this.navParams.get('Address');
    this.Email=this.navParams.get('Email');
    this.Office_No=this.navParams.get('Office_No');
    this.Fax_No=this.navParams.get('Fax_No');
    this.Remarks=this.navParams.get('Remarks');
    this.PIC_name=this.navParams.get('PIC_name');
    this.PIC_no=this.navParams.get('PIC_no');
    this.PIC_email=this.navParams.get('PIC_email');
    this.Remarks2=this.navParams.get('Remarks2');
    this.Customer_Of=this.navParams.get('Customer_Of');
    

    console.log('Company Name',this.Company_Name)
    console.log('companyId',this.cId)
    console.log('Id',this.Id)


    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getCompany?token=' + val.token );
      data.subscribe(result => {
        this.com = result.company;
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
    console.log('ionViewDidLoad ClientupdatePage');
  }

  submit() {
    // let loading = this.loadingCtrl.create({
    //   content: "Submitting schedule application",
    //   spinner: 'crescent'
    // });

    if(this.Status==""){
      this.Status="Active";
    }
  
    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/updateclient?token=' + val.token, {
        Status: this.Status,
        PIC_name: this.PIC_name,
        PIC_no: this.PIC_no,
        PIC_email: this.PIC_email,
        companyId: this.Company,
        Remarks: this.Remarks,
        Customer_Of: this.Salesman,
        cId: this.cId,
        Id:this.Id
     
      },
        httpOptions)
      .subscribe(
        (res: any) =>{
        this.navCtrl.pop();
        let toast = this.toast.create({
          message: "New Client Created",
          position: "middle",
          closeButtonText: "Ok",
          showCloseButton: true,
          cssClass: "red",
        });

        toast.present();
      })
    });
  }

  cancel(){
    this.navCtrl.pop();
  }

}

