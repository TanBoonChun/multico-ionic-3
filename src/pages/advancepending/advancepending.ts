import { Component } from "@angular/core";
import { NavController, NavParams, App, IonicPage } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advancepending",
  templateUrl: "advancepending.html",
})
export class AdvancependingPage {
  public items: any;
  private token: string = "";

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
    this.navCtrl.push("AdvancependingdetailsSitePage", item);
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
      data.subscribe(
        (result) => {
          var r = result.pending;
          this.items = [];

          for (let res of r) {
            this.items.push(res);
          }
        },
        (err) => {
          this.items = [];
        }
      );
    });
  }
}
