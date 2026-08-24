import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { App } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advancerejected",
  templateUrl: "advancerejected.html",
})
export class AdvancerejectedPage {
  public items: any;
  private token: string = "";
  public notifications: any = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  goToDetail(item) {
    this.navCtrl.push('AdvancerejecteddetailsSitePage', item);
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

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getmyadvance2?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        var r = result.rejected;
        this.items = [];

        for (let res of r) {
          // for (let res of result) {
          this.items.push(res);

          //   if (res.Status && res.Status.indexOf("Rejected") >= 0) {
          //     this.items.push(res);
          //   }
        }
      });

      this.storage.get("token").then((val) => {
        this.http
          .get<{ badge_count: any; notifications: any }>(
            SERVER_URL + "/notifications/advancerejected?token=" +
              val.token
          )
          .subscribe((result) => {
            let that = this;
            result.notifications.map(function (value) {
              that.notifications[value.TargetId] = value;
            });

            console.log(this.notifications);
          });
      });
      // this.http.post(SERVER_URL + '/notifications/updateadvancerejected?token=' + val.token, {}).subscribe(result => {

      // console.log(result)
      // })
    });
  }
}
