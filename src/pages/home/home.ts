import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  App,
  LoadingController,
  AlertController,
  Platform,
  IonicPage,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AppPreferences } from "@ionic-native/app-preferences";
import { Badge } from "@ionic-native/badge";
import { AppVersion } from "@ionic-native/app-version";
import { Observable } from "rxjs/Observable";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { OneSignal } from "@ionic-native/onesignal";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";

@IonicPage()
@Component({
  selector: "page-home",
  templateUrl: "home.html",
})
export class HomePage {
  public serverUrl = SERVER_URL_WITHOUT_API;
  splash = true;

  currentDate;
  formattedDate;
  formattedTime;
  VersionNumber: string;
  currentYear: number = new Date().getFullYear();

  checkver: any = "";
  checkver2: any = "";

  ShareCost: any = "";

  public userImage: string;
  public Name: string = "";
  public Position: string = "";
  public Player_Id: string = "";
  public allAdvanceBadgeCount: any;
  public allBadgeCount: any;
  public allLeaveBadgeCount: any;
  public taskBadgeCount2: any;
  public taskBadgeCount: any;
  public listBadgeCount2: any;
  public listBadgeCount: any;
  public noticeBadgeCount: any;
  public user: any;
  public totalPendingPnl;
  public totalOrder;
  Workbase: any;
  projectcode: any;
  sitecode: any;
  advCount: any = "";
  myAppCount: any = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private storage: Storage,
    public app: App,
    public loadingCtrl: LoadingController,
    public http: HttpClient,
    private appPreferences: AppPreferences,
    private badge: Badge,
    private oneSignal: OneSignal,
    private appVersion: AppVersion,
    private alertCtrl: AlertController,
    private platform: Platform
  ) {
    this.currentDate = new Date();
    this.getFormattedDate();
    this.allAdvanceBadgeCount = 0;
    this.allBadgeCount = 0;
    this.allLeaveBadgeCount = 0;
    this.sitecode = 0;
    this.advCount = 0;
    this.myAppCount = 0;

    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getuser?token=" + val.token
      );
      data.subscribe((result) => {
        this.storage.set("user", result);
        this.oneSignal
          .getIds()
          .then((user) => {
            this.storage.set("playerid", user.userId);
            this.http
              .post(SERVER_URL + "/postplayerid?token=" + val.token, {
                Player_Id: user.userId,
              })
              .subscribe(
                (result) => {},
                (err) => {
                  console.log(err);
                }
              );
          })
          .catch((err) => console.log(err));
      });
    });

  }

  getFormattedDate() {
    var dateObj = new Date();

    var year = dateObj.getFullYear().toString();
    var month = dateObj.getMonth().toString();
    var date = dateObj.getDate().toString();

    var monthArray = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "Jun",
      "July",
      "August",
      "September",
      "October",
      "November",
      "Disember",
    ];

    this.formattedDate = year + "-" + monthArray[month] + "-" + date;
  }

  onGoToNotice() {
    this.navCtrl.push("NoticePage");
  }

  onGoToTask() {
    this.navCtrl.push('TaskPage');
  }

  onGoToLeaves(){
    this.navCtrl.push("LeavePage");
  }

  onGoToHoliday() {
    this.navCtrl.push("HolidayPage");
  }

  onGoToTimesheet() {
    this.navCtrl.push("TimesheetPage");
  }

  onGoToClaims() {
    this.navCtrl.push("ClaimPage");
  }

  onGoToAttendance() {
    this.navCtrl.push("AttendancemainPage", {
      Name: this.Name,
      ShareCost: this.ShareCost,
      Workbase: this.Workbase,
    });
  }

  onGoToAdvance() {
    this.navCtrl.push("AdvancePage");
  }

  onGoToLogout() {
    this.navCtrl.push("LogoutadminpermissionPage");
  }

  onGoToList() {
    this.navCtrl.push('ListmainPage');
  }

  onGoToGenset() {
    this.navCtrl.push('GensetmainPage');
  }

  logistic() {
    this.navCtrl.push("LogisticPage");
  }

  PendingApproval() {
    this.navCtrl.push("SitecodeapprovalPage");
  }

  ProjectApproval() {
    this.navCtrl.push("ProjectapprovalPage");
  }

  ionViewDidLoad() {
    setTimeout(() => (this.splash = false), 4000);
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("user").then((val) => {
      this.userImage = val.Web_Path;
      this.Name = val.Name;
      this.Position = val.Position;
      this.user = val;
      this.Workbase = val.Workbase;
      this.ShareCost = val.ShareCost;
    });

    this.appVersion.getVersionNumber().then(
      (versionNumber) => {
        this.VersionNumber = versionNumber;
      },
      (error) => {
        console.log(error);
      }
    );

    //check version
    // this.storage.get("token").then((val) => {
    //   data = this.http.get(
    //     SERVER_URL + "/version2?token=" + val.token
    //   );
    //   data.subscribe((result) => {
    //     this.checkver = result.ios;
    //     this.checkver2 = result.android;
    //     if (this.platform.is("ios")) {
    //       if (this.VersionNumber < this.checkver.VersionNo) {
    //         this.displayErrorAlert(
    //           "This is not the latest version, please update the apps"
    //         );
    //       }
    //     } else {
    //       if (this.VersionNumber < this.checkver2.VersionNo) {
    //         this.displayErrorAlert(
    //           "This is not the latest version, please update the apps"
    //         );
    //       }
    //     }
    //   });
    // });

    this.allBadgeCount = 0;
    this.storage.get("token").then((val) => {
      this.http
        .get<{ badge_count: any }>(
          SERVER_URL + "/advancemanagement?token=" + val.token
        )
        .subscribe((result) => {
          this.allAdvanceBadgeCount = result.badge_count;
          this.allBadgeCount = this.allBadgeCount + this.allAdvanceBadgeCount;
          this.setBadges(this.allBadgeCount);
        });
    });

    this.storage.get('token').then((val) => {
      this.http.get<{badge_count: any}>(SERVER_URL + '/notifications/allleave?token=' + val.token).subscribe(result => {
        this.allLeaveBadgeCount = result.badge_count;
        this.allBadgeCount = this.allBadgeCount + this.allLeaveBadgeCount;
        this.setBadges(this.allBadgeCount);
      })
    });


    this.storage.get("token").then((val) => {
      this.http
        .get<{ badge_count: any }>(
          SERVER_URL + "/notifications/getnoticebadge?token=" +
            val.token
        )
        .subscribe((result) => {
          this.noticeBadgeCount = result.badge_count;
          this.storage.set("test4", this.noticeBadgeCount);
        });
    });

    // this.storage.get("token").then((val) => {
    //   this.http
    //     .get<{ count: any }>(
    //       SERVER_URL + "/getoverduetodo?token=" + val.token
    //     )
    //     .subscribe((result) => {
    //       this.listBadgeCount2 = result.count;
    //     });
    // });

    //List
    // this.storage.get("token").then((val) => {
    //   this.http
    //     .get<{ count: any }>(
    //       SERVER_URL+"/getalllist?token=" + val.token
    //     )
    //     .subscribe((result) => {
    //       this.listBadgeCount = result.count;
    //       this.storage.set("test", this.listBadgeCount);
    //     });
    // });

    // this.storage.get("token").then((val) => {
    //   data = this.http.get(
    //     SERVER_URL + "/getsitecodeapproval?token=" + val.token
    //   );
    //   data.subscribe((result) => {
    //     this.projectcode = result.length;
    //     this.sitecode = result.length;
    //   });
    // });

    // this.storage.get("token").then((val) => {
    //   data = this.http.get(
    //     SERVER_URL + "/advancemanagement?token=" + val.token
    //   );
    //   data.subscribe((result) => {
    //     this.advCount = result.count;
    //   });

    //   this.http
    //     .get(SERVER_URL + "/profit/getData", {
    //       params: {
    //         token: val.token,
    //         status: "pending",
    //         page: "1",
    //       },
    //     })
    //     .subscribe((result: any) => {
    //       this.totalPendingPnl = result.total;
    //     });
    //   this.http
    //     .get(SERVER_URL + "/orders/index", {
    //       params: {
    //         token: val.token,
    //         status: "pending",
    //         page: "1",
    //       },
    //     })
    //     .subscribe((result: any) => {
    //       this.totalOrder = result.total;
    //     });
    // });

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getmyadvance2?token=" + val.token
      );
      data.subscribe((result) => {
        this.myAppCount = result.Appcount;
      });
    });
  }

  displayErrorAlert(err) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }

  logout() {
    let loading = this.loadingCtrl.create({
      content: "Logging out...",
      spinner: "crescent",
    });

    this.storage.get("token").then((val) => {
      this.oneSignal
        .getIds()
        .then((ids) => ids.userId)
        .catch(() => this.storage.get("playerid"))
        .then((playerid) => {
          loading.present();

          this.http
            .post(SERVER_URL + "/clearplayerid?token=" + val.token, {
              Player_Id: playerid ? playerid : "",
            })
            .finally(() => {
              loading.dismiss();
              this.storage.clear();
            })
            .subscribe(
              (result) => {
                this.navCtrl.setRoot("LoginPage");
              },
              (err) => {
                console.log(err);
                this.navCtrl.setRoot("LoginPage");
              }
            );
        });
    });
  }

  // badge icon count
  async setBadges(badgeNumber: number) {
    try {
      let badges = await this.badge.set(badgeNumber);
    } catch (e) {
      console.error(e);
    }
  }

  isObject(variable) {
    return typeof variable === "object";
  }

  navigateToProfitAndLossPage() {
    this.navCtrl.push("ProfitAndLossPage");
  }
  navigateToPrPage() {
    this.navCtrl.push("OrderPage");
  }
}
