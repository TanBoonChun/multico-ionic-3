import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-profit-and-loss",
  templateUrl: "profit-and-loss.html",
})
export class ProfitAndLossPage {
  public totalPendingPnl;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public http: HttpClient
  ) {}

  ionViewWillEnter() {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/profit/getData", {
          params: {
            token: val.token,
            status: "pending",
            page: "1",
          },
        })
        .subscribe((result: any) => {
          this.totalPendingPnl = result.total;
        });
    });
  }
  navigateToApprovalPage(status) {
    this.navCtrl.push("ProfitAndLossApprovalPage", { status: status });
  }
}
