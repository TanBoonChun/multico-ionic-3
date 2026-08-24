import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthProvider } from './../../providers/auth/auth';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';

@IonicPage()

@Component({
  selector: 'page-holiday',
  templateUrl: 'holiday.html',
})
export class HolidayPage {
  public items: any;
  public groups: any;
  private token: string = '';

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    private auth: AuthProvider,
    private storage: Storage)
    {
      this.loadData();
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HolidayPage');
  }

  myFunction(date) {
    var d = new Date(date);
    var weekday = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tues";
    weekday[3] = "Wed";
    weekday[4] = "Thur";
    weekday[5] = "Fri";
    weekday[6] = "Sat";

    return weekday[d.getDay()];
    // document.getElementById("demo").innerHTML = n;
}

  loadData(){

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/holiday?token=' + val.token);
        data.subscribe(result => {
          this.items = result;
          this.groups = Object.keys(this.items);
        })
    });
  }

}
