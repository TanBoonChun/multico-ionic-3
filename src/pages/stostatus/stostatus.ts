import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-stostatus",
  templateUrl: "stostatus.html",
})
export class StostatusPage {
  a: any;
  b: any;
  cuslist: any;
  item: any;

  constructor(
    public navCtrl: NavController,
    public http: HttpClient,
    public navParams: NavParams,
    public storage: Storage
  ) {
    this.loadData();
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getAllSto?token=" + val.token
      );
      data.subscribe((result) => {
        this.a = result.list;
        this.b = result.list;
      });
    });
  }

  ionViewWIllEnter() {
    this.loadData();
  }

  goToStatusDetail(item) {
    this.navCtrl.push('StostatusdetailPage', item);
  }

  onCancel(ev) {
    ev.target.value = "";
    this.loadData();
  }

  gen() {
    this.cuslist = this.b;
  }

  getList(ev: any) {
    console.log(ev.target.value);
    this.gen();
    let serVal = ev.target.value;
    console.log(serVal);
    if (serVal && serVal.trim() != "") {
      this.b = this.b.filter((item) => {
        return (
          item.Contract_No.toLowerCase().indexOf(serVal.toLowerCase()) > -1 ||
          item.Date.toLowerCase().indexOf(serVal.toLowerCase()) > -1 ||
          item.Site_ID.toLowerCase().indexOf(serVal.toLowerCase()) > -1 ||
          item.Contract_No.toLowerCase().indexOf(serVal.toLowerCase()) > -1
        );
      });
    } else {
      this.onCancel(ev);
    }
  }

  onChange($event) {
    var status = $event;
    this.a.status = status;
    if (status == "All") this.b = this.a;
    else {
      this.b = this.a.filter((item) => {
        return item.status == status;
      });
    }
  }
}
