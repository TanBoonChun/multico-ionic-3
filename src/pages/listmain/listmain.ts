import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  AlertController,
  IonicPage,
} from "ionic-angular";
import { App } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";
import { Badge } from "@ionic-native/badge";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-listmain",
  templateUrl: "listmain.html",
})
export class ListmainPage {
  public taskBadgeCount: any;
  public taskBadgeCount2: any;
  public overdueBadgeCount: any;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private toast: Toast,
    private badge: Badge
  ) {
    this.taskBadgeCount = 0;
    this.taskBadgeCount2 = 0;
    this.overdueBadgeCount = 0;
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      this.http
        .get<{ count: any }>(SERVER_URL + "/getlistassigned?token=" + val.token)
        .subscribe((result) => {
          this.taskBadgeCount = result.count;
        });
    });

    //acknowledge
    this.storage.get("token").then((val) => {
      this.http
        .get<{ count: any }>(
          SERVER_URL + "/getlistacknowledge?token=" + val.token
        )
        .subscribe((result) => {
          this.taskBadgeCount2 = result.count;
        });
    });

    //overdue
    this.storage.get("token").then((val) => {
      this.http
        .get<{ count: any }>(
          SERVER_URL + "/getoverduetodo?token=" + val.token
        )
        .subscribe((result) => {
          this.overdueBadgeCount = result.count;
        });
    });
  }

  async setBadges(badgeNumber: number) {
    try {
      let badges = await this.badge.set(badgeNumber);
    } catch (e) {
      console.error(e);
    }
  }

}
