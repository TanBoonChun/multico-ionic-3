import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { ElementRef, Renderer, ViewChild} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Toast } from '@ionic-native/toast';
import { ToastController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

import {  FormGroup} from '@angular/forms';
import { SERVER_URL } from '../../environment';

@IonicPage()

@Component({
  selector: "page-attendancemain",
  templateUrl: "attendancemain.html"
})
export class AttendancemainPage {
  currentDate;
  formattedDate;
  formattedDateObj;
  portsSubscription: Subscription;

  Date: string;
  Time: string;
  Latitude_In: any;
  Longitude_In: any;
  Latitude_Out: any;
  Longitude_Out: any;
  Check_In_Type: string;
  Department: string;
  Site_Name: string;
  Timesheet_Name: string;
  Id: string;
  Leader_Member: string;
  Next_Person: string;
  ProjectId: string;
  State: string;
  Work: string;
  Reason: string;
  Remarks: string = "";
  Remarks2: string = "";
  Work_Description: string;
  hideUI: any;
  types: any;
  departs: any;
  Name: string = "";
  items: any;
  UserId: any;
  token: string = "";
  public signupform: FormGroup;
  projectOptions: any;
  scope: any;
  apps: any;
  Scope: any;
  ScopeOfWork: any;
  Project_Code: string = "";
  Location_Name: "";
  loading: any;
  tmpListener: any;
  Workbase:any;
  user:any=[];

  ShareCost:any=''

  @ViewChild("myInput") myInput: ElementRef;
  resize() {
    var element = this.myInput[
      "_elementRef"
    ].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + "px";
    this.myInput["_elementRef"].nativeElement.style.height =
      scrollHeight + 16 + "px";
  }
  @ViewChild("portComponent") portComponent: IonicSelectableComponent;

  // showLoading() {
  //     this.portComponent.showLoading();
  // }

  constructor(
    public navCtrl: NavController,
    public geo: Geolocation,
    public alertCtrl: AlertController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    private locationAccuracy: LocationAccuracy,
    private toast: Toast,
    private toastCtrl: ToastController,
    private renderer: Renderer,
    public platform: Platform
  ) {
    this.Id = this.navParams.get("Id");
    this.Timesheet_Name = this.navParams.get("Timesheet_Name");
    this.Name = this.navParams.get("Name");
    this.Workbase = this.navParams.get("Workbase");
    this.ShareCost = this.navParams.get("ShareCost")
    console.log(this.Workbase, this.ShareCost)

    let data:Observable<any>;
    this.storage.get('token').then((val) => {
      data=this.http.get(SERVER_URL + '/getuser?token=' + val.token)
      data.subscribe(result => {
        this.user = result;
      })
    });
  }

  ProjectAttendance() {
    this.navCtrl.push('AttendancePage');
  }

  /**
   * Work order and sales time in share one page - they differ only in what
   * identifies the visit, so the type is passed in rather than each getting a
   * page of its own.
   */
  WorkOrderAttendance() {
    this.navCtrl.push('AttendancewoPage', { Attendance_Type: 'Work Order' });
  }

  SalesAttendance() {
    this.navCtrl.push('AttendancewoPage', { Attendance_Type: 'Sales' });
  }

  OfficeAttendance() {
    this.navCtrl.push('Attendance2Page');
  }

  shareCost(){
    this.navCtrl.push('AttendancesharecostPage');
  }

  OTWAttendance() {
    const confirm = this.alertCtrl.create({
      title: 'Go to OTW Attendance ',
      message: 'Are you sure want to go to Attendance OTW page? Proceed will clear your OTW history.',
      buttons: [
        {
          text: 'PROCEED',
          handler: () => {
            console.log('Accept clicked');
              this.navCtrl.push('AttendanceotwPage');
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

  

  BreakAttendance() {
    this.navCtrl.push('AttendancebreakPage');
  }
}
