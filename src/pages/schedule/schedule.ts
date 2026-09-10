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
              // extra props kept on the event so eventRender can lay them out
              schTime: res.Time,
              schCompany: res.Company_Name,
              schSalesperson: res.Name,
              schStatus: res.status,
              schPic: res.PIC_Name,
              schProject: res.Project_Name,
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
      contentHeight: 'auto',
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
      eventRender: (event, element) => this.eventRender(event, element),
      fixedWeekCount : false,
      defaultDate: (new Date()).toISOString(),
      defaultView: 'agendaFourDay',
      allDay: true,
      events: [],
      
    };
  }

  escapeHtml(value): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  statusClass(status): string {
    switch (String(status || '').toLowerCase()) {
      case 'open': return 'sch-status--open';
      case 'closed': return 'sch-status--closed';
      case 'cancel': return 'sch-status--cancel';
      default: return 'sch-status--other';
    }
  }

  // Renders each list row as a small card so the salesperson is clearly labelled
  eventRender(event, element) {
    var cell = element.find('.fc-list-item-title');
    if (!cell.length) {
      return;
    }

    var time = this.escapeHtml(event.schTime);
    var company = this.escapeHtml(event.schCompany) || 'No company';
    var salesperson = this.escapeHtml(event.schSalesperson);
    var status = this.escapeHtml(event.schStatus);
    var pic = this.escapeHtml(event.schPic);
    var project = this.escapeHtml(event.schProject);

    var html = '<div class="sch-card">';
    html += '<div class="sch-card__head">';
    if (time) {
      html += '<span class="sch-time">' + time + '</span>';
    }
    if (status) {
      html += '<span class="sch-status ' + this.statusClass(event.schStatus) + '">' + status + '</span>';
    }
    html += '</div>';
    html += '<div class="sch-company">' + company + '</div>';
    if (project) {
      html += '<div class="sch-meta"><span class="sch-label">Project</span>' + project + '</div>';
    }
    if (pic) {
      html += '<div class="sch-meta"><span class="sch-label">Client</span>' + pic + '</div>';
    }
    if (salesperson) {
      html += '<div class="sch-meta sch-meta--sales"><span class="sch-label">Salesperson</span>' +
              '<span class="sch-salesperson">' + salesperson + '</span></div>';
    }
    html += '</div>';

    cell.html(html);
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

