import { Component } from "@angular/core";
import { NavController, NavParams, Events, IonicPage } from "ionic-angular";
import { App, ViewController } from "ionic-angular";
import { PopoverController } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";

import { AddclaimPage } from "../addclaim/addclaim";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-claimcancelled",
  templateUrl: "claimcancelled.html",
})
export class ClaimcancelledPage {
  addclaim = AddclaimPage;
  public items: any = [];
  private token: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private events: Events
  ) {
    this.events.subscribe("claim-recalled", () => {
      this.loadData();
    });
  }

  ionViewWillUnload() {
    this.events.unsubscribe("claim-recalled");
  }
  gotoPage(item) {
    let nav = this.app.getRootNav();
    nav.push("ClaimcancelleddetailsPage", item);
  }

  ionViewWillEnter() {
    this.loadData();
  }

  doRefresh(refresher) {
    this.loadData();
    setTimeout(() => {
      refresher.complete();
    }, 800);
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getclaimsheet?token=" + val.token
      );
      data.subscribe((result) => {
        this.items = [];

        for (let res of result) {
          if (res.Status.indexOf("Submitted") >= 0) {
            this.items.push(res);
          }
        }
      });
    });
  }
}
