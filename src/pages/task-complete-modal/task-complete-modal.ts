import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Toast } from "@ionic-native/toast";
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  ViewController,
} from "ionic-angular";
import { SERVER_URL } from "../../environment";
import { GlobalProvider } from "../../providers/global/global";

@IonicPage()
@Component({
  selector: 'page-task-complete-modal',
  templateUrl: 'task-complete-modal.html',
})
export class TaskCompleteModalPage {

  public taskForm: FormGroup;

  public token: any;
  public userTaskId;
  public complete_date;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public global: GlobalProvider,
    public alert: AlertController,
    public view: ViewController,
    public toast: Toast,
    public alertCtrl: AlertController,
    public loading: LoadingController
  ) {
    this.global.getStorageData().then(([user, token]) => {
      this.token = token.token;
    });
    this.userTaskId = this.navParams.get("id");
  }

  ngOnInit() {
    this.taskForm = new FormGroup({
      complete_date: new FormControl("", [Validators.required]),
    });
  }
  dismiss() {
    this.view.dismiss({ callback: false });
  }

  updateTask() {
    let loading = this.loading.create({
      content: "Please wait...",
    });
    loading.present();
    this.http
      .put(
        SERVER_URL + "/tasks/" + this.userTaskId,
        {},
        {
          params: {
            token: this.token,
            taskStatus: "completed",
            completeDate: this.complete_date
          },
        }
      )
      .finally(() => loading.dismiss())
      .timeout(10000)
      .subscribe(
        (result) => {
          this.toast.show("Completed", "2000", "center").subscribe();
          this.view.dismiss();
        },
        (error) => {
          if (error.name == "TimeoutError") {
            let alert = this.alertCtrl.create({
              title: "Error",
              subTitle: "Cannot connect to server..Please try again later.",
              buttons: ["Dismiss"],
            });
            alert.present();
          } else {
            let alert = this.alertCtrl.create({
              title: "Error",
              subTitle: "Something went wrong..Please try again later.",
              buttons: ["Dismiss"],
            });
            alert.present();
          }
        }
      );
  }
}
