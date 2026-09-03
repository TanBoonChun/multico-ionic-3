import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';

import { ClientnewPage } from '../clientnew/clientnew';
import { ClientdetailsPage } from '../clientdetails/clientdetails';
import { SERVER_URL } from '../../environment';
/**
 * Generated class for the CustomerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-client',
  templateUrl: 'client.html',
})
export class ClientPage {

  items: any='';
  userImage:any='';
  clientdetails='ClientdetailsPage';
  item:any;
  Id:any;
  Company_Name:any;
  Company_Code:any;
  CO_No:any;
  Status:any;
  Address:any;
  Email:any;
  Office_No:any;
  Fax_No:any;
  Remarks:any;
  PIC_name:any;
  PIC_no:any;
  s:any='';
  PIC_email:any;
  Remarks2:any='';
  Customer_Of:any='';
  

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: HttpClient,
    private storage: Storage,) {
      // this.loadData();

      // this.Id=this.navParams.get('Id');
      // this.Company_Name=this.navParams.get('Company_Name');
      // this.Company_Code=this.navParams.get('Company_Code');
      // this.CO_No=this.navParams.get('CO_No');
      // this.Status=this.navParams.get('Status');
      // this.Address=this.navParams.get('Address');
      // this.Email=this.navParams.get('Email');
      // this.Office_No=this.navParams.get('Office_No');
      // this.Fax_No=this.navParams.get('Fax_No');
      // this.Remarks=this.navParams.get('Remarks');

      this.s={Id:this.Id,Company_Name:this.Company_Name,PIC_name:this.PIC_name,PIC_no:this.PIC_no, PIC_email:this.PIC_email,Status:this.Status,Remarks2:this.Remarks2,Customer_Of:this.Customer_Of}

      console.log(this.Id)
  }

  ionViewWillEnter(){
    this.loadData();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientPage');
  }

  newclient() {
    this.navCtrl.push('ClientnewPage');
  }

  loadData(){
    let data:Observable<any>;

    // this.storage.get('user').then((val) => {
    //   this.userImage = val.Web_Path;
     
    // });

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getclientdetails?token=' + val.token );
      data.subscribe(result => {
        this.items = result;
      })
    console.log(this.userImage);
    });
  }

}

