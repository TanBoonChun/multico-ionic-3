import { Component } from "@angular/core";
import { NavController, NavParams, App, IonicPage } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Badge } from "@ionic-native/badge";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advancepaymentdone",
  templateUrl: "advancepaymentdone.html",
})
export class AdvancepaymentdonePage {
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
    this.navCtrl.push('AdvancepaymentdonedetPage', item);
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
        SERVER_URL + "/getmyadvance?token=" + val.token
      );
      data.subscribe((result) => {
        this.items = [];
        for (let res of result) {
          if (res.Status && res.Status.indexOf("Payment Done") >= 0) {
            this.items.push(res);
          }
        }
      });

      this.storage.get("token").then((val) => {
        this.http
          .get<{ badge_count: any; notifications: any }>(
            SERVER_URL + "/notifications/advancepaymentdone?token=" +
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
