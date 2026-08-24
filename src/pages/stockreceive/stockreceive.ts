import { Component } from '@angular/core';
import { NavController, NavParams, App, IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { StockpurchasedPage } from '../stockpurchased/stockpurchased';
import { StocknonPage } from '../stocknon/stocknon';

@IonicPage()
@Component({
  selector: 'page-stockreceive',
  templateUrl: 'stockreceive.html',
})
export class StockreceivePage {

  public allitems:any;
  public status:string = 'All';
  private token: string = '';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
  ) {
  }


  Purchased(){
    this.navCtrl.push(StockpurchasedPage)
  }

  NonPurchased(){
    this.navCtrl.push(StocknonPage)
  }

  ionViewDidEnter() {
  }



  items: any[]=[
    {
        "Id": 16084,
        "StatusId": 16957,
        "Name": "SYSTEM ADMINISTRATOR 1",
        "Leave_Type": "DO95843",
        "Leave_Term": "18-May Full",
        "Start_Date": "18-May-2020",
        "End_Date": "18-May-2020",
        "No_of_Days": 1,
        "Reason": "Delivery for Anstect",
        "Application_Date": "2020-05-19 08:00:02",
        "Project_Name": null,
        "Approver": "SYSTEM ADMINISTRATOR 1",
        "Status": "Final Approved",
        "Review_Date": "0000-00-00 00:00:00",
        "Comment": "",
        "Web_Path": null,
        "AppId": 562
    },
    {
        "Id": 16070,
        "StatusId": 16943,
        "Name": "SYSTEM ADMINISTRATOR 1",
        "Leave_Type": "DO747382",
        "Leave_Term": "16-May AM",
        "Start_Date": "16-May-2020",
        "End_Date": "16-May-2020",
        "No_of_Days": 0.5,
        "Reason": "Delivery for Premax",
        "Application_Date": "2020-05-17 08:00:02",
        "Project_Name": null,
        "Approver": "SYSTEM ADMINISTRATOR 1",
        "Status": "Final Approved",
        "Review_Date": "0000-00-00 00:00:00",
        "Comment": "",
        "Web_Path": null,
        "AppId": 562
    },
    {
        "Id": 16042,
        "StatusId": 16915,
        "Name": "SYSTEM ADMINISTRATOR 1",
        "Leave_Type": "DO263453",
        "Leave_Term": "15-May Full",
        "Start_Date": "15-May-2020",
        "End_Date": "15-May-2020",
        "No_of_Days": 1,
        "Reason": "Delivery for Cretch",
        "Application_Date": "2020-05-16 08:00:02",
        "Project_Name": null,
        "Approver": "SYSTEM ADMINISTRATOR 1",
        "Status": "Final Approved",
        "Review_Date": "0000-00-00 00:00:00",
        "Comment": "",
        "Web_Path": null,
        "AppId": 562
    },
    {
        "Id": 16021,
        "StatusId": 16892,
        "Name": "SYSTEM ADMINISTRATOR 1",
        "Leave_Type": "DO62342",
        "Leave_Term": "14-May Full",
        "Start_Date": "14-May-2020",
        "End_Date": "14-May-2020",
        "No_of_Days": 1,
        "Reason": "Delivery for LandMarxx",
        "Application_Date": "2020-05-15 08:00:02",
        "Project_Name": null,
        "Approver": "SYSTEM ADMINISTRATOR 1",
        "Status": "Final Approved",
        "Review_Date": "0000-00-00 00:00:00",
        "Comment": "",
        "Web_Path": null,
        "AppId": 562
    }
]

}
