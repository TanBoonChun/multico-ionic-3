import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  AlertController,
  ToastController,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { NgStyle } from "@angular/common";
import { DealformPage } from "../dealform/dealform";
import { SERVER_URL } from "../../environment";
import { UnassigneddetailsPage } from "../unassigneddetails/unassigneddetails";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@IonicPage()
@Component({
  selector: "page-unassigned",
  templateUrl: "unassigned.html",
})
export class UnassignedPage {
  items: any[];
  userImage: any = "";
  item: any;
  Id: any;
  Company_Name: any;
  Customer_Name: any;
  Contact_No: any;
  Status: any;
  Address: any;
  Email: any;
  Country: any;
  StateRegion: any;
  Remarks: any;
  Type: any;
  custom_type: any;
  Source: any;
  s: any = "";
  topics: string[];
  Created_at:any;
  Priority:any;
  cold_call:any;
  // has_schedule:any;
  searchTerm: string;
  filterItems: any;
  cuslist: any;
  department: any='';
  dealId: any;
  startDate: any;
  endDate: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private toast: ToastController,    
    public http: HttpClient
  ) {
    this.s = {
      Id: this.Id,
      Company_Name: this.Company_Name,
      Customer_Name: this.Customer_Name,
      Contact_No: this.Contact_No,
      Status: this.Status,
      Address: this.Address,
      Email: this.Email,
      Remarks: this.Remarks,
      Country: this.Country,
      StateRegion: this.StateRegion,
      Type: this.Type,
      custom_type: this.custom_type,
      Source: this.Source,
      Created_at:this.Created_at,
      cold_call: this.cold_call,
      department: this.department,
      Priority: this.Priority,
      dealId: this.dealId
    };

    this.department = this.navParams.get('department');
    this.startDate = this.navParams.get('start');
    this.endDate = this.navParams.get('end');

    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad DealPage");
  }

  loadData() {
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: "crescent",
    });
    loading.present();

    let data: Observable<any>;

    // this.storage.get('user').then((val) => {
    //   this.userImage = val.Web_Path;

    // });

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      let url = SERVER_URL + "/getunassigned?token=" + val.token;
      if (this.startDate) url += '&start=' + this.startDate;
      if (this.endDate) url += '&end=' + this.endDate;
      data = this.http.get(url);
      data.subscribe((result) => {
        loading.dismiss();

        this.items = result;

        console.log(result);
      });
    });
  }

  onSearch(event) {
    console.log(event.target.value);
  }

  gen() {
    this.cuslist = this.items;
  }

  onCancel(ev) {
    ev.target.value = "";
    this.loadData();
  }

  getList(ev: any) {
    // this.loadData();
    console.log(ev.target.value);
    // this.gen();

    let serVal = ev.target.value;
    if (serVal && serVal.trim() !== "") {
      this.items = this.items.filter((item) => {
        const companyName = item.Company_Name
          ? item.Company_Name.toLowerCase()
          : "";
        const coNo = item.CO_No ? item.CO_No.toLowerCase() : "";
        const name = item.Name ? item.Name.toLowerCase() : "";

        return (
          companyName.indexOf(serVal.toLowerCase()) > -1 ||
          coNo.indexOf(serVal.toLowerCase()) > -1 ||
          name.indexOf(serVal.toLowerCase()) > -1
        );
      });
    } else {
      this.onCancel(ev);
    }
  }

  goto(s){
    this.navCtrl.push('UnassigneddetailsPage',s)
  }

  deleteUnassign(id: number) {
    let alert = this.alertCtrl.create({
      title: 'Delete Lead',
      message: `Are you sure you want to delete this lead?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.performDeleteUnassign(id);
          }
        }
      ]
    });
    alert.present();
  }

  performDeleteUnassign(id) {
    let loading = this.loadingCtrl.create({
      content: 'Deleting lead...',
      spinner: 'crescent'
    });

    loading.present();

    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/deleteUnassign?token=' + val.token, {
        companyId: id,
      },
        httpOptions)
      .subscribe(
        (res: any) =>{
          this.navCtrl.pop();
          let toast = this.toast.create({
            message: "Lead Deleted",
            position: "middle",
            closeButtonText: "Ok",
            showCloseButton: true,
            cssClass: "red",
          });
  
          toast.present();
          loading.dismiss();
      })
    });
  }
}

