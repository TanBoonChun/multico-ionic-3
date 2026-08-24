import { Component } from "@angular/core";
import { NavController, NavParams, App, IonicPage } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Badge } from "@ionic-native/badge";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advanceapproved",
  templateUrl: "advanceapproved.html",
})
export class AdvanceapprovedPage {
  public items: any;
  private token: string = "";
  public notifications: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private badge: Badge
  ) {}

  goToDetail(item) {
    this.navCtrl.push("AdvanceapproveddetailsSitePage", item);
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

  statusClass(status) {
    if (!status) return "chip-grey";
    if (status.indexOf("Reject") > -1 || status.indexOf("Cancel") > -1) return "chip-red";
    if (status.indexOf("Pending") > -1 || status.indexOf("Recall") > -1) return "chip-amber";
    return "chip-green";
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getmyadvance2?token=" + val.token
      );
      data.subscribe((result) => {
        var r = result.approved;
        this.items = [];

        for (let res of r) {
          if (res.Status && res.Status.indexOf("Approved") >= 0) {
            this.items.push(res);
          } else if (
            res.Status &&
            res.Status.indexOf("Submitted for Payment") >= 0
          ) {
            this.items.push(res);
          } else if (
            res.Status &&
            res.Status.indexOf("Ready for Payment") >= 0
          ) {
            this.items.push(res);
          }
        }
      });

      this.storage.get("token").then((val) => {
        this.http
          .get<{ badge_count: any; notifications: any }>(
            SERVER_URL + "/notifications/advanceapproved?token=" +
              val.token
          )
          .subscribe((result) => {
            let that = this;
            result.notifications.map(function (value) {
              that.notifications[value.TargetId] = value;
            });
          });
      });
    });
  }
}
