import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ElementRef, ViewChild} from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}


@IonicPage()
@Component({
  selector: "page-advancemanagementpendingMonthly",
  templateUrl: "advancemanagementpendingMonthly.html",
})
export class AdvancemanagementpendingMonthlyPage {
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
  Total_Approved: any="-";
  Project_Name: any;
  mylevel: any;
  Remarks:any="";
  allApprover:any=[];
  partner:any=[];
  totalreq:any=[];
  StatusId:any;
  myattachment=[];

  ProjectId:any=''

  @ViewChild("myInput") myInput: ElementRef;
  @ViewChild("companyComponent") companyComponent: IonicSelectableComponent;

  resize() {
    var element = this.myInput[
      "_elementRef"
    ].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + "px";
    this.myInput["_elementRef"].nativeElement.style.height =
      scrollHeight + 16 + "px";
  }

  
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
    console.log("advanceid", this.advanceid);
    this.Project_Name = this.navParams.get("Project_Name");
    this.StatusId = this.navParams.get('StatusId')
    console.log(this.StatusId,'status id');
    this.AdvanceId = this.navParams.get("AdvanceId");
    this.AdvanceId = {
      AdvanceId: this.AdvanceId,
      Project_Name: this.Project_Name,
    };

    this.ProjectId = this.navParams.get('ProjectId')



    // this.Remarks="-";
  }

  ionViewDidEnter() {
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
        this.advance = result.advance[0];
        this.advancedetails = result.advancedetails;
        this.user = result.me;
        this.mylevel = result.mylevel;
        this.allApprover = result.allApprover;
        this.partner = result.partner;
        this.totalreq = result.totalreq;
        this.myattachment = result.myattachment;
      });
    });
  }

  approveAdvance() {
    const confirm = this.alertCtrl.create({
      title: "Approve Advance",
      message: "Are you sure want to approve this advance?",
      buttons: [
        {
          text: "No",
          handler: () => {
            console.log("No clicked");
          },
        },
        {
          text: "Yes",
          handler: () => {
            let loading = this.loadingCtrl.create({
              content: "Submitting ...",
            });

            loading.present();

            // setTimeout(() => {
            //   loading.dismiss();
            // }, 2000);

            this.storage.get("token").then((val) => {
              let status = "Approved";
              if (this.mylevel) {
                if (this.mylevel.Level == "1st Approval") {
                  status = "1st Approved";
                }
                if (this.mylevel.Level == "2nd Approval") {
                  status = "2nd Approved";
                }
                if (this.mylevel.Level == "3rd Approval") {
                  status = "3rd Approved";
                }
                if (this.mylevel.Level == "4th Approval") {
                  status = "4th Approved";
                }
                if (this.mylevel.Level == "5th Approval") {
                  status = "5th Approved";
                }
                if (this.mylevel.Level == "Final Approval") {
                  status = "Final Approved";
                }
              }

              this.http
                .post(
                  SERVER_URL + "/advanceapprove3?token=" + val.token,
                  {
                    Total_Approved: this.Total_Approved,
                    AdvanceId: this.advanceid,
                    status: status,
                    remarks:this.Remarks,
                    StatusId: this.StatusId,
                    ProjectId: this.advance.ProjectId
                  },
                  httpOptions
                )
                .subscribe((res: any) => {
                  console.log(res);
                  if (res == 1 || res == 0) {
                    this.http
                    .post(
                      SERVER_URL + "/notifications/updateadvancepending?token=" +
                      val.token,
                      { TargetId: this.advanceid }
                      )
                      .subscribe((result) => {
                        console.log(result);
                      });
                      loading.dismiss();
                      this.navCtrl.pop();
                      this.toast
                    .show(`Advance Approved`, "5000", "center")
                    .subscribe((toast) => {
                    });
                  }
                }),
                (err) => {
                  this.displayErrorAlert(
                    err.error
                  );
                  loading.dismiss();
                }
            });
          },
        },
      ],
    });
    confirm.present();
  }

  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }

  rejectAdvance() {
    const confirm = this.alertCtrl.create({
      title: "Reject Advance",
      message: "Are you sure want to reject this advance?",
      buttons: [
        {
          text: "No",
          handler: () => {
          },
        },
        {
          text: "Yes",
          handler: () => {
            console.log("Yes clicked");
            let loading = this.loadingCtrl.create({
              content: "Submitting ...",
            });
            loading.present();
            // setTimeout(() => {
            //   loading.dismiss();
            // }, 2000);

            this.storage.get("token").then((val) => {
              let status = "Rejected";
              // if (this.mylevel) {
              //   if (this.mylevel.Level == "1st Approval") {
              //     status = "1st Rejected";
              //   }
              //   if (this.mylevel.Level == "2nd Approval") {
              //     status = "2nd Rejected";
              //   }
              //   if (this.mylevel.Level == "3rd Approval") {
              //     status = "3rd Rejected";
              //   }
              //   if (this.mylevel.Level == "4th Approval") {
              //     status = "4th Rejected";
              //   }
              //   if (this.mylevel.Level == "5th Approval") {
              //     status = "5th Rejected";
              //   }
              //   if (this.mylevel.Level == "Final Approval") {
              //     status = "Final Rejected";
              //   }
              // }
              this.http
                .post(
                  SERVER_URL + "/advancereject2?token=" +
                    val.token +
                    "&AdvanceId=" +
                    this.advanceid,
                  {
                    AdvanceId: this.advanceid,
                    Status: status,
                    remarks:this.Remarks,
                    StatusId: this.StatusId

                  },
                  httpOptions
                )
                .subscribe((res: any) => {
                  loading.dismiss();
                  this.navCtrl.pop();
                  console.log(res);
                  this.toast
                    .show(`Advance Rejected`, "5000", "center")
                    .subscribe((toast) => {
                      console.log(toast);
                    });
                });
              this.http
                .post(
                  SERVER_URL + "/notifications/updateadvancepending?token=" +
                    val.token,
                  { TargetId: this.advanceid }
                )
                .subscribe((result) => {
                  console.log(result);
                });
            });
          },
        },
      ],
    });
    confirm.present();
  }
}
