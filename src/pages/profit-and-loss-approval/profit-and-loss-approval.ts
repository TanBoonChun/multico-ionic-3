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
  selector: "page-profit-and-loss-approval",
  templateUrl: "profit-and-loss-approval.html",
})
export class ProfitAndLossApprovalPage {
  protected pnls = [];

  protected status;
  page: any = 1;

  maxPage = 0;
  public searchValue;
  public search = false;
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

  ionViewWillEnter() {
    let loading = this.loading.create({
      content: "Please wait...",
    });
    loading.present();
    this.loadData(null, loading);
  }
  loadData(event?, loading?, refresher?) {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/profit/getData", {
          params: {
            token: val.token,
            status: this.status,
            page: this.page,
            search: this.searchValue || "",
          },
        })
        .timeout(10000)
        .finally(() => {
          if (!refresher && loading) {
            loading.dismiss();
          }
        })
        .subscribe(
          (result: any) => {
            if (refresher) {
              refresher.complete();
            }
            this.search = false;
            this.maxPage = result.last_page;
            var ids = new Set(this.pnls.map((data) => data.Id));
            this.pnls = [
              ...this.pnls,
              ...result.data.filter((data) => !ids.has(data.Id)),
            ];
            if (event) {
              event.complete();
            }
          },
          (err) => {
            if(refresher){
              refresher.complete();
            }
            if (err.name == "TimeoutError") {
              let alert = this.alert.create({
                title: "Error",
                subTitle: "Cannot connect to server..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            }else{
              let alert = this.alert.create({
                title: "Error",
                subTitle: "Something went wrong..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            }
            this.search = false;
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
        this.pnls = [];
        this.page = 1;
        this.loadData();
        resolve();
      });
    };
    this.navCtrl.push("ProfitAndLossDetailsPage", {
      id: id,
      callback: myCallbackFunction,
    });
  }

  onInput(event) {
    this.search = true;
    this.page = 1;
    this.pnls = [];
    this.loadData(null, null);
  }

  doRefresh(refresher) {
    this.pnls = [];
    this.page = 1;
    this.loadData(null, null, refresher);
  }
}
