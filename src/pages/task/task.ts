import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, IonicPage } from 'ionic-angular';
import { App } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

import { Badge } from '@ionic-native/badge';
import { SERVER_URL } from '../../environment';

@IonicPage()
@Component({
  selector: 'page-task',
  templateUrl: 'task.html',
})

export class TaskPage {

  // taskmain = TaskmainPage;
  // taskmainreject = TaskmainrejectPage;
  public taskBadgeCount: any;
  public taskrejectBadgeCount: any;
  public taskBadgeCount2:any;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private toast: Toast,
    private badge: Badge,

  ) {

    this.taskBadgeCount = 0;
    this.taskrejectBadgeCount = 0;
    this.taskBadgeCount2 = 0;

  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter TaskPage');
    this.loadData();

  }

  loadData(){
    let data:Observable<any>;

    // Task overdue
    this.storage.get('token').then((val) => {
      this.http.get<{count: any}>(SERVER_URL + '/getmyoverduetask2?token=' + val.token).subscribe(result => {
        this.taskBadgeCount2 = result.count;
        this.setBadges(this.taskBadgeCount2);
      })
    });

    //My Task
    this.storage.get('token').then((val) => {
      this.http.get<{count: any}>(SERVER_URL + '/getalltask?token=' + val.token).subscribe(result => {
        this.taskBadgeCount = result.count;
        this.setBadges(this.taskBadgeCount);
      })
    });

    // TaskReject
    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/getrejectedtaskbadge?token=' + val.token).subscribe(result => {
        this.taskrejectBadgeCount = result.badge_count;
        this.setBadges(this.taskrejectBadgeCount);
      })
    });

  }

  // badge icon count
  async setBadges(badgeNumber: number) {
    try {
      let badges = await this.badge.set(badgeNumber);
      console.log(badges);
    } catch (e) {
      console.error(e);
    }
  }

  // MyTask(){
  //   this.navCtrl.push(TaskmainPage);
  // }

  // TaskReject(){
  //   this.navCtrl.push(TaskmainrejectPage);
  // }


}
