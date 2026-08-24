import { Component } from "@angular/core";
import { NavController, NavParams, App, IonicPage } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Badge } from "@ionic-native/badge";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advancemanagementrejected",
  templateUrl: "advancemanagementrejected.html",
})
export class AdvancemanagementrejectedPage {
  public items: any;
  private token: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private badge: Badge
  ) {}

  ionViewWillEnter() {
    this.loadData();
  }

  goToDetail(item) {
    this.navCtrl.push("AdvancemanagementrejectedMonthlyPage", item);
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/advancemanagement?token=" + val.token + "&status=Rejected"
      );
      data.subscribe((result) => {
        // var r = result.all;
        this.items = result.all;
      });

      this.http
        .post(
          SERVER_URL + "/notifications/updateadvancerejected?token=" +
            val.token,
          {}
        )
        .subscribe((result) => {});
    });
  }
}
