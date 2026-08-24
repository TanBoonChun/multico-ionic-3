import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { AlertController } from "ionic-angular";

import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Toast } from "@ionic-native/toast";
import { SERVER_URL } from "../../environment";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@IonicPage()
@Component({
  selector: "page-stostatusdetail",
  templateUrl: "stostatusdetail.html",
})
export class StostatusdetailPage {
  a: any = "";
  Id: any = "";
  stock_no: any = "";
  purpose: any = "";
  ProjectCode: any = "";
  SiteName: any = "";
  docket_no: any = "";
  roomname: any = "";
  warehouse: any = "";
  towarehouseName: any = "";
  towarehouseCode: any = "";
  remarks: any = "";
  approver_name: any = "";
  ware_name: any = "";
  created_at: any = "";
  status: any = "";

  constructor(
    public navCtrl: NavController,
    public http: HttpClient,
    private toast: Toast,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public storage: Storage
  ) {
    this.Id = this.navParams.get("Id");
    this.stock_no = this.navParams.get("stock_no");
    this.purpose = this.navParams.get("purpose");
    this.ProjectCode = this.navParams.get("ProjectCode");
    this.SiteName = this.navParams.get("SiteName");
    this.docket_no = this.navParams.get("docket_no");
    this.roomname = this.navParams.get("roomname");
    this.warehouse = this.navParams.get("warehouse");
    this.towarehouseName = this.navParams.get("towarehouseName");
    this.towarehouseCode = this.navParams.get("towarehouseCode");
    this.remarks = this.navParams.get("remarks");
    this.approver_name = this.navParams.get("approver_name");
    this.ware_name = this.navParams.get("ware_name");
    this.created_at = this.navParams.get("created_at");
    this.status = this.navParams.get("status");
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getStomaterial/" +
          this.Id +
          "?token=" +
          val.token
      );
      data.subscribe((result) => {
        this.a = result.material;
      });
    });
  }

  cancel() {
    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/cancelStorequest?token=" + val.token,
          {
            Id: this.Id,
            Status: "Cancel Request",
          },
          httpOptions
        )
        .subscribe(
          (res: any) => {
            if (res == 1) {
              this.navCtrl.pop();
              this.toast
                .show(`STO request cancelled`, "5000", "center")
                .subscribe((toast) => {});
            } else {
              var obj = res;
              console.log(obj);
              var errormessage = "";
              for (var item in obj) {
                errormessage = obj[item][0];
              }
              this.displayErrorAlert(errormessage);
            }
          },
          (err) => {
            this.displayErrorAlert(err.error.error);
          }
        );
    });
  }

  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }
}
