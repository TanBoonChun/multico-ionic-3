import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController } from 'ionic-angular';
// import { CallNumber } from '@ionic-native/call-number';
import { ClientupdatePage } from '../clientupdate/clientupdate';

/**
 * Generated class for the CustomerdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-clientdetails',
  templateUrl: 'clientdetails.html',
})
export class ClientdetailsPage {

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
  PIC_email:any;
  Remarks2:any;
  Customer_Of:any;
  companyId:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    // private callNumber: CallNumber,
    public app: App,
    public alertCtrl: AlertController,
    ) {
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
    this.companyId=this.navParams.get('companyId');

    

    console.log('Id',this.Id);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ClientdetailsPage');
  }

  // callSupport(): void{
  //   this.callNumber.callNumber(this.Office_No,true);
  // }

  gotoEdit(){
    const confirm = this.alertCtrl.create({
      title: 'DO ypu want to update?',
      message: '',
      buttons: [
        {
          text: 'Update',
          handler: () => {
            let nav = this.app.getRootNav();
            nav.push('ClientupdatePage',{
              Id:this.Id,
              Company_Name:this.Company_Name,
              Company_Code:this.Company_Code,
              CO_No:this.CO_No,
              Status:this.Status,
              Address:this.Address,
              Email:this.Email,
              Office_No:this.Office_No,
              Fax_No:this.Fax_No,
              Remarks:this.Remarks,
              PIC_name:this.PIC_name,
              PIC_no:this.PIC_no,
              PIC_email:this.PIC_email,
              Remarks2:this.Remarks2,
              Customer_Of:this.Customer_Of,
              companyId:this.companyId,
            })
          }
        },
        {
          text: 'Cancel',
          handler:() => {
            console.log('no clicked')
          }
        }
      ]
    });
    confirm.present();
  }

}

