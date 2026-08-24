import { Component } from "@angular/core";
import { NavController, NavParams, App, IonicPage } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { IonicImageLoader } from "ionic-image-loader";
import { DomSanitizer } from "@angular/platform-browser";
import { AlertController } from "ionic-angular";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-list",
  templateUrl: "list.html",
})
export class ListPage {
  public items: any;

  noticeBadgeCount: any;
  public notifications: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public ionicImageLoader: IonicImageLoader,
    private alertCtrl: AlertController
  ) {
    this.loadData();
    this.noticeBadgeCount = 0;
  }

  Listdetails() {
    this.navCtrl.push("ListdetailsPage");
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(SERVER_URL + "/getlistassigned?token=" + val.token);
      data.subscribe((result) => {
        this.items = result.list;
      });
    });
  }

  gotoEdit(item) {
    const confirm = this.alertCtrl.create({
      title: "Acknowledge / Reject Task",
      message: "Click for button you want to pick",
      buttons: [
        {
          text: "Acknowledge",
          handler: () => {
            let nav = this.app.getRootNav();
            nav.push("ListtargetPage", item);
          },
        },
        {
          text: "Reject",
          handler: () => {
            let nav = this.app.getRootNav();
            nav.push("ListdetailsPage", item);
          },
        },
        {
          text: "Cancel",
          handler: () => {},
        },
      ],
    });
    confirm.present();
  }
}
