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
  selector: "page-task-list",
  templateUrl: "task-list.html",
})
export class TaskListPage {
  public tasks = [];

  public infiniteScroll: any;
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
    this.status = this.navParams.data;
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
        .get(SERVER_URL + "/tasks", {
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
            var ids = new Set(this.tasks.map((data) => data.Id));

            this.tasks = [
              ...this.tasks,
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
    this.infiniteScroll = event;
    if (this.page === this.maxPage) {
      event.enable(false);
      return;
    }
    this.page++;
    this.loadData(event);
  }

  onInput(event) {
    this.search = true;
    this.infiniteScroll ? this.infiniteScroll.enable(true) : null;
    this.page = 1;
    this.tasks = [];
    this.loadData(null, null);
  }

  onCancel(event) {
    this.page = 1;
    this.infiniteScroll ? this.infiniteScroll.enable(true) : null;
    this.tasks = [];
    this.loadData();
  }

  doRefresh(refresher) {
    this.tasks = [];
    this.infiniteScroll ? this.infiniteScroll.enable(true) : null;
    this.page = 1;
    this.loadData(null, null, refresher);
  }

  navigateToDetails(task) {
    let myCallbackFunction = (_params) => {
      return new Promise((resolve, reject) => {
        if(_params && !_params.callback){
          return;
        }
        this.tasks = [];
        this.page = 1;
        this.loadData();
        resolve();
      });
    };

    this.navCtrl.push("TaskDetailsPage", {
      ...task,
      // user_task_id: userTaskId,
      callback: myCallbackFunction,
    });
  }
}
