import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
} from "ionic-angular";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-order-approval",
  templateUrl: "order-approval.html",
})
export class OrderApprovalPage {
  public orders = [];
  public status: string;
  page: any = 1;
  maxPage = 0;
  search = false;
  searchValue = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public storage: Storage,
    public loading: LoadingController,
    public alert: AlertController
  ) {
    this.status = this.navParams.get("status");
  }

  ionViewDidLoad() {
    let loading = this.loading.create({
      content: "Please wait...",
    });
    loading.present();
    this.loadData(null, loading);
  }

  loadData(event?, loading?, refresher?) {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/orders/index", {
          params: {
            token: val.token,
            page: this.page,
            status: this.status,
            search: this.searchValue,
          },
        })
        .timeout(10000)
        .finally(() => {
          if (loading) {
            loading.dismiss();
          }
        })
        .subscribe(
          (response: any) => {
            this.maxPage = response.last_page;
            this.search = false;
            var ids = new Set(this.orders.map((data) => data.Id));
            this.orders = [
              ...this.orders,
              ...response.data.filter((data) => !ids.has(data.Id)),
            ];
            if (event) {
              event.complete();
            }
            if (refresher) {
              refresher.complete();
            }
          },
          (err) => {
            if (err.name == "TimeoutError") {
              let alert = this.alert.create({
                title: "Error",
                subTitle: "Cannot connect to server..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            } else {
              let alert = this.alert.create({
                title: "Error",
                subTitle: "Something went wrong..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            }
            this.search = false;
            if (refresher) {
              refresher.complete();
            }
          }
        );
    });
  }

  loadMoreData(event) {
    if (this.page === this.maxPage) {
      event.enable(false);
      return;
    }
    this.page++;
    this.loadData(event);
  }

  navigateToDetailsPage(id) {
    let myCallbackFunction = (_params) => {
      return new Promise((resolve, reject) => {
        this.orders = [];
        this.page = 1;
        this.loadData();
        resolve();
      });
    };
    this.navCtrl.push("OrderDetailsPage", {
      id: id,
      callback: myCallbackFunction,
    });
  }
  onInput(event) {
    this.search = true;
    this.orders = [];
    this.loadData(null, null);
  }

  doRefresh(refresher) {
    this.orders = [];
    this.page = 1;
    this.loadData(null, null, refresher);
  }
}
