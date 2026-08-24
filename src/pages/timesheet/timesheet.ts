import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { AlertController } from 'ionic-angular';


const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

@IonicPage()

@Component({
  selector: 'page-timesheet',
  templateUrl: 'timesheet.html',
})
export class TimesheetPage {

  items: any;
  token: string = '';
  Start_Date: any='';
  End_Date: any='';
  timesheet: any='';

  tsdetailPage = 'TsdetailPage';

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public app: App,
    public http: HttpClient,
    public loadingCtrl: LoadingController,
    public navParams: NavParams) {
    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 2);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    this.Start_Date = firstDay.toISOString();
    this.End_Date = lastDay.toISOString();

  }

  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
       "Jan", "Feb", "Mar",
       "Apr", "May", "Jun", "Jul",
       "Aug", "Sep", "Oct",
       "Nov", "Dec"
     ];

     var day = date.substring(8,10);
     var monthIndex = parseInt(date.substring(5,7))-1;
     var year = date.substring(0,4);

     return day + '-' + monthNames[monthIndex] + '-' + year;
  }

  submitClaim() {

    this.navCtrl.push(this.tsdetailPage, {
      Start_Date: this.myFunction(this.Start_Date),
      End_Date: this.myFunction(this.End_Date)
    });
    // let loading = this.loadingCtrl.create({
    //   content: "Logging in...",
    //   spinner: 'crescent'
    // });

  }

}
