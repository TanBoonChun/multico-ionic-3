import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, ViewController, Form } from 'ionic-angular';
import { ElementRef, ViewChild} from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';
/**
 * Generated class for the GoodreceivingnewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-goodreceivingnew',
  templateUrl: 'goodreceivingnew.html',
})
export class GoodreceivingnewPage {
  public signupform: FormGroup;
  public Site_Name: any = "";

  newStartDate:any;
  newEndDate:any;
  newAccomodation:any;
  newTolls:any="";
  newTransportation:any="";
  newOther:any="";
  // newPurpose:any="";
  PartnerName:any;
  TotalDate:any='';
  NoPartner:any;
  Purpose:any;
  Project_Code:any;
  SiteId:any;
  Remarks: any = "";
  radio:any;

  Material:any;
  Unit:any;
  Quantity:any;
  Condition:any;
  SerialNo:any;

  newMaterial:any='';
  newUnit: any='';
  newQuantity:any='';
  newCondition:any='';
  newSerialNo:any='';
  
  inventories:any;
  inventories2:any;
  apps: any;
  asd:any;
  condition:any;
  inputRowValues = [{"SerialNo":""}];
  // serialnos:any;

  public anArray:any=[];
  data:any;

  component:any;
  Component:any;
  inv:any;

  a:string;
  private newQr: any='';
  private new_num: any = 0;
  private namaitem:any;

  constructor(
    public navCtrl: NavController,
    private toastCtrl: ToastController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    private barcode:BarcodeScanner,
    public app: App,
    private viewCtrl: ViewController,
    public http: HttpClient,
    private storage: Storage,
    private cdr: ChangeDetectorRef,
    private toast: Toast,
    public loadingCtrl: LoadingController) {

    this.Material = this.navParams.get('newMaterial');
    this.Quantity = this.navParams.get('newQuantity');
    this.Unit = this.navParams.get('newUnit');
    this.Condition = this.navParams.get('newCondition');
    this.SerialNo = this.navParams.get('newAnArray');
console.log(this.SerialNo);
    let data: Observable<any>;


      // Receiving
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/receiving?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        let inv = result.inventories;
        inv.forEach(function(ele)
        {
          console.log(ele.buncon.split(','));
        });
        this.inventories = result.inventories;
        this.inventories2 = result.inventories;
        this.condition = result.conditions;
      });
    });

      // Receiving
      this.storage.get("token").then((val) => {
        data = this.http.get(
          SERVER_URL + "/getcomponent?token=" + val.token
        );
        data.subscribe((result) => {
          console.log(result);
          this.component = result.component
        });
      });
  }



  getCode(type) {
    this.barcode.scan().then(data => {
      let temp = data.text;
      
     this.newQr=temp;
     this.namaitem=this.Add(temp);

     console.log(data);
     console.log(this.newQr);
    })
  }

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
      if (arr[x]) {
        temp = arr[x];
        return temp[1];

      }
    }
  }

  goTo(){
    console.log('this.anArray',this.anArray);
    this.data=true;
    }
  Add(arr){
    this.a=arr;
    
    this.anArray.push({'value':this.a});
  }

  changeMaterial(value) {
    let arrApps = new Array();

    console.log(this.component.Category)
    for (let app of this.inventories) {
      // console.log(app.Category)
      // console.log(this.Component)
      if(app.Category == this.Component.Category) {
          arrApps.push(app);
      }
    }

    this.inv = arrApps;
    console.log(this.inv)
  }

  changeUnit($event){
    console.log($event)
    // console.log(this.Material.Id)
    if (! $event) {
      return;
    }
    let arrApps = new Array();
    let projectName = '';
    for (let item of this.inventories2) {
      if (item.Id == $event.Id) {
        var b = item.buncon.split(',')
        var c = []
        b.forEach(function(ele)
        {
          if(ele){

            c.push({id:ele})
          }
          // console.log(ele.buncon.split(','));
          

        });
        this.asd = c;
         console.log(this.asd)
        break;
      }
    }
  }
    

  ngOnInit() {
    this.signupform = new FormGroup({
      Purpose: new FormControl("", []),

      Material:new FormControl("",[]),
      Unit:new FormControl("",[]),
      Quantity:new FormControl("",[]),
      Condition:new FormControl("",[]),
      SerialNo:new FormControl("",[]),
      Component:new FormControl("",[]),
 
    });
  }

  noSpace(string){
    this.Site_Name = string.split(' ').join('');
    return string.split(' ').join('');
  }

  setRemarks(event){
    let remarksControl = this.signupform.get("Remarks");

    if(Number.parseFloat(event)> 0){
      remarksControl.setValidators([Validators.required]);
      remarksControl.updateValueAndValidity();
    }

    remarksControl.setValidators(null);
    remarksControl.updateValueAndValidity();
  }

  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
  
    var day = ('0'+ d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + '-' + monthNames[monthIndex] + '-' + year;
  }

  fetchCalculatedDays(value){

    if (this.newEndDate != "" && this.newStartDate != "") {
      this.storage.get('token').then((val) => {
        this.http.get(SERVER_URL + '/fetchCalculatedDays?token=' + val.token + "&Start_Date=" + this.myFunction(this.newStartDate) + "&End_Date=" + this.myFunction(this.newEndDate))
        .subscribe((result : any) => {
          var days = 0;
          this.TotalDate = result;
          console.log(this.TotalDate)
          // this.TotalDate = days;
             
          
          console.log(JSON.stringify(result));  
          
        })
      });
    }

  }

  clickme(){
    this.inputRowValues.push({'SerialNo':""});
    this.cdr.detectChanges();

    console.log(this.inputRowValues)
  }

  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: 'Exit',
      message: 'Are you sure to exit the page? The items would not be saved',
      buttons: [
        {
          text: 'No',
          handler: () => {
        }
        },
        {
          text: 'Yes',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
      ]
    });
    confirm.present();
  }

  presentToastOut() {
    let toast = this.toastCtrl.create({
      message: "No negative value (-)",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "red",
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
    toast.dismiss();
  }

  setPurpose(event) {
    let purposeControl = this.signupform.get("Purpose");

    if (Number.parseFloat(event) > 0) {
      purposeControl.setValidators([Validators.required]);
      purposeControl.updateValueAndValidity();

    }

    purposeControl.setValidators(null);
    purposeControl.updateValueAndValidity();
  }
  
  isObject(variable) {
    return typeof variable === "object";
  }


  closeModal() {
    this.viewCtrl.dismiss();
  }

  submit() {
   
    this.storage.get("token").then((val) => {

      let data = {
        Inventory_Id: this.Material.Id,
        Mat:this.Material.ItemCode,
        Unit: this.Unit.id,
        UnitName:this.Unit,
        Quantity: this.Quantity,
        Status: this.Condition.Option,
        newAnArray: this.anArray,
      };
      console.log(this.anArray)
      // this.storage.set("advancenew", data);
      this.viewCtrl.dismiss(data);

    });
  }

  saje(){
    console.log(this.Material.Id)
    console.log(this.Material)
    console.log(this.Unit.id)
    
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

  assign(a,b)
  {
    console.log(a,b,"here");
  }

}
