import { Component } from "@angular/core";
import {
  NavController,
  App,
  LoadingController,
  IonicPage,
} from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { NavParams } from "ionic-angular";
import { Toast } from "@ionic-native/toast";
import { SERVER_URL } from "../../environment";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};
@IonicPage()
@Component({
  selector: "page-advanceredirect",
  templateUrl: "advanceredirect.html",
})
export class AdvanceredirectPage {
  public items: any;
  private token: string = "";
  Project_Name: any;
  LeaveId: any;
  StatusIds: any;
  apps: any;
  Name: any;
  departs: any = "";
  Approver: any = "";
  approverOptions: any;
  advanceid: any;
  AdvanceId: any;
  advancedetails: any = [];
  advance: any = {};
  user: any = {};
  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    private toast: Toast,
    public navParams: NavParams
  ) {
    this.loadData();
    this.advanceid = this.navParams.get("Id");
    this.AdvanceId = this.navParams.get("Id");
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getadvanceapprover?token=" + val.token
      );
      data.subscribe((result) => {
        this.apps = result;
      });
    });
  }

  setApproverOptions(value) {
    let arrApps = new Array();

    for (let app of this.apps) {
      if (app.Project_Name == this.Project_Name) {
        arrApps.push(app);
      }
    }

    this.approverOptions = arrApps;
  }
  redirectApproval() {
    let loading = this.loadingCtrl.create({
      content: "Redirecting ...",
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/advanceredirect2?token=" + val.token,
          {
            Approver: this.Approver.Id,
            AdvanceId: this.AdvanceId,
          },
          httpOptions
        )
        .subscribe((res: any) => {
          this.navCtrl.pop();
          this.toast
            .show(`Redirect succesfull`, "5000", "center")
            .subscribe((toast) => {
              console.log(toast);
            });
        });
    });
  }
}
