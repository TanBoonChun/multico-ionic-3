import { Component } from "@angular/core";
import { NavController, NavParams, App, IonicPage } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advancemanagementapproved",
  templateUrl: "advancemanagementapproved.html",
})
export class AdvancemanagementapprovedPage {
  public items: any;
  private token: string = "";
  userImage: any;
  Name: any;
  Position: any;
  user: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage
  ) {
    this.storage.get("user").then((val) => {
      this.userImage = val.Web_Path;
      this.Name = val.Name;
      this.Position = val.Position;
      this.user = val;
    });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  goToDetail(item) {
    this.navCtrl.push("AdvancemanagementapprovedMonthlyPage", item);
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/advancemanagement?token=" + val.token + "&status=Approved"
      );
      data.subscribe((result) => {
        // var r = result.all;
        this.items = result.all;
      });
    });
  }
}
