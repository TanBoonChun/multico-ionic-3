import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { DealdetailsPage } from '../dealdetails/dealdetails';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { NgStyle } from '@angular/common';
import { DealformPage } from '../dealform/dealform';
import { SERVER_URL } from '../../environment';
import { CustomernewPage } from '../customernew/customernew';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the DealPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-deal',
  templateUrl: 'deal.html',
})
export class DealPage {

  dealdetailspage = DealdetailsPage;
  dealformpage = DealformPage;
  item:any;
  Id:any;
  Status:any;
  Status_Details:any;
  Company_Name:any;
  Customer_Name:any;
  Contact_No:any;
  Email:any;
  Address:any;
  PO_No:any;
  PO_Date:any;
  PO_Amount:any;
  PO_Remarks:any;
  Quotation_No:any;
  Quotation_Date:any;
  Quotation_Amount:any;
  scheduleid:any;
  Name:any;
  cuslist:any;
  Lost_Cause:any;
  Lost_Remarks:any;
  Void_Remarks:any;
  //added by Hau 20240328
  Created_at:any;
  Remarks:any;
  Priority:any;
  Potential:any;
  Award_Date:any;
  Delivery_Period:any;
  Forecast_Amount:any;
  Currency:any;
  Business_Type:any;
  Stage:any;
  Progress_Log:any;
  cold_call:any;
  Source:any;
  has_schedule:any;

  public items: any[] = [];      // displayed list
  public allitems: any[] = [];   // all deals from API
  public status: string = 'All'; // currently selected status
  public statuses: string[] = ['All', 'New', 'Pending', 'Opportunity', 'Dealed', 'Lost', 'Void']; // example statuses

  dealStatus: string; // passed from home.ts
  type: string;
  department: any='';
  startDate: any;
  endDate: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private toast: ToastController,
    public http: HttpClient,
  ){ 
    // this.loadData();
    this.item={
      Id:this.Id,
      Status:this.Status,
      Status_Details:this.Status_Details,
      Company_Name:this.Company_Name,
      Customer_Name:this.Customer_Name,
      PO_No:this.PO_No,
      PO_Date:this.PO_Date,
      PO_Amount:this.PO_Amount,
      PO_Remarks:this.PO_Remarks,
      Quotation_No:this.Quotation_No,
      Quotation_Date:this.Quotation_Date,
      Quotation_Amount:this.Quotation_Amount,
      scheduleid:this.scheduleid,
      cold_call:this.cold_call,
      department:this.department,
      has_schedule:this.has_schedule,
        //added by Hau 20240328
      Created_at:this.Created_at,
      Remarks:this.Remarks,
      Priority:this.Priority,
      Potential:this.Potential,
      Award_Date:this.Award_Date,
      Delivery_Period:this.Delivery_Period,
      Forecast_Amount:this.Forecast_Amount,
      Currency:this.Currency,
      Business_Type:this.Business_Type,
      Stage:this.Stage,
      Progress_Log:this.Progress_Log,
      Source:this.Source,
      Contact_No:this.Contact_No,
      Email:this.Email,
      Address:this.Address,
      Lost_Cause:this.Lost_Cause,
      Lost_Remarks:this.Lost_Remarks,
      Void_Remarks:this.Void_Remarks
      //added by Hau 20240328
    }
    
    this.dealStatus = this.navParams.get('status') || 'All';
    this.type = this.navParams.get('type');
    this.department = this.navParams.get('department');
    this.startDate = this.navParams.get('start');
    this.endDate = this.navParams.get('end');
    console.log(this.department)
    this.loadData();
    this.gen();
    
  }

  doRefresh(refresher) {
    this.loadData();

    setTimeout(() => {
      refresher.complete();
    }, 3000);
  }

  ionViewWillEnter(){
    this.loadData();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DealPage');
  }

  loadData(){
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: 'crescent'
    });
    loading.present();

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      let url = SERVER_URL + '/getdeal?token=' + val.token + '&type=' + this.type;
      if (this.startDate) url += '&start=' + this.startDate;
      if (this.endDate) url += '&end=' + this.endDate;

      data = this.http.get(url);
      data.subscribe((result: any) => {
        loading.dismiss();

        this.items = result.deals;
        this.allitems = result.deals;

        if (!this.startDate) {
          this.startDate = result.start;
        }
        if (!this.endDate) {
          this.endDate = result.end;
        }
        
        if (this.dealStatus && this.dealStatus !== 'All') {
          this.items = this.allitems.filter(item => item.status === this.dealStatus);
          this.status = this.dealStatus; // set dropdown/current filter
        } else {
          this.items = this.allitems;
          this.status = 'All';
        }
      })
    });
  }

  getLeadAging(item): string {
    if (!item.Created_at) {
      return 'N/A';
    }
    const created = new Date(('' + item.Created_at).replace(' ', 'T'));
    if (isNaN(created.getTime())) {
      return 'N/A';
    }

    const isClosed = item.status === 'Dealed' || item.status === 'Lost' || item.status === 'Void';
    let endDate: Date;

    if (isClosed) {
      if (!item.Closed_At) {
        return 'N/A';
      }
      endDate = new Date(('' + item.Closed_At).replace(' ', 'T'));
      if (isNaN(endDate.getTime())) {
        return 'N/A';
      }
    } else {
      endDate = new Date();
    }

    const diffDays = Math.floor((endDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return (diffDays >= 0 ? diffDays : 0) + ' days';
  }

  dealdetails(item) {
    console.log(this)
    this.navCtrl.push('DealdetailsPage', {
      Company_Name: item.Company_Name,
      Customer_Name: item.Customer_Name,
      Contact_No: item.Contact_No,
      DealId: item.DealId,
      Source: item.Source,
      Business_Type: item.Business_Type,
      cold_call: item.cold_call,
      has_schedule: item.has_schedule,
      Email: item.Email,
      Address:item.Address,
      Created_at: item.Created_at,
      department: this.department
    });
  }

  dealform(){
    this.navCtrl.push('DealformPage');
  }

  onChange(status: string) {
    this.status = status;
    if (status === 'All') {
      this.items = this.allitems;
    } else {
      this.items = this.allitems.filter(item => item.status === status);
    }
  }

  gen(){
    this.cuslist = this.items;
  }

  onDateChange(event) {
    this.loadData();
  }

  onCancel(ev) {
    ev.target.value = '';
    this.loadData();
  }

  getList(ev: any) {
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: 'crescent'
    });
    loading.present();

    let data:Observable<any>;
    this.gen();

    let serVal = ev.target.value || "";
    
    this.storage.get('token').then((val) => {
      let url = SERVER_URL + '/getdeal?token=' + val.token + '&status=' + this.status + '&search=' + serVal;
      if (this.startDate) url += '&start=' + this.startDate;
      if (this.endDate) url += '&end=' + this.endDate;

      data = this.http.get(url);
      data.subscribe((result: any) => {
        loading.dismiss();
        this.items = result.deals;
      })
    })
  }

  deleteDeal(dealId: number, companyId: number) {
    console.log(dealId, companyId)
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
            this.performDeleteDeal(dealId, companyId);
          }
        }
      ]
    });
    alert.present();
  }

  performDeleteDeal(dealId, companyId) {
      let loading = this.loadingCtrl.create({
        content: 'Deleting lead...',
        spinner: 'crescent'
      });
  
      loading.present();
  
      this.storage.get('token').then((val) => {
        return this.http.post(SERVER_URL + '/deleteLead?token=' + val.token, {
          dealId: dealId,
          companyId: companyId
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

    newcustomers() {
      this.navCtrl.push('CustomernewPage');
    }

}

