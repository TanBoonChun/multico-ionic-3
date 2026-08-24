import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
import { ElementRef, Renderer, ViewChild} from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Toast } from '@ionic-native/toast';
import { ToastController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Subscription } from 'rxjs';
import { File, FileEntry, IFile } from "@ionic-native/file";


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

import { FormControl, FormGroup, Validators} from '@angular/forms';
import { text } from '@angular/core/src/render3/instructions';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64';
import { catchError } from 'rxjs/operators';
import { SERVER_URL } from '../../environment';

@IonicPage()
@Component({
  selector: "page-attendancebreak",
  templateUrl: "attendancebreak.html",
})
export class AttendancebreakPage {
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
  Department: string;
  Site_Name: any;
  Timesheet_Name: string;
  Id: string;
  Leader_Member: string;
  Next_Person: string;
  ProjectId: string;
  State: string;
  Work: string;
  Reason: string;
  Remarks: string = "";
  Remarks2: string = "";
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
  DepartmentUser: any = "";
  site: any;
  radiusitem: any = "";
  radius: any = "";
  tasks: any;
  Task: any;
  images = [];
  imagesN = [];
  formData: FormData;
  TrackerId: any;

  @ViewChild("myInput") myInput: ElementRef;
  resize() {
    var element = this.myInput[
      "_elementRef"
    ].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + "px";
    this.myInput["_elementRef"].nativeElement.style.height =
      scrollHeight + 16 + "px";
  }
  @ViewChild("portComponent") portComponent: IonicSelectableComponent;

  // showLoading() {
  //     this.portComponent.showLoading();
  // }

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
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    private file: File,
    private base64: Base64
  ) {
    // this.enableLocation();
    this.currentDate = new Date();
    this.getFormattedDate();
    // setInterval(() => {
    //   this.Date = Date.now();
    // },1);
    setInterval(() => {this.time()},1000);

    this.Date = new Date();
    this.Time = this.calculateTime("-4");
    this.Id = this.navParams.get("Id");

    this.Timesheet_Name = this.navParams.get("Timesheet_Name");
    this.Name = this.navParams.get("Name");
    console.log(this.Id)
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      // Check_In_Type: new FormControl('', [Validators.required]),
      // Department: new FormControl('', [Validators.required]),
      Latitude_In: new FormControl("", [Validators.required]),
      Longitude_In: new FormControl("", [Validators.required]),
      Site_Name: new FormControl("", []),
      Task: new FormControl("", []),
      // Project_Code: new FormControl('', [Validators.required]),
      // ScopeOfWork: new FormControl('', [Validators.required]),
      Remarks: new FormControl("", []),
      Remarks2: new FormControl("", []),
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

  filterPorts(site: any, text: string) {
    return site.filter((site) => {
      return site.Location_Name.toLowerCase().indexOf(text) !== -1;
    });
  }

  searchApps(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 1) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    event.component.items = this.filterPorts(this.site, text);
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

  setSiteOptions(value) {

    if (value) {
      this.ProjectId = value.ProjectId
      this.TrackerId = value.TrackerId
    }
    // let arrApps = new Array();
    // let projectName = "";
    // for (let depart of this.departs) {
    //   if (depart.Id == value) {
    //     projectName = depart.Project_Name;
    //     break;
    //   }
    // }
    // this.projectCode(value);
    // this.scopeOfWorks(value);
    // this.projectOptions = arrApps;
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        // this.image = 'data:image/jpeg/jpg;base64,' + imageData;
        this.images.push(imageData);

        // // ****Original****

        if (this.platform.is("ios")) {
          let filePath = imageData;
          let fileName = filePath.split("/").pop();
          let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
          this.file
            .readAsDataURL(path, fileName)
            .then((base64File) => {
              // console.log("here is encoded image ", base64File)
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

        console.log(imageData);
        // // ***endOriginal****

        // **** Test ****

        // **** end Test ****
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

  scopeOfWorks(id) {
    let data: Observable<any>;

    // Scope of work
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getscope/" + id + "?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        this.scope = result;
      });
    });
  }

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
    this.storage.get("breaktimein_id").then((val) => {
      this.Id = val;
      console.log(this.Id)
    });
    this.storage.get("breaktimein").then((val) => {
      this.hideUI = val;
    });
    this.storage.get("user").then((val) => {
      this.Name = val.Name;
      this.DepartmentUser = val.Department;
    });
    let data: Observable<any>;

    this.geo
      .getCurrentPosition()
      .then((pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;

        this.storage.get("token").then((val) => {
          data = this.http.get(
            SERVER_URL + "/getradius?token=" +
              val.token +
              "&Latitude_In=" +
              this.Latitude_In +
              "&Longitude_In=" +
              this.Longitude_In
          );
          data.subscribe((result) => {
            this.radiusitem = result;
          });
        });
      })
      .catch((err) => console.log(err));

    // let watch = this.geo.watchPosition();
    // watch.subscribe((data) => {
    // // data can be a set of coordinates, or an error (if an error occurred).
    // this.Latitude_In = data.coords.latitude;
    // this.Longitude_In = data.coords.longitude;
    // });

    //Current User
    //   this.storage.get('token').then((val) => {
    //     data = this.http.get(SERVER_URL + '/getcurrentuser?token=' + val.token);
    //     data.subscribe(result => {
    //       console.log(result);
    //     })
    // });

    // Check_In_Type
    // this.storage.get('token').then((val) => {
    //     data = this.http.get(SERVER_URL + '/gettimesheetoption/' + this.Id + '?token=' + val.token);
    //     data.subscribe(result => {
    //       console.log(result);
    //       let types = new Array();
    //       for (let res of result) {
    //         if(res.Field == 'Check_In_Type') {
    //           types.push(res);
    //         }
    //       }
    //       this.types = types;
    //     })
    // });

    // Department
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getdepartments?token=" + val.token
      );
      data.subscribe((result) => {
        // console.log(result);
        // let that = this;
        // this.departs = result.filter(function (d) {
        //   return d.Project_Name == that.DepartmentUser;
        // });
        for (let depart of result) {
          if (depart.Project_Name == this.DepartmentUser) {
            this.Department = depart.Id;
            console.log(depart);
            break;
          }
        }
        // this.Department = this.departs[0].Id;
      });
      // });

      //   // Scope of work
      //   this.storage.get('token').then((val) => {
      data = this.http.get(
        SERVER_URL + "/getsitename?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        this.site = result;
        // this.Site_Name = this.site;
      });

      this.http
        .get<any>(
          SERVER_URL + "/gettodoincomplete?token=" + val.token
        )
        .subscribe((result) => {
          console.log(result);
          this.tasks = result.list;
          if (result.count > 0) {
            this.signupform.get("Task").setValue(this.tasks[0].Id);
          } else {
            this.signupform.get("Task").setValue(null);
          }
        });
    });
  }

  gotoEdit(radius) {
    const confirm = this.alertCtrl.create({
      title: "Time-In",
      message: "Click to Time-In",
      buttons: [
        {
          text: "Time-In",
          handler: () => {
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
                      this.formData.append("Department", this.DepartmentUser);
                      this.formData.append("Site_Name", radius.Location_Name);
                      this.formData.append("Leader_Member", "");
                      this.formData.append("Next_Person", "");
                      this.formData.append("ProjectId", radius.ProjectId);
                      this.formData.append("State", "");
                      this.formData.append("Work", "");
                      this.formData.append("Reason", "");
                      this.formData.append("Remarks", this.Remarks);
                      this.formData.append("Work_Description", "");
                      this.formData.append("Scope", "");
                      this.formData.append("Project_Code", "");
                      this.formData.append("TrackerId", radius.Id);
                      this.formData.append("TaskId", this.Task);
                      resolveReady();
                      console.log(radius.Id)
                  });
                });
                p.then(() => {
                  return this.http
                    .post(
                      SERVER_URL + "/newbreak?token=" +
                        val.token,
                      this.formData,
                      {}
                    )
                    .subscribe((res: any) => {
                      this.storage.set("timein", true);
                      this.storage.set("timein_id", res);
                      this.hideUI = true;
                      this.Id = res;
                      loading.dismiss();
                      this.presentToastIn();
                    },
                    (err) => {
                      this.displayErrorAlert("Error. Please make sure you are connected to the network.");
                      loading.dismiss();
                    });
                  });
                });
              })
              .catch((err) => {
                this.displayErrorAlert("Please make sure your GPS is enabled.");
                loading.dismiss();
              });
          },
        },
        {
          text: "Back",
          handler: () => {
            console.log("no clicked");
          },
        },
      ],
    });
    confirm.present();
  }

  doRefresh() {
    this.platform.ready().then(() => {
      //request location here
      let loading = this.loadingCtrl.create({
        content: "Refreshing Latitude & Longitude...",
        spinner: "crescent",
      });

      loading.present();

      this.geo
        .getCurrentPosition()
        .then((pos) => {
          this.Latitude_In = pos.coords.latitude;
          this.Longitude_In = pos.coords.longitude;
          loading.dismiss();
          this.storage.get("token").then((val) => {
              this.http.get(
                SERVER_URL + "/getradius?token=" +
                  val.token +
                  "&Latitude_In=" +
                  this.Latitude_In +
                  "&Longitude_In=" +
                  this.Longitude_In
              ).subscribe((result) => {
                this.radiusitem = result;
              });
            })
            .catch((err) => console.log(err));
          alert("Location Refreshed");
        })
        .catch((err) => console.log(err));
    });
  }

  submitTimeIn() {
    let loading = this.loadingCtrl.create({
      content: "Break in...",
      spinner: "crescent",
    });

    loading.present();

    this.geo
      .getCurrentPosition({ enableHighAccuracy: true })
      .then((pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;
        this.storage.get("token").then((val) => {
        //   var Location_Name;
        //   if (this.Site_Name) {
        //     Location_Name = this.Site_Name.Location_Name;
        //   } else {
        //     Location_Name = this.Project_Code["Site Id"]
        //       ? this.Project_Code["Site Id"]
        //       : this.Project_Code["Site LRD"]
        //       ? this.Project_Code["Site LRD"]
        //       : this.Project_Code["Site Name"];
        //   }
          // loading.present();

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
                // this.formData.append("Id",this.Id);
                // this.formData.append("Latitude_In", this.Latitude_In);
                // this.formData.append("Longitude_In", this.Longitude_In);
                this.formData.append("Date", this.myFunction(this.Date));
                this.formData.append("Time", this.startTime());
                // this.formData.append("Check_In_Type", "On Duty");
                // this.formData.append("Department", this.DepartmentUser);
                // this.formData.append("Site_Name", "Break");
                // this.formData.append("Leader_Member", "");
                // this.formData.append("Next_Person", "");
                // this.formData.append("ProjectId", this.ProjectId);
                // this.formData.append("State", "");
                // this.formData.append("Work", "");
                // this.formData.append("Reason", "");
                this.formData.append("Remarks", this.Remarks);
                // this.formData.append("Work_Description", "");
                // this.formData.append("Scope", "");
                // this.formData.append("Project_Code", "");
                // this.formData.append("TrackerId", this.TrackerId);
                // this.formData.append("TaskId", this.Task);
                resolveReady();
                console.log("timein_id",this.Id);
            });
          });
          p.then(() => {
            return this.http
              .post(
                SERVER_URL + "/newbreak2?token=" + val.token,
                this.formData,
                {}
              )
              .pipe(
                catchError(this.handleError)
              )
              .finally(() => {
                loading.dismiss();
              })
              .subscribe((res: any) => {
                this.navCtrl.pop();
                this.storage.set("breaktimein", true);
                this.storage.set("breaktimein_id", res);
                this.hideUI = true;
                this.Id = res;
                console.log(this.Id)

                // this.toast.show(`Time-In success`, '5000', 'center').subscribe(
                //   toast => {
                //     console.log(toast);
                //   }
                // );
                loading.dismiss();
                this.clearImage();
                this.presentToastIn();
              });
          });
        });
      })
      .catch((err) => {
        console.log(err);
        this.displayErrorAlert("Please make sure your GPS is enabled.");
        loading.dismiss();

      });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
        return Observable.throw('An error occurred:' + error.error.message);
    } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.error(
            `Backend returned code ${JSON.stringify(error)}, ` +
            `body was: ${JSON.stringify(error)}`);
        if (error.status == 422) {
            return Observable.throw('An error occured. Try again later. Validation Error');
        }
        return Observable.throw('An error occured. Try again later');
    }
  };

  presentToastIn() {
    let toast = this.toastCtrl.create({
      message: "Break success",
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
      content: "After Break...",
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
                this.formData.append("Remarks", this.Remarks2);
                this.formData.append("Time_Out", this.startTime());
                this.formData.append("Id", this.Id);
                console.log("timeout",this.Id)
                resolveReady();
            });
          });
          p.then(() => {
            return this.http
              .post(
                SERVER_URL + "/breaktimeout?token=" + val.token,
                this.formData,
                {}
              )
              .subscribe((res: any) => {
                this.navCtrl.pop();
                this.storage.set("breaktimein", false);
                this.hideUI = false;
                console.log(res);
                // this.toast.show(`Time-Out success`, '5000', 'center').subscribe(
                //   toast => {
                //     console.log(toast);
                //   }
                // );
                loading.dismiss();
                this.clearImage();
                this.signupform.reset();
                this.formData = new FormData();
                this.presentToastOut();
              }, (err) => {
                this.displayErrorAlert(err.error);
                loading.dismiss();
              });
          });
        });
      })
      .catch((err) => {
        this.displayErrorAlert("Please make sure your GPS is enabled.");
        loading.dismiss();
      });
  }

  deletePhoto(id) {
    this.imagesN.splice(id)
  }

  presentToastOut() {
    let toast = this.toastCtrl.create({
      message: "After Break success",
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
  clock:any;
  
   time() {
    var d = new Date();
    var s = d.getSeconds();
    var m = d.getMinutes();
    var h = d.getHours();
    this.clock = h + ":" + ('00'+m).slice(-2) + ":" + ('00'+s).slice(-2);
    
  }
}
