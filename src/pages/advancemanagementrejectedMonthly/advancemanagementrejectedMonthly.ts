import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@IonicPage()
@Component({
  selector: "page-advancemanagementrejectedMonthly",
  templateUrl: "advancemanagementrejectedMonthly.html",
})
export class AdvancemanagementrejectedMonthlyPage {
  public serverUrl = SERVER_URL_WITHOUT_API;
  items: any;
  Leave_Type: any = "";
  Leave_Term: any = "";
  Start_Date: any = "";
  End_Date: any = "";
  Reason: any = "";
  Department: any = "";
  Approver: any = "";
  image: string;
  myphoto: string;
  reason: string;
  apps: any;
  approverOptions: any;
  departs: any;
  types: any;
  terms: any;
  advancedetails: any = [];
  advance: any = {};
  advanceid: any;
  user: any = {};
  private token: string = "";
  AdvanceId: any;
  Total_Approved: any;
  allApprover: any = [];
  partner: any = [];
  totalreq: any = [];
  myattachment = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public loadingCtrl: LoadingController
  ) {
    this.advanceid = this.navParams.get("Id");

    this.AdvanceId = this.navParams.get("AdvanceId");
  }

  ionViewWillEnter() {
    this.loadData();
  }

  setApproverOptions(value) {
    let arrApps = new Array();
    let projectName = "";
    for (let depart of this.departs) {
      if (depart.Id == value) {
        projectName = depart.Project_Name;
        break;
      }
    }
    for (let app of this.apps) {
      if (app.Project_Name == projectName) {
        arrApps.push(app);
      }
    }

    this.approverOptions = arrApps;
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/adminadvances2/" +
          this.advanceid +
          "?token=" +
          val.token
      );
      data.subscribe((result) => {
        console.log(result.advance);
        this.advance = result.advance[0];
        this.advancedetails = result.advancedetails;
        this.user = result.me;
        this.allApprover = result.allApprover;
        this.partner = result.partner;
        this.totalreq = result.totalreq;
        this.myattachment = result.myattachment;

        console.log(this.user);
      });
    });
  }

  approveAdvance() {
    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/advanceapprove?token=" + val.token,
          {
            Total_Approved: this.Total_Approved,
            AdvanceId: this.advanceid,
            Status: "Approved",
          },
          httpOptions
        )
        .subscribe((res: any) => {
          this.navCtrl.pop();
          console.log(res);
        });
    });
  }
}
