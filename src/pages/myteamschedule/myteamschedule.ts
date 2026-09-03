import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,Platform, LoadingController } from 'ionic-angular';
import { CalendarComponent } from 'ng-fullcalendar';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { NgStyle } from '@angular/common';
import { ScheduledetPage } from '../scheduledet/scheduledet';
import { MyteamscheduledetPage } from '../myteamscheduledet/myteamscheduledet';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the MyteamschedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-myteamschedule',
  templateUrl: 'myteamschedule.html',
})
export class MyteamschedulePage {
  user: any='';
  calendarOptions: any;
  lalaId:any='';
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private http: HttpClient,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public platform: Platform) {
    // var date = new Date();

    this.lalaId = this.navParams.get("Id");
console.log(this.lalaId);
    let data:Observable<any>;

    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: 'crescent'
    });
    loading.present();

    this.storage.get('token').then((val) => {
      data=this.http.get(SERVER_URL + '/getuser?token=' + val.token)
      data.subscribe(result => {
        console.log(result);
        this.user = result;
      })
    });

    var date = [];
    this.storage.get('token').then((val) => {
      this.http.get<any>(SERVER_URL + '/getTeamSchedule/'+this.lalaId+'?token=' + val.token).subscribe(result => {
        loading.dismiss();

        for (let res of result) {
          if(res.PIC_Name){
            if(res.status){
              var a = res.Time+"- " +"["+res.Company_Name+"] " + "["+res.PIC_Name+"]" + "[" +res.Name+ "]" + " (" +res.status+ ")" + " " + res.Project_Name;
            }else{
              var a = res.Time+"- " +"["+res.Company_Name+"] " + "["+res.PIC_Name+"]" + "[" +res.Name+ "]";
            }
            
          }else{
            if(res.status){

            var a = res.Time+"- " +"["+res.Company_Name+"] " + "[" +res.Name+ "]" + " (" +res.status+ ")" + " " + res.Project_Name;
            }
            else{
            var a = res.Time+"- " +"["+res.Company_Name+"] " + "[" +res.Name+ "]";

            }
          }

          date.push(
            {
              start: new Date(res.appointment_date),
              end: new Date(res.appointment_date),
              title:   a,
              allDay: true,
              backgroundColor: "#ffae42", //yellow
              borderColor: "#ffae42", //yellow
            }
          )
        };
        this.ucCalendar.fullCalendar('addEventSource', date);
      })
    });

    
  }

  isObject(variable){
    return typeof variable === 'object';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyteamschedulePage');
  }

  ngOnInit() {
    this.calendarOptions = {
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
      // defaultView: 'agendaFourDay',
      defaultView: 'agendaDay',
      allDay: true,
      events: [
      ],
    };
  }

  eventClick(e) {
    let date = new Date(e.event.start._d);
    let month = date.toLocaleDateString("en-us",{month:"short"});
    let dateFormat = date.getDate()+"-"+month+"-"+date.getFullYear();
    console.log(dateFormat)
    this.navCtrl.push('MyteamscheduledetPage',{dateFormat,lalaId:this.lalaId});


//     let date = e.toElement.parentNode.dataset.date;
//     let d = e.toElement.innerText;
// console.log(d)
// console.log(date)


    // if (date) {
    //   if(d)
    // this.navCtrl.push('ScheduledetPage',d);

    //     // this.navCtrl.push('ScheduledetPage',d);
    // } else {
    //   if (d)
    // this.navCtrl.push('ScheduledetPage',d);

    //     // this.navCtrl.push('ScheduledetPage',d);
    // }
    // this.navCtrl.push(ScheduledetailsPage,d);

  }
  

  
  
}
