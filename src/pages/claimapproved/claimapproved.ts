import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { App, ViewController } from "ionic-angular";
import { PopoverController } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-claimapproved",
  templateUrl: "claimapproved.html",
})
export class ClaimapprovedPage {
  public items: any = [];
  private token: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    public app: App,
    public http: HttpClient,
    private storage: Storage
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  gotoPage(item) {
    let nav = this.app.getRootNav();
    nav.push("ClaimapproveddetailsPage", item);
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
          if (res.Status.indexOf("Approved") >= 0) {
            this.items.push(res);
          }
        }
      });
    });
  }
}
