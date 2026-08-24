import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  App,
  LoadingController,
  IonicPage,
} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Badge } from "@ionic-native/badge";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advancemanagementpending",
  templateUrl: "advancemanagementpending.html",
})
export class AdvancemanagementpendingPage {
  public items: any;
  private token: string = "";
  public notifications: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private badge: Badge,
    private loadingCtrl: LoadingController
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  goToDetail(item) {
    this.navCtrl.push("AdvancemanagementpendingMonthlyPage", item);
  }

  loadData() {
    let data: Observable<any>;

    let loading = this.loadingCtrl.create({
      content: "Loading ...",
    });

    loading.present();

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/advancemanagement?token=" + val.token,{
          params:{
            status:"Pending Approval"
          }
        }
      );
      data.subscribe((result) => {
        loading.dismiss();

        this.items = result.advances;

        // for (let res of r) {
        //   if (res.Status && res.Status.indexOf("Pending Approval") >= 0) {
        //     this.items.push(res);
        //   }
        // }
      });

      this.storage.get("token").then((val) => {
        this.http
          .get<{ badge_count: any; notifications: any }>(
            SERVER_URL + "/notifications/advancepending?token=" +
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
