import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
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
  selector: 'page-customerupdate',
  templateUrl: 'customerupdate.html',
})
export class CustomerupdatePage {

  CU_Name: any='';
  CO_Name: any='';
  CO_No: any='';
  Office_No: any='';
  Fax_No: any='';
  Email: any='';
  Address: any='';
  Remarks: any='';
  CO_Code: any='';
  Status: any='';
  Id:any;
  Company_Name:any;
  Company_Code:any;
  PIC_name:any;
  PIC_no:any;

  compareWith : any ;
  MyDefaultYearIdValue : string ;

  signup={
    state:0
  }

  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    public http: HttpClient,
    private toast: ToastController,  
    public navParams: NavParams) {

        this.Id=this.navParams.get('Id');
        this.CO_Name=this.navParams.get('Company_Name');
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

        console.log('Id',this.Id)
        console.log('CO COde',this.Company_Code)


  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerupdatePage');
  }

  act:any[]=[
    {
      id:1,
      name:'Active'
    },
    {
      id:2,
      name:'Inactive'
    }
  ];

  checkups(): string[] {
    return [
      "foo",
      "bar",
      "baz"
    ];
  }

  checkup: string = "bar";

  logChosen(): void {
    console.log(this.checkup);
  }


  compareWithFn(o1, o2) {
    return o1 === o2;
  };



  submit() {
    // let loading = this.loadingCtrl.create({
    //   content: "Submitting schedule application",
    //   spinner: 'crescent'
    // });

    if(this.Status == "")
    {
      this.Status = "Active";
    }
  
    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/updatecustomer?token=' + val.token, {
      status: this.Status,
      company_name: this.CO_Name,
      co_no: this.CO_No,
      office_no: this.Office_No,
      fax_no: this.Fax_No,
      email: this.Email,
      address: this.Address,
      remarks: this.Remarks,
      Id:this.Id
      },
        httpOptions)
      .subscribe(
        (res: any) =>{
        //   this.navCtrl.pop();
        this.navCtrl.pop();
          let toast = this.toast.create({
            message: "Customer Updated",
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

