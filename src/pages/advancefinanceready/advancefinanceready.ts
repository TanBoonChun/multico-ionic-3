import { Component } from "@angular/core";
import { NavController, NavParams, App, IonicPage } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-advancefinanceready",
  templateUrl: "advancefinanceready.html",
})
export class AdvancefinancereadyPage {
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
    this.navCtrl.push('AdvancefinancereadydetPage', item);
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/advancefinance?token=" + val.token
      );
      data.subscribe(
        (result) => {
          console.log(result);
          var r = result.advances;

          this.items = [];

          for (let res of r) {
            if (res.Status && res.Status.indexOf("Ready for Payment") >= 0) {
              this.items.push(res);
            }
          }
        },
        (err) => {
          this.items = [];
        }
      );
    });
  }
}
