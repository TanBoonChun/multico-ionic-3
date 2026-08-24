import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { ElementRef, Renderer, ViewChild } from "@angular/core";
import { Geolocation } from "@ionic-native/geolocation";
import { App, LoadingController } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { AlertController } from "ionic-angular";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Toast } from "@ionic-native/toast";
import { ToastController } from "ionic-angular";
import { IonicSelectableComponent } from "ionic-selectable";
import { Subscription } from "rxjs";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { File, FileEntry } from "@ionic-native/file";

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CameraOptions, Camera } from "@ionic-native/camera";
import { DomSanitizer } from "@angular/platform-browser";
import { Base64 } from "@ionic-native/base64";
import { SERVER_URL } from "../../environment";
@IonicPage()
@Component({
  selector: "page-attendancesharecost",
  templateUrl: "attendancesharecost.html",
})
export class AttendancesharecostPage {
  currentDate;
  formattedDate;
  formattedDateObj;
  portsSubscription: Subscription;

  Date: any;
  Time: string;
  Latitude_In: any;
  Longitude_In: any;
  Latitude_Out: any;
  Longitude_Out: any;
  Check_In_Type: string;
  Department: any;
  Site_Name: string;
  Timesheet_Name: string;
  Id: string;
  Leader_Member: string;
  Next_Person: string;
  ProjectId: string;
  State: string;
  Work: string;
  Reason: string;
  Remarks: string = "";
  Work_Description: string;
  hideUI: any;
  types: any;
  departs: any;
  Name: string = "";
  items: any;
  UserId: any;
  token: string = "";
  public signupform: FormGroup;
  projectOptions: any;
  scope: any;
  apps: any;
  Scope: any;
  ScopeOfWork: any;
  Project_Code: any;
  Location_Name: "";
  loading: any;
  tmpListener: any;
  tasks: any;
  Task: any;
  formData: FormData;
  images = [];
  imagesN = [];

  @ViewChild("myInput") myInput: ElementRef;
  resize() {
    var element =
      this.myInput["_elementRef"].nativeElement.getElementsByClassName(
        "text-input"
      )[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + "px";
    this.myInput["_elementRef"].nativeElement.style.height =
      scrollHeight + 16 + "px";
  }
  @ViewChild("portComponent") portComponent: IonicSelectableComponent;

  constructor(
    public navCtrl: NavController,
    public geo: Geolocation,
    public alertCtrl: AlertController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    private locationAccuracy: LocationAccuracy,
    private toast: Toast,
    private toastCtrl: ToastController,
    private renderer: Renderer,
    public platform: Platform,
    private file: File,
    private base64: Base64,
    private camera: Camera,
    public domSanitizer: DomSanitizer
  ) {
    // this.enableLocation();
    this.currentDate = new Date();
    this.getFormattedDate();
    setInterval(() => {
      this.time();
    }, 1000);
    this.Date = new Date();
    this.Time = this.calculateTime("-4");

    this.Id = this.navParams.get("Id");
    this.Timesheet_Name = this.navParams.get("Timesheet_Name");
    this.Name = this.navParams.get("Name");
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Latitude_In: new FormControl("", [Validators.required]),
      Longitude_In: new FormControl("", [Validators.required]),
      Remarks: new FormControl("", []),
      Task: new FormControl("", []),
    });
    this.Check_In_Type = "On Duty";
  }

  enableLocation() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy
          .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
          .then(
            () => alert("Location information is on"),
            (error) =>
              alert(
                "Error requesting location permissions" + JSON.stringify(error)
              )
          );
      }
    });
  }

  filterPorts(apps: any, text: string) {
    return apps.filter((app) => {
      console.log(app);
      return app.siteCode.toLowerCase().indexOf(text) !== -1;
    });
  }
  siteCode() {
    let selectedProjectCode = this.Department;
    if (!selectedProjectCode) return;
    if (typeof selectedProjectCode["Site_Code"] !== "undefined") {
      let options = selectedProjectCode["Site_Code"].map(function (item) {
        let siteCode = "";
        switch (item.Level) {
          case 1:
            siteCode = item.Department;
            break;
          case 2:
            siteCode = item.Segment;
            break;
          case 3:
            siteCode = item.Contract_No;
            break;
          case 4:
            siteCode = item.PO_No;
            break;
          case 5:
            siteCode = item.Site_ID;
            break;
        }
        let obj = { Id: item["Id"], siteCode: item.Option + " - " + siteCode };
        return obj;
      });
      this.apps = options;
    } else {
      // this.apps=[{Id:selectedProjectCode.Id,siteCode:selectedProjectCode.Project_Code}];
    }
  }
  searchApps(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 2) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    // event.component.items = this.filterPorts(this.apps, text);
    event.component.items = this.apps.filter(
      (a) => a.siteCode.toLowerCase().indexOf(text) !== -1
    );
    event.component.endSearch();
  }
  searchProjectCode(event: {
    component: IonicSelectableComponent;
    text: string;
  }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 2) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    console.log(this.departs);
    // event.component.items = this.filterPorts(this.departs,text);

    event.component.items = this.departs.filter(
      (d) => d.Project_Code.toLowerCase().indexOf(text) !== -1
    );
    event.component.endSearch();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  getFormattedDate() {
    var dateObj = new Date();

    var year = dateObj.getFullYear().toString();
    var month = dateObj.getMonth().toString();
    var date = dateObj.getDate().toString();

    var monthArray = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dis",
    ];

    this.formattedDate = year + "-" + monthArray[month] + "-" + date;
    this.formattedDateObj = new Date(this.formattedDate);
  }

  calculateTime(offset: any) {
    // create Date object for current location
    let d = new Date();

    // create new Date object for different city
    // using supplied offset
    let nd = new Date(d.getTime() + 3600000 * offset);

    return nd.toISOString();
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

  startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10

    return h + ":" + m + ":" + s;
  }

  setProjectOptions(value) {
    let arrApps = new Array();
    let projectName = "";

    if (!this.departs) {
      return;
    }

    for (let depart of this.departs) {
      if (depart.Id == value) {
        projectName = depart.Project_Name;
        break;
      }
    }
    this.projectCode(value);
    // this.scopeOfWorks(value);
    this.projectOptions = arrApps;
  }

  // scopeOfWorks(id) {
  //   let data: Observable<any>;

  //   // Scope of work
  //   this.storage.get("token").then((val) => {
  //     data = this.http.get(
  //       SERVER_URL + "/getscope/" + id + "?token=" + val.token
  //     );
  //     data.subscribe((result) => {
  //       console.log(result);
  //       this.scope = result;
  //     });
  //   });
  // }

  onOpen($event) {
    this.loading.dismiss();
  }

  showLoading() {
    // alert();
    this.loading = this.loadingCtrl.create({
      content: "Loading...",
      spinner: "crescent",
    });
    this.loading.present();

    setTimeout(() => {
      this.loading.dismiss();
    }, 5000);
  }

  projectCode(id) {
    let data: Observable<any>;
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojectcodes/" +
          id +
          "?token=" +
          val.token
      );
      data.subscribe((result) => {
        console.log(result);
        let apps = new Array();
        for (let res of result) {
          res.Project_Code =
            res.Project_Code +
            " - " +
            res["Site Id"] +
            " - " +
            res["Site LRD"] +
            " - " +
            res["Site Name"];

          apps.push(res);
        }
        this.apps = apps;
      });
    });
  }

  GroupData(data) {
    return data.split(" - ");
  }
  loadData() {
    this.storage.get("timein_id").then((val) => {
      this.Id = val;
    });
    this.storage.get("timein").then((val) => {
      this.hideUI = val;
    });
    this.storage.get("user").then((val) => {
      this.Name = val.Name;
    });
    let data: Observable<any>;

    this.geo
      .getCurrentPosition()
      .then((pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;
      })
      .catch((err) => console.log(err));
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojects?token=" + val.token + "&type=attendance"
      );
      data.subscribe((result) => {
        this.departs = result;
      });

      this.http
        .get<any>(
          SERVER_URL + "/gettodoincomplete?token=" + val.token
        )
        .subscribe((result) => {
          this.tasks = result.list;
          if (result.count > 0) {
            this.signupform.get("Task").setValue(this.tasks[0].Id);
          } else {
            this.signupform.get("Task").setValue(null);
          }
        });
    });
  }

  doRefresh() {
    // console.log('Begin async operation', refresher);

    this.platform.ready().then(() => {
      let loading = this.loadingCtrl.create({
        content: "Refreshing Latitude & Longitude...",
        spinner: "cresent",
      });
      loading.present();
      //request location here
      this.geo
        .getCurrentPosition()
        .then((pos) => {
          this.Latitude_In = pos.coords.latitude;
          this.Longitude_In = pos.coords.longitude;
          loading.dismiss();
          alert("Location Refreshed");
        })
        .catch((err) => console.log(err));
    });
  }

  submitTimeIn() {
    let loading = this.loadingCtrl.create({
      content: "Time in...",
      spinner: "crescent",
    });

    loading.present();

    this.geo
      .getCurrentPosition({ enableHighAccuracy: true })
      .then((pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;
        this.storage.get("token").then((val) => {
          let p = new Promise((resolveReady) => {
            var defs = [];
            this.formData = new FormData();
            this.images.forEach((i) => {
              console.log("processing " + i);
              var self = this;
              var def = new Promise((resolve) => {
                this.file.resolveLocalFilesystemUrl(i).then(
                  (entry: FileEntry) => {
                    entry.file(
                      function (file) {
                        console.log("now i have a file ob", file.name);
                        console.dir(JSON.stringify(file));
                        var reader = new FileReader();
                        reader.onloadend = function (e) {
                          var imgBlob = new Blob([this.result], {
                            type: file.type,
                          });
                          self.formData.append(
                            "attachment[]",
                            imgBlob,
                            file.name
                          );
                          resolve(i);
                        };
                        reader.readAsArrayBuffer(file);
                      },
                      function (e) {
                        console.log("error getting file", e);
                      }
                    );
                  },
                  (err) => {
                    console.log("Put error message here", JSON.stringify(err));
                  }
                );
              });

              defs.push(def);
            });

            Promise.all(defs).then((res) => {
              this.formData.append("Latitude_In", this.Latitude_In);
              this.formData.append("Longitude_In", this.Longitude_In);
              this.formData.append("Date", this.myFunction(this.Date));
              this.formData.append("Time", this.startTime());
              this.formData.append("Check_In_Type", "On Duty");
              // this.formData.append("Site_Code", this.Project_Code.Id);
              this.formData.append("Site_Name", "");
              this.formData.append("Leader_Member", "");
              this.formData.append("Next_Person", "");
              this.formData.append("ProjectId", "3576");
              this.formData.append("State", "");
              this.formData.append("Work", "");
              this.formData.append("Reason", "");
              this.formData.append("Remarks", this.Remarks);
              this.formData.append("Work_Description", "");
              this.formData.append("Scope", "");
              this.formData.append("TaskId", this.Task);
              this.formData.append("Site_Code", "");

              resolveReady();
            });
          });
          p.then(() => {
            return this.http
              .post(
                SERVER_URL + "/newtimesheet2?token=" + val.token,
                this.formData,
                {}
              )
              .subscribe(
                (res: any) => {
                  this.storage.set("timein", true);
                  this.storage.set("timein_id", res);
                  this.hideUI = true;
                  this.Id = res;
                  loading.dismiss();
                  this.clearImage();
                  this.signupform.reset();
                  this.formData = new FormData();
                  this.presentToastIn();
                },
                (err) => {
                  console.log(err.error.error);
                  this.displayErrorAlert(err.error.error);
                  loading.dismiss();
                }
              );
          });
        });
      })
      .catch((err) => {
        this.displayErrorAlert("Please make sure your GPS is enabled.");
        loading.dismiss();
      });
  }

  presentToastIn() {
    let toast = this.toastCtrl.create({
      message: "Time-In success",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "green",
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
  }

  submitTimeOut() {
    let loading = this.loadingCtrl.create({
      content: "Time out...",
      spinner: "crescent",
    });

    loading.present();

    this.geo
      .getCurrentPosition()
      .then((pos) => {
        this.storage.get("token").then((val) => {
          this.Latitude_Out = pos.coords.latitude;
          this.Longitude_Out = pos.coords.longitude;

          let p = new Promise((resolveReady) => {
            var defs = [];
            this.formData = new FormData();
            this.images.forEach((i) => {
              console.log("processing " + i);
              var self = this;
              var def = new Promise((resolve) => {
                this.file.resolveLocalFilesystemUrl(i).then(
                  (entry: FileEntry) => {
                    entry.file(
                      function (file) {
                        console.log("now i have a file ob", file.name);
                        console.dir(JSON.stringify(file));
                        var reader = new FileReader();
                        reader.onloadend = function (e) {
                          var imgBlob = new Blob([this.result], {
                            type: file.type,
                          });
                          self.formData.append(
                            "attachment[]",
                            imgBlob,
                            file.name
                          );
                          resolve(i);
                        };
                        reader.readAsArrayBuffer(file);
                      },
                      function (e) {
                        console.log("error getting file", e);
                      }
                    );
                  },
                  (err) => {
                    console.log("Put error message here", JSON.stringify(err));
                  }
                );
              });

              defs.push(def);
            });

            Promise.all(defs).then((res) => {
              this.formData.append("Latitude_Out", this.Latitude_Out);
              this.formData.append("Longitude_Out", this.Longitude_Out);
              this.formData.append("Time_Out", this.startTime());
              this.formData.append("Id", this.Id);
              resolveReady();
              console.log(this.Id, "Id");
            });
          });
          p.then(() => {
            return this.http
              .post(
                SERVER_URL + "/timeout?token=" + val.token,
                this.formData,
                {}
              )
              .subscribe(
                (res: any) => {
                  this.storage.set("timein", false);
                  this.hideUI = false;
                  loading.dismiss();
                  this.clearImage();
                  this.signupform.reset();
                  this.formData = new FormData();
                  this.presentToastOut();
                },
                (err) => {
                  this.displayErrorAlert(err.error);
                  loading.dismiss();
                }
              );
          });
        });
      })
      .catch((err) => {
        this.displayErrorAlert("Please make sure your GPS is enabled.");
        loading.dismiss();
      });
  }

  presentToastOut() {
    let toast = this.toastCtrl.create({
      message: "Time-Out success",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "green",
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
  }

  onSafetyCheck() {
    this.navCtrl.push("SafetyCheckPage");
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        this.images.push(imageData);


        if (this.platform.is("ios")) {
          let filePath = imageData;
          let fileName = filePath.split("/").pop();
          let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
          this.file
            .readAsDataURL(path, fileName)
            .then((base64File) => {
              this.imagesN.push(
                this.domSanitizer.bypassSecurityTrustResourceUrl(base64File)
              );
            })
            .catch(() => {
              console.log("Error reading file");
            });
        } else {
          this.base64.encodeFile(imageData).then(
            (base64File: string) => {
              this.imagesN.push(
                this.domSanitizer.bypassSecurityTrustResourceUrl(
                  "data:image/jpeg/jpg;base64," +
                    base64File.substring(base64File.indexOf(",") + 1)
                )
              );
            },
            (err) => {
              console.log(err);
            }
          );
        }
      },
      (err) => {
        this.displayErrorAlert(err);
      }
    );
  }

  clearImage() {
    this.images.length = 0;
    this.imagesN.length = 0;
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

  clock: any;

  time() {
    var d = new Date();
    var s = d.getSeconds();
    var m = d.getMinutes();
    var h = d.getHours();
    this.clock = h + ":" + ("00" + m).slice(-2) + ":" + ("00" + s).slice(-2);
  }
}
