import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";

import { DomSanitizer } from "@angular/platform-browser";
import { AlertController } from "ionic-angular";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-listdetails",
  templateUrl: "listdetails.html",
})
export class ListdetailsPage {
  private TaskId: any;
  private Id: any = "";
  private UserId: any = "";
  public items: any;
  private Project_Name: string;
  private Project_Code: string;
  private Threshold: string;
  private Current_Task: string;
  private Previous_Task: string;
  private Previous_Task_Date: string;
  public Remarks: any = "";
  public signupform: FormGroup;
  formData: FormData;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    private toast: Toast,
    public navParams: NavParams
  ) {
    this.TaskId = this.navParams.get("Id");
    this.UserId = this.navParams.get("UserId");
    this.Project_Name = this.navParams.get("Project_Name");
    this.Project_Code = this.navParams.get("Project_Code");
    this.Threshold = this.navParams.get("Threshold");
    this.Current_Task = this.navParams.get("Current_Task");
    this.Previous_Task = this.navParams.get("Previous_Task");
    this.Previous_Task_Date = this.navParams.get("Previous_Task_Date");
    this.Remarks = this.navParams.get("Remarks");
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Remarks: new FormControl("", []),
    });
  }

  submitReject() {
    console.log(this.TaskId);
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
      spinner: "crescent",
      duration: 40000,
    });
    loading.present();
    loading.dismiss();
    this.storage.get("token").then((val) => {
      this.http
        .post(
          SERVER_URL + "/listchangetaskstatus?token=" + val.token,
          {
            ListId: this.TaskId,
            Status: "Rejected",
            Reason: this.Remarks,
            Current_Task: this.Current_Task,
          },
          httpOptions
        )
        .subscribe((res: any) => {
          this.navCtrl.popTo(
            this.navCtrl.getByIndex(this.navCtrl.length() - 3)
          );
          this.toast
            .show(`Task Rejected`, "5000", "center")
            .subscribe((toast) => {
            });
        });
    });
  }

  isObject(variable) {
    return typeof variable === "object";
  }
}
