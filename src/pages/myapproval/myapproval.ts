import { Component } from '@angular/core';
import { NavController, App, IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the MyapprovalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-myapproval',
  templateUrl: 'myapproval.html',
})
export class MyapprovalPage {

  public items:any;
  private token: string = '';

  leavedetail5 = "Leavedetail5Page";
  public notifications: any = [];

  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  loadData(){

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/myApprover?token=' + val.token);
      data.subscribe(result => {
        this.items = result;
      })
      this.storage.get('token').then((val) => {
        this.http.get<{badge_count: any, notifications: any}>(SERVER_URL + '/notifications/leavepending?token=' + val.token).subscribe(result => {
          let that = this
          result.notifications.map(function(value) {
            that.notifications[value.TargetId] = value
          })
  
          console.log(this.notifications)        
        })
      });
    });
    
  }

}
