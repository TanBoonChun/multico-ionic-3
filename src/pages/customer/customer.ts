import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
} from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";

import { CustomernewPage } from "../customernew/customernew";
import { CustomerdetailsPage } from "../customerdetails/customerdetails";
import { interval } from "rxjs/observable/interval";
import { SERVER_URL } from "../../environment";
/**
 * Generated class for the CustomerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-customer",
  templateUrl: "customer.html",
})
export class CustomerPage {
  items: any[];
  userImage: any = "";
  customerdetails = 'CustomerdetailsPage';
  item: any;
  Id: any;
  Company_Name: any;
  Company_Code: any;
  Contact_No: any;
  CO_No: any;
  Status: any;
  Address: any;
  Email: any;
  Office_No: any;
  Fax_No: any;
  Remarks: any;
  PIC_name: any;
  PIC_no: any;
  s: any = "";
  topics: string[];

  searchTerm: string;
  filterItems: any;
  cuslist: any;

  type: string;
  department: any='';
  startDate: any;
  endDate: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public http: HttpClient,
    private storage: Storage
  ) {
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

    this.s = {
      Id: this.Id,
      Company_Name: this.Company_Name,
      Company_Code: this.Company_Code,
      Contact_No: this.Contact_No,
      CO_No: this.CO_No,
      Status: this.Status,
      Address: this.Address,
      Email: this.Email,
      Office_No: this.Office_No,
      Fax_No: this.Fax_No,
      Remarks: this.Remarks,
      PIC_name: this.PIC_name,
      PIC_no: this.PIC_no,
    };

    this.type = this.navParams.get('type');
    this.startDate = this.navParams.get('start');
    this.endDate = this.navParams.get('end');
    // this.generateTopics();
    this.gen();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CustomerPage");
    this.loadData();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  newcustomers() {
    this.navCtrl.push('CustomernewPage');
  }

  loadData() {
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: "crescent",
    });
    loading.present();

    let data: Observable<any>;

    this.storage.get('user').then((val) => {
      this.department = val.Department;

    });
    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      let url = SERVER_URL + "/getcustomerdetails?token=" + val.token + '&type=' + this.type;
      if (this.startDate) url += '&start=' + this.startDate;
      if (this.endDate) url += '&end=' + this.endDate;
      data = this.http.get(url);
      data.subscribe((result) => {
        loading.dismiss();
        this.items = result;
      });
      console.log(this.items);
    });
  }

  onSearch(event) {
    console.log(event.target.value);
  }

  // generateTopics() {
  //   this.topics = [
  //     'Storage in Ionic 2',
  //     'Ionic 2 - calendar',
  //     'Creating a Android application using ionic framework.',
  //     'Identifying app resume event in ionic - android',
  //     'What is hybrid application and why.?',
  //     'Procedure to remove back button text',
  //     'How to reposition ionic tabs on top position.',
  //     'Override Hardware back button in cordova based application - Ionic',
  //     'Drupal 8: Enabling Facets for Restful web services',
  //     'Drupal 8: Get current user session',
  //     'Drupal 8: Programatically create Add another field - Example',
  //   ];
  // }

  // getTopics(ev: any) {
  //   this.generateTopics();
  //   let serVal = ev.target.value;
  //   if (serVal && serVal.trim() != '') {
  //     this.topics = this.topics.filter((topic) => {
  //       return (topic.toLowerCase().indexOf(serVal.toLowerCase()) > -1);
  //     })
  //   }
  // }

  gen() {
    this.cuslist = this.items;
  }

  onCancel(ev) {
    // Reset the field
    ev.target.value = "";
    this.loadData();
  }

  getList(ev: any) {
    // this.loadData();
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

  goto(s) {
    this.navCtrl.push('CustomerdetailsPage', {...s, department: this.department});
  }
}

