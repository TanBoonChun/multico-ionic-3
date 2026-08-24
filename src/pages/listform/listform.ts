import { Component } from "@angular/core";
import { AlertController, IonicPage, NavParams } from "ionic-angular";
import { NavController, App, LoadingController } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-listform",
  templateUrl: "listform.html",
})
export class ListformPage {
  private token: string = "";
  public signupform: FormGroup;
  PIC: any = "";
  AssignDate: any = "";
  DueDate: any = "";
  Task: any = "";
  Reminder: any = "";
  Repeat: any = "";
  item: any = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController
  ) {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getpic?token=" + val.token
      );
      data.subscribe((result) => {
        this.item = result;
      });
    });
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      PIC: new FormControl("", [Validators.required]),
      AssignDate: new FormControl("", []),
      DueDate: new FormControl("", []),
      Task: new FormControl("", [Validators.required]),
      Reminder: new FormControl("", []),
      Repeat: new FormControl("", []),
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ListformPage");
  }

  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    var day = ("0" + d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + "-" + monthNames[monthIndex] + "-" + year;
  }

  submitList() {
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });

    loading.present();

    if (this.Reminder == "") {
      this.Reminder = "Daily";
    }

    if (this.Repeat == "") {
      this.Repeat = "No";
    }

    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/todolistCreate?token=" + val.token,
          {
            PIC: this.PIC,
            AssignDate: this.myFunction(this.AssignDate),
            DueDate: this.myFunction(this.DueDate),
            Task: this.Task,
            Reminder: this.Reminder,
            Repeat: this.Repeat,
          },
          httpOptions
        )
        .finally(() => loading.dismiss())
        .subscribe(
          (res: any) => {
            this.navCtrl.pop();
            this.toast
              .show(`New To-Do List created`, "5000", "center")
              .subscribe((toast) => {});
          },
          (err) => {
            let alert = this.alertCtrl.create({
              title: "Error",
              subTitle: "Something went wrong..Please try again later",
              buttons: ["Dismiss"],
            });

            alert.present();
          }
        );
    });
  }
}
