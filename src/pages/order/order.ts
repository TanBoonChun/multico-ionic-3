import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-order",
  templateUrl: "order.html",
})
export class OrderPage {
  public totalPendingOrder;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public http: HttpClient
  ) {}

  navigateToApprovalPage(status) {
    this.navCtrl.push("OrderApprovalPage", {
      status: status,
    });
  }

  ionViewWillEnter() {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/orders/index", {
          params: {
            token: val.token,
            status: "pending",
            page: "1",
          },
        })
        .subscribe((result: any) => {
          this.totalPendingOrder = result.total;
        });
    });
  }
}
