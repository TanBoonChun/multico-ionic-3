import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform,LoadingController } from 'ionic-angular';
import { CalendarComponent } from 'ng-fullcalendar';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';

import { ScheduledetailsPage } from '../scheduledetails/scheduledetails';
import { SchedulenewPage } from '../schedulenew/schedulenew';
import { ScheduledetPage } from '../scheduledet/scheduledet';
import { startTimeRange } from '@angular/core/src/profile/wtf_impl';
import { dateValueRange } from 'ionic-angular/umd/util/datetime-util';
import { style } from '@angular/core/src/animation/dsl';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the SchedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schedule',
  templateUrl: 'schedule.html',
})
export class SchedulePage {
  user: any='';
  leader: any=[];
  member: any=[];
  status:any="";
  calendarOptions: any;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private http: HttpClient,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public platform: Platform) {
    // var date = new Date();

    let data:Observable<any>;

    

    this.storage.get('token').then((val) => {
      data=this.http.get(SERVER_URL + '/getuser?token=' + val.token)
      data.subscribe(result => {
        console.log(result);
        this.user = result;
      })
    });
  }

  isObject(variable){
    return typeof variable === 'object';
  }

  ionViewDidLoad(){
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: 'crescent'
    });
    loading.present();

    var date = [];

    this.storage.get('token').then((val) => {
      this.http.get<any>(SERVER_URL + '/getAllTeamSchedule?token=' + val.token).subscribe(result => {
        loading.dismiss();

        for (let res of result) {

          var a = res.Time+"- " +"["+res.Company_Name+"] " + "[" +res.Name+ "]" + " (" +res.status+ ")";

          date.push(
            {
              start: new Date(res.appointment_date),
              end: new Date(res.appointment_date),
              title: a,
              allDay: true,
            }
          )
        };
      this.ucCalendar.fullCalendar('addEventSource', date);

      })
    });

    
  }

  ngOnInit() {
    this.calendarOptions = {
      height: 'auto',
      contentHeight: 600,
      aspectRatio: 1.35,
      header: {
        left: 'title',
        right: 'month,agendaFourDay,agendaDay'
      },
      footer: {
        right: 'today prev,next',
      },
      views: {
        agendaFourDay: {
            type: 'listYear',
            buttonText: 'All'
        },
        agendaDay:{
          type: 'agendaDay',
          buttonText: 'Today'
        }
      },
      fixedWeekCount : false,
      defaultDate: (new Date()).toISOString(),
      defaultView: 'agendaFourDay',
      allDay: true,
      events: [],
      
    };
  }

  eventClick(e) {
    console.log(e)
    let date = new Date(e.event.start._d);
    let month = date.toLocaleDateString("en-us",{month:"short"});
    let dateFormat = date.getDate()+"-"+month+"-"+date.getFullYear();
    console.log(dateFormat)
    this.navCtrl.push('ScheduledetPage',this.myFunction(date));
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

  newschedule() {
    this.navCtrl.push('SchedulenewPage');

  }

}

