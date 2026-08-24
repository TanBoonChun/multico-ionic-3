import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Observable } from 'rxjs';


@IonicPage()
@Component({
  selector: 'page-advancesitenew',
  templateUrl: 'advancesitenew.html',
})
export class AdvancesitenewPage {

  public signupform: FormGroup;
  public Site_Name: any = "";

  newStartDate:any;
  newEndDate:any;
  Amount:any="";
  Project_Code:any;
  Site_Code: any;
  SiteId:any;
  Remarks: any = "";
  Need_Advance: any = false;
  apps: any;
  items: any;

  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    private viewCtrl: ViewController,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public loadingCtrl: LoadingController) {
      this.Project_Code = navParams.get('Project_Code');
      this.SiteId = navParams.get('Site_ID'),
      this.Site_Code = navParams.get('Site_Code'),
      this.newStartDate = this.navParams.get('newStartDate')
      this.newEndDate = this.navParams.get('newEndDate')
      this.Site_Name = this.navParams.get('Site_Name')
      this.Remarks = this.navParams.get('Remarks')
      this.Amount = this.navParams.get('Amount')
      this.Need_Advance = this.navParams.get('Need_Advance') ? true : false;
    }


  ngOnInit() {
    this.signupform = new FormGroup({
      Site_Code: new FormControl("", [Validators.required]),
      newStartDate: new FormControl("", [Validators.required]),
      newEndDate: new FormControl("", [Validators.required]),
      Remarks: new FormControl("", [Validators.required]),
      Amount: new FormControl("", this.Need_Advance ? [Validators.required, Validators.min(0)] : []),
    });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  noSpace(string){
    this.Site_Name = string.split(' ').join('');
    return string.split(' ').join('');
  }

  loadData() {

    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getsitecodes/"+ this.Project_Code + "?token=" + val.token + ""
      );
      data.subscribe((result) => {
        this.apps = result;
      });
    });
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

  newcalculateTotal() {
    if (!this.Need_Advance) {
      return "0";
    }

    var total = Number.parseFloat(this.Amount);

    if (isNaN(total)) {
      total = 0;
    }

    return total.toFixed(2);
  }

  searchApps(event: { component: IonicSelectableComponent; text: string }) {
      let text = event.text.trim().toLowerCase();
      event.component.items = this.apps.filter(a=> a.siteCode.toLowerCase().indexOf(text) !== -1);
      event.component.endSearch();
    }

    siteCode() {
      let data: Observable<any>;
      let selectedProjectCode= this.Project_Code;
      if(typeof selectedProjectCode['Site_Code'] !== 'undefined'){
        let options=selectedProjectCode['Site_Code'].map(function(item){
          let siteCode= "";
          switch(item.Level){
            case 1 :siteCode= item.Department;break;
            case 2 :siteCode= item.Segment;break;
            case 3 :siteCode= item.Contract_No;break;
            case 4 :siteCode= item.PO_No;break;
            case 5 :siteCode= item.Site_ID;break;
          }
          let obj={Id:item['Id'],siteCode:siteCode};
          return obj;
        });
        this.apps =options;
        console.log(this.apps)
      }
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

  isObject(variable) {
    return typeof variable === "object";
  }

  setSiteName(Project_Code) {
    if (typeof Project_Code === "object") {
      let str = "";

      if (Project_Code["Site Id"]) {
        str = Project_Code["Site Id"];
      }

      if (str != "" && Project_Code["Site LRD"]) {
        str = str + " - " + Project_Code["Site LRD"];
      } else if (Project_Code["Site LRD"]) {
        str = Project_Code["Site LRD"];
      }

      if (str != "" && Project_Code["Site Name"]) {
        str = str + " - " + Project_Code["Site Name"];
      } else if (Project_Code["Site Name"]) {
        str = Project_Code["Site Name"];
      }
      this.Site_Name = Project_Code["Site Name"];
    }
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  submitClaim() {

    if(this.Remarks == ""){
      this.displayErrorAlert("Remarks cannot be blank");
      return;
    }

    if (this.Need_Advance && Number.parseFloat(this.newcalculateTotal()) <= 0) {
      this.displayErrorAlert("Amount cannot be 0");

      return;
    }

    this.storage.get("token").then((val) => {

      let data = {
        newStartDate: this.newStartDate,
        newEndDate: this.newEndDate,
        Amount: this.Need_Advance ? this.newcalculateTotal() : "0",
        Site_Name: this.Site_Name,
        Total_Requested: this.newcalculateTotal(),
        Project_Code: this.Project_Code,
        SiteId:this.SiteId,
        Site_Code:this.Site_Code,
        Remarks: this.Remarks,
        Need_Advance: this.Need_Advance,
      };

      this.viewCtrl.dismiss(data);
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

}
