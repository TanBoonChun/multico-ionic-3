import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { CalendarComponent } from 'ng-fullcalendar';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GensetmainPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-gensetmain',
  templateUrl: 'gensetmain.html',
})
export class GensetmainPage {

  calendarOptions: any;
  @ViewChild(CalendarComponent) ucCalendar: CalendarComponent;

  public userImage: string;
  public Name: string = '';
  public Position: string = '';
  public user: any = '';
  public Staff_ID: string = '';
  public team_leader: string = '';

  public taskBadgeCount: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private http: HttpClient,
    private storage: Storage
  ) {

    this.calendarOptions = {
      header: {
        left: 'title',
        right: 'month,agendaFourDay,'
      },
      footer: {
        right: 'today prev,next',
      },
      views: {
        agendaFourDay: {
          type: 'listYear',
          buttonText: 'All'
        }
      },
      fixedWeekCount: false,
      defaultDate: (new Date()).toISOString(),
      defaultView: 'agendaFourDay',
      allDay: true,
      events: [],
    };

    this.taskBadgeCount = 0;

    let data: Observable<any>;

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getuser?token=' + val.token);
      data.subscribe(result => {
        console.log(result, 'GENSET');
        this.user = result;
      });
    });

    this.storage.get('user').then((val) => {
      this.userImage = val.Web_Path;
      this.Name = val.Name;
      this.Position = val.Position;
      this.Staff_ID = val.Staff_ID;
      this.team_leader = val.team_leader;
    });
  }

  // -------------------------------------------------------------------------
  // CALENDAR
  // -------------------------------------------------------------------------
  ngOnInit() {
    this.calendarOptions = {
      header: {
        left: 'title',
        right: 'month,agendaFourDay,'
      },
      footer: {
        right: 'today prev,next',
      },
      views: {
        agendaFourDay: {
          type: 'listYear',
          buttonText: 'All'
        }
      },
      fixedWeekCount: false,
      defaultDate: (new Date()),
      defaultView: 'agendaFourDay',
      allDay: true,
      events: [],
    };
  }

  test(e) {
    console.log(e);
  }

  isObject(variable) {
    return typeof variable === 'object';
  }

  completed() {
    this.navCtrl.push('GensetcompletePage');
  }

  eventClick(e, t) {
    console.log(e);
    let date = new Date(e.event.start._d);
    let month = date.toLocaleDateString("en-us", { month: "short" });
    let dateFormat = date.getDate() + "-" + month + "-" + date.getFullYear();
    console.log(dateFormat);
    // GensetservicePage dipanggil guna string (lazy load) — tak perlu import
    this.navCtrl.push('GensetservicePage', this.myFunction(date));
  }

  myFunction(date) {
    var d = new Date(date);

    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];

    var day = ('0' + d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + '-' + monthNames[monthIndex] + '-' + year;
  }

  ionViewWillEnter() {
    let date = [];
    this.storage.get('token').then(data => {
      this.http.get(SERVER_URL + '/serviceticket/getServiceDatetest?token=' + data.token).subscribe(
        (result: any) => {
          this.ucCalendar.fullCalendar('removeEvents');
          for (var y = 0, i = result.length; y < i; y++) {
            date.push({
              id: new Date(result[y]['service_date']),
              className: new Date(result[y]['service_date']),
              title: (result[y]['service_type']) + ' (' + (result[y]['service_date']) + ')',
              start: new Date(result[y]['service_date']),
              end: new Date(result[y]['service_date']),
              allDay: true,
              backgroundColor: "#F22613", //red
              borderColor: "#F22613", //red
            });
          }
          this.ucCalendar.fullCalendar('addEventSource', date);
        }
      );
    });
  }
}