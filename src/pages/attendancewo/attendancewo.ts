import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { ViewChild } from "@angular/core";
import { Geolocation } from "@ionic-native/geolocation";
import { App, LoadingController } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { AlertController } from "ionic-angular";
import { ToastController } from "ionic-angular";
import { IonicSelectableComponent } from "ionic-selectable";

import { File, FileEntry } from "@ionic-native/file";

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CameraOptions, Camera } from "@ionic-native/camera";
import { DomSanitizer } from "@angular/platform-browser";
import { SERVER_URL } from "../../environment";

/**
 * Time in against a work order, or against a customer for a sales visit.
 *
 * Three flows share this page because they differ only in what identifies the
 * visit, and all three end in the same time in:
 *
 *  - Work Order - pick one of the open tickets the user is on. Its customer and
 *                 site come along with it, so neither is asked for again.
 *  - Sales      - pick the customer being visited.
 *  - Cold Call  - say which side is calling, Sales or Service, then the customer.
 *
 * The customer list is the CRM, and the visit may be to somewhere that is not in
 * it yet, so the list carries an "Other" entry that opens a name to type.
 */
@IonicPage()
@Component({
  selector: "page-attendancewo",
  templateUrl: "attendancewo.html",
})
export class AttendancewoPage {
  /** The customer list's stand-in for a customer that is not on it. */
  static readonly OTHER_CUSTOMER_ID = -1;

  Attendance_Type: string = "Work Order";
  Sub_Department: string = "Sales";
  Branch: any;
  branches: any[] = [];
  branchesMultiple: boolean = false;

  Work_Order: any;
  workOrders: any[] = [];

  Customer: any;
  customers: any[] = [];
  Customer_Name: string = "";

  Date: any;
  Latitude_In: any;
  Longitude_In: any;
  Latitude_Out: any;
  Longitude_Out: any;
  Remarks: string = "";
  Name: string = "";
  Id: string;
  hideUI: any;
  clock: any;
  loading: any;
  formData: FormData;
  images = [];
  imagesN = [];
  teamMembers: any[] = [];
  selectedTeamMembers: any[] = [];
  user: any;
  public signupform: FormGroup;

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
    private toastCtrl: ToastController,
    public platform: Platform,
    private file: File,
    private camera: Camera,
    public domSanitizer: DomSanitizer
  ) {
    this.Date = new Date();

    setInterval(() => {
      this.time();
    }, 1000);

    if (this.navParams.get("Attendance_Type")) {
      this.Attendance_Type = this.navParams.get("Attendance_Type");
    }

    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(SERVER_URL + "/getuser?token=" + val.token);
      data.subscribe((result) => {
        this.storage.set("user", result);
        this.user = result;
      });
    });
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Attendance_Type: new FormControl("", [Validators.required]),
      Sub_Department: new FormControl("", []),
      Branch: new FormControl("", [Validators.required]),
      Work_Order: new FormControl("", []),
      Customer: new FormControl("", []),
      Customer_Name: new FormControl("", []),
      Latitude_In: new FormControl("", [Validators.required]),
      Longitude_In: new FormControl("", [Validators.required]),
      Remarks: new FormControl("", []),
      teamMembers: new FormControl([]),
    });

    this.applyTypeValidators();
    this.loadTeamMembers();
  }

  ionViewWillEnter() {
    this.loadData();
  }

  /**
   * A work order booking needs an order; a customer visit needs a customer, and
   * a cold call also needs to say which side is calling. Switching type has to
   * move the required marks with it or the form stays invalid for a field that
   * is no longer on screen.
   */
  applyTypeValidators() {
    let workOrder = this.signupform.get("Work_Order");
    let customer = this.signupform.get("Customer");
    let subDepartment = this.signupform.get("Sub_Department");

    workOrder.setValidators(this.isWorkOrder() ? [Validators.required] : []);
    customer.setValidators(this.isWorkOrder() ? [] : [Validators.required]);
    subDepartment.setValidators(this.isColdCall() ? [Validators.required] : []);

    workOrder.updateValueAndValidity();
    customer.updateValueAndValidity();
    subDepartment.updateValueAndValidity();
  }

  isWorkOrder() {
    return this.Attendance_Type == "Work Order";
  }

  isColdCall() {
    return this.Attendance_Type == "Cold Call";
  }

  /** True once "Other" is picked, which is when the name has to be typed. */
  isOtherCustomer() {
    return (
      this.Customer && this.Customer.Id == AttendancewoPage.OTHER_CUSTOMER_ID
    );
  }

  onTypeChange() {
    // Nothing carries across: an order's customer is not a cold call's, and a
    // stale selection would be posted with the new type.
    this.Work_Order = null;
    this.Customer = null;
    this.Customer_Name = "";

    this.applyTypeValidators();
  }

  onBranchChange() {
    // Only the work order list is scoped by brand; customers are not.
    this.Work_Order = null;

    this.loadWorkOrders();
  }

  onCustomerChange() {
    // A customer from the CRM names itself; "Other" leaves the name to type.
    this.Customer_Name = this.isOtherCustomer()
      ? ""
      : this.Customer
      ? this.Customer.Label
      : "";

    this.signupform
      .get("Customer_Name")
      .setValidators(this.isOtherCustomer() ? [Validators.required] : []);
    this.signupform.get("Customer_Name").updateValueAndValidity();
  }

  loadData() {
    this.storage.get("timein_idwo").then((val) => {
      this.Id = val;
    });
    this.storage.get("timeinwo").then((val) => {
      this.hideUI = val;
    });
    this.storage.get("user").then((val) => {
      if (val) {
        this.Name = val.Name;
      }
    });

    this.geo
      .getCurrentPosition()
      .then((pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;

        // The distance to each site is measured from here, so the lists are
        // only worth loading once there is a position to measure from.
        this.loadBranches();
      })
      .catch((err) => {
        console.log(err);
        this.loadBranches();
      });
  }

  loadBranches() {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/getbranches?token=" + val.token)
        .subscribe((result: any) => {
          this.branches = result.branches || [];
          this.branchesMultiple = result.multiple;

          if (!this.Branch && result.default) {
            this.Branch = this.branches.filter(
              (b) => b.Branch == result.default
            )[0];
          }

          this.loadWorkOrders();
          this.loadCustomers();
        });
    });
  }

  loadWorkOrders() {
    this.storage.get("token").then((val) => {
      let url =
        SERVER_URL +
        "/getworkorders?token=" +
        val.token +
        "&branch=" +
        encodeURIComponent(this.Branch ? this.Branch.Branch : "");

      if (this.Latitude_In && this.Longitude_In) {
        url +=
          "&latitude=" + this.Latitude_In + "&longitude=" + this.Longitude_In;
      }

      this.http.get(url).subscribe(
        (result: any) => {
          this.workOrders = result;
        },
        (err) => {
          console.log(err);
          this.workOrders = [];
        }
      );
    });
  }

  loadCustomers() {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/getcustomers?token=" + val.token)
        .subscribe(
          (result: any) => {
            // A visit can be to a customer that was never created, so the list
            // always ends with a way to say so.
            this.customers = (result || []).concat([
              {
                Id: AttendancewoPage.OTHER_CUSTOMER_ID,
                Label: "Other (not listed)",
              },
            ]);
          },
          (err) => {
            console.log(err);
            this.customers = [
              {
                Id: AttendancewoPage.OTHER_CUSTOMER_ID,
                Label: "Other (not listed)",
              },
            ];
          }
        );
    });
  }

  searchWorkOrders(event: {
    component: IonicSelectableComponent;
    text: string;
  }) {
    let text = event.text.trim().toLowerCase();

    event.component.items = this.workOrders.filter(
      (w) => (w.Label || "").toLowerCase().indexOf(text) !== -1
    );
  }

  searchCustomers(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();

    event.component.items = this.customers.filter(
      (c) => (c.Label || "").toLowerCase().indexOf(text) !== -1
    );
  }

  searchTeamMembers(event: {
    component: IonicSelectableComponent;
    text: string;
  }) {
    let text = event.text.trim().toLowerCase();

    event.component.items = this.teamMembers.filter(
      (member) => member.Name.toLowerCase().indexOf(text) !== -1
    );
  }

  loadTeamMembers() {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/getName?token=" + val.token)
        .subscribe((result: any) => {
          this.teamMembers = result;
        });
    });
  }

  /**
   * Refreshing the position also refreshes the distances, which are measured
   * from it - leaving them behind would show a distance from where the user was
   * rather than where they are.
   */
  doRefresh() {
    this.platform.ready().then(() => {
      let loading = this.loadingCtrl.create({
        content: "Refreshing Latitude & Longitude...",
        spinner: "cresent",
      });
      loading.present();

      this.geo
        .getCurrentPosition({
          timeout: 20000,
          enableHighAccuracy: true,
          maximumAge: 0,
        })
        .then(
          (pos) => {
            this.Latitude_In = pos.coords.latitude;
            this.Longitude_In = pos.coords.longitude;
            loading.dismiss();
            this.loadWorkOrders();
            alert("Location Refreshed");
          },
          (error) => {
            loading.dismiss();
            this.displayErrorAlert(
              error && error.code == 1
                ? error.message
                : "Unable to get position..Please try again later"
            );
          }
        )
        .catch((err) => {
          console.log(err);
          loading.dismiss();
          this.displayErrorAlert(
            "Unable to get position..Please try again later"
          );
        });
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
              var self = this;

              var def = new Promise((resolve) => {
                this.file.resolveLocalFilesystemUrl(i).then(
                  (entry: FileEntry) => {
                    entry.file(
                      function (file) {
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
                        resolve(i);
                      }
                    );
                  },

                  (err) => {
                    console.log("Put error message here", JSON.stringify(err));
                    resolve(i);
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
              this.formData.append("Attendance_Type", this.Attendance_Type);
              this.formData.append(
                "Branch",
                this.Branch ? this.Branch.Branch : ""
              );
              this.formData.append("Remarks", this.Remarks || "");
              this.formData.append("isWorkFromHome", "0");
              this.formData.append("isDriving", "0");

              (this.selectedTeamMembers || []).forEach((selectedTeamMember) => {
                this.formData.append("teamMembers[]", selectedTeamMember["Id"]);
              });

              if (this.isWorkOrder()) {
                // The rest - customer, site, project code - is read off the
                // ticket on the server, so it cannot disagree with the ticket.
                this.formData.append("ServiceTicketId", this.Work_Order.Id);

                if (this.Work_Order.Distance_Km !== null) {
                  this.formData.append(
                    "Distance_Km",
                    this.Work_Order.Distance_Km
                  );
                }
              } else {
                // A customer that is not in the CRM has no id to send, only the
                // name the user typed.
                if (this.Customer && !this.isOtherCustomer()) {
                  this.formData.append("CustomerId", this.Customer.Id);
                }

                this.formData.append("Customer_Name", this.Customer_Name || "");

                if (this.isColdCall()) {
                  this.formData.append("Sub_Department", this.Sub_Department);
                }
              }

              resolveReady();
            });
          });

          p.then(() => {
            return this.http
              .post(
                SERVER_URL + "/newtimesheet?token=" + val.token,
                this.formData,
                {}
              )
              .subscribe(
                (res: any) => {
                  this.storage.set("timeinwo", true);
                  this.storage.set("timein_idwo", res);
                  this.hideUI = true;
                  this.Id = res;

                  loading.dismiss();
                  this.clearImage();
                  this.signupform.reset();
                  this.formData = new FormData();
                  this.presentToastIn();
                },
                (err) => {
                  loading.dismiss();
                  this.displayErrorAlert(this.errorMessage(err));
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
              var self = this;

              var def = new Promise((resolve) => {
                this.file.resolveLocalFilesystemUrl(i).then(
                  (entry: FileEntry) => {
                    entry.file(
                      function (file) {
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
                        resolve(i);
                      }
                    );
                  },

                  (err) => {
                    console.log("Put error message here", JSON.stringify(err));
                    resolve(i);
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
                  this.storage.set("timeinwo", false);
                  this.hideUI = false;

                  loading.dismiss();
                  this.clearImage();
                  this.signupform.reset();
                  this.formData = new FormData();
                  this.presentToastOut();
                },
                (err) => {
                  loading.dismiss();
                  this.displayErrorAlert(this.errorMessage(err));
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

  errorMessage(err) {
    console.log(err);

    if (err.status === 413) {
      return "Image size is too large. Please try again with a smaller image.";
    }

    if (err.error && err.error.error) {
      return err.error.error;
    }

    if (typeof err.error === "string" && err.error.length < 200) {
      return err.error;
    }

    return `An error occurred (Code: ${err.status || "Unknown"}). Please try again.`;
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 1600,
      targetHeight: 1600,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        this.images.push(imageData);
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

  presentToastIn() {
    let toast = this.toastCtrl.create({
      message: "Time-In success",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "green",
    });

    toast.present();
  }

  presentToastOut() {
    let toast = this.toastCtrl.create({
      message: "Time-Out success",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "green",
    });

    toast.present();
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

    return (
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    );
  }

  time() {
    var d = new Date();
    var s = d.getSeconds();
    var m = d.getMinutes();
    var h = d.getHours();

    this.clock = h + ":" + ("00" + m).slice(-2) + ":" + ("00" + s).slice(-2);
  }
}
