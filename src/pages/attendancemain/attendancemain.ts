import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { ViewChild } from "@angular/core";
import { Geolocation } from "@ionic-native/geolocation";
import { App, LoadingController } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
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
 * Attendance - one page for every kind of time in.
 *
 * There used to be a menu of buttons here, one per kind, each opening a page of
 * its own. They were the same page four times over: the same position, the same
 * photos, the same time in and time out, differing only in which two or three
 * fields sat in the middle. So the menu is gone and the kind is a Type on the
 * form instead, with the fields under it following from what is chosen:
 *
 *  - Service Order - against one of the user's open service tickets.
 *  - Office        - at one of the department's offices, or from anywhere.
 *  - Sales         - a customer visit, for a brand and model.
 *  - Travel        - time spent getting somewhere.
 *  - Project       - on a project site, booked to a project code and site code.
 *
 * Whether the user is timed in is asked of the server, not remembered here.
 * This page used to keep it in local storage, which the OS throws away when it
 * clears the app in the background - and a staff member whose phone did that
 * was left timed in with no way to time out. The open timesheet row is the only
 * thing that actually knows, so it is read on the way in (loadOpenTimesheet)
 * and the screen is set from the answer.
 */
@IonicPage()
@Component({
  selector: "page-attendancemain",
  templateUrl: "attendancemain.html",
})
export class AttendancemainPage {
  /** The customer list's stand-in for a customer that is not on it. */
  static readonly OTHER_CUSTOMER_ID = -1;

  static readonly SERVICE_ORDER = "Service Order";
  static readonly OFFICE = "Office";
  static readonly SALES = "Sales";
  static readonly TRAVEL = "Travel";
  static readonly PROJECT = "Project";

  types = [
    AttendancemainPage.SERVICE_ORDER,
    AttendancemainPage.OFFICE,
    AttendancemainPage.SALES,
    AttendancemainPage.TRAVEL,
    AttendancemainPage.PROJECT,
  ];

  Attendance_Type: string = AttendancemainPage.SERVICE_ORDER;

  // Service Order
  Work_Order: any;
  workOrders: any[] = [];

  // Sales
  Branch: any;
  branches: any[] = [];
  Customer: any;
  customers: any[] = [];
  Customer_Name: string = "";

  // What machine the visit or the job was for. The models are filed under
  // their brand in Option Control, so the list narrows to the chosen brand.
  Brand: any = "";
  Model: any = "";
  brands: any[] = [];
  models: any[] = [];
  allModels: any[] = [];
  brandsMultiple: boolean = false;

  // Office - the department's offices, each a button that times in against it.
  officeLocations: any[] = [];
  isWorkFromHome: boolean = false;

  // Project - the project code the time is booked to, and the site under it
  // that the work is actually at. The site list comes with the project code
  // rather than from a call of its own (see onProjectCodeChange).
  Department: any;
  departs: any[] = [];
  Project_Code: any;
  apps: any[] = [];
  /** How far the phone is from the picked site, measured by the server. */
  siteDistance: any = null;
  isDriving: boolean = false;
  /** The signed-in user, for the entitlements that show or hide a field. */
  user: any = null;

  Remarks: string = "";
  Remarks_Out: string = "";

  Date: any;
  clock: any;
  Name: string = "";
  Latitude_In: any;
  Longitude_In: any;
  Latitude_Out: any;
  Longitude_Out: any;

  /** The open time in, when there is one; null when the user is timed out. */
  openTimesheet: any = null;
  /** True once the server has answered, so the page is not drawn on a guess. */
  loadedOpenTimesheet: boolean = false;
  Id: any;

  images = [];
  imagesN = [];
  formData: FormData;

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
    this.Name = this.navParams.get("Name") || "";

    this.time();
    setInterval(() => {
      this.time();
    }, 1000);
  }

  ngOnInit() {
    // The position is not a control on this form. It is read from the device
    // rather than typed, so there is nothing for a validator to react to and a
    // required control that nothing ever sets would leave Time in disabled for
    // good. hasLocation() gates the button instead, and the server refuses a
    // time in with no coordinates either way.
    this.signupform = new FormGroup({
      Attendance_Type: new FormControl(this.Attendance_Type, [
        Validators.required,
      ]),
      Work_Order: new FormControl("", []),
      Branch: new FormControl("", []),
      Brand: new FormControl("", []),
      Model: new FormControl("", []),
      Customer: new FormControl("", []),
      Customer_Name: new FormControl("", []),
      Department: new FormControl("", []),
      Project_Code: new FormControl("", []),
      Remarks: new FormControl("", []),
    });

    this.applyTypeValidators();
  }

  ionViewWillEnter() {
    this.loadOpenTimesheet();
    this.loadData();
  }

  /** Pull down to ask the server again - what is open, and the lists. */
  onPullToRefresh(refresher) {
    this.loadOpenTimesheet();
    this.loadData();

    setTimeout(() => {
      refresher.complete();
    }, 1200);
  }

  // ---------------------------------------------------------------------------
  // Which type is showing
  // ---------------------------------------------------------------------------

  isServiceOrder() {
    return this.Attendance_Type == AttendancemainPage.SERVICE_ORDER;
  }

  isOffice() {
    return this.Attendance_Type == AttendancemainPage.OFFICE;
  }

  isSales() {
    return this.Attendance_Type == AttendancemainPage.SALES;
  }

  isTravel() {
    return this.Attendance_Type == AttendancemainPage.TRAVEL;
  }

  isProject() {
    return this.Attendance_Type == AttendancemainPage.PROJECT;
  }

  /**
   * A branch says which operating company the time is booked at. Asked for on
   * the two types that are booked against one.
   */
  needsBranch() {
    return this.isSales() || this.isProject();
  }

  /**
   * Driving overtime is an entitlement, so the checkbox only appears for staff
   * who have it - for anybody else it is a box that would do nothing.
   */
  canDrive() {
    return this.isProject() && this.user && this.user.driving_ot;
  }

  /** True once "Other" is picked, which is when the name has to be typed. */
  isOtherCustomer() {
    return (
      this.Customer && this.Customer.Id == AttendancemainPage.OTHER_CUSTOMER_ID
    );
  }

  /** Whether there is a brand to pick, which is when a Sales visit needs one. */
  isBrandRequired() {
    return this.isSales() && this.brands.length > 0;
  }

  /**
   * "Common" is not a brand of its own but the answer for work that covered
   * several of them, so there is no one machine to name: the Model field is
   * taken off the form while it is chosen.
   */
  isCommonBrand() {
    return String(this.Brand || "").toLowerCase() == "common";
  }

  /**
   * Office times in through its own buttons - one per office - so there is no
   * Time in button under the form for it.
   */
  hasTimeInButton() {
    return !this.isOffice();
  }

  onTypeChange() {
    // Nothing carries across: a service order's customer is not a sales
    // visit's, and a stale selection would be posted with the new type.
    this.Work_Order = null;
    this.Customer = null;
    this.Customer_Name = "";
    this.Department = null;
    this.Project_Code = null;
    this.apps = [];
    this.siteDistance = null;
    // Both boxes belong to the type that was showing when they were ticked,
    // so neither carries over into a type that means something else by them.
    this.isDriving = false;
    this.isWorkFromHome = false;

    this.applyTypeValidators();
  }

  /**
   * Each type asks for different things, so the required marks move with it -
   * left in place, the form stays invalid for a field that is no longer on
   * screen and the Time in button never enables.
   */
  applyTypeValidators() {
    let required = {
      Work_Order: this.isServiceOrder(),
      Branch: this.needsBranch(),
      Brand: this.isBrandRequired(),
      Customer: this.isSales(),
      Customer_Name: this.isSales() && this.isOtherCustomer(),
      // Model is only ever as required as the brand it hangs off, and only
      // once that brand has models filed under it. "Common" has none - the
      // field is not on screen for it.
      Model:
        this.isBrandRequired() &&
        !this.isCommonBrand() &&
        this.models.length > 0,
      Department: this.isProject(),
      // Not every project code has sites under it. Where there are none there
      // is nothing to pick, and holding the form to a required empty dropdown
      // would stop the time in being made at all.
      Project_Code: this.isProject() && this.apps.length > 0,
    };

    Object.keys(required).forEach((field) => {
      let control = this.signupform.get(field);

      control.setValidators(required[field] ? [Validators.required] : []);
      control.updateValueAndValidity();
    });
  }

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  /**
   * Asks the server whether this user is still timed in.
   *
   * A time in with no time out puts the page into the timed-out-next state
   * whatever day it was opened on, so a night shift can still close itself the
   * morning after.
   */
  loadOpenTimesheet() {
    this.storage.get("token").then((val) => {
      if (!val || !val.token) {
        // No token means no way to ask, and leaving the page on "checking"
        // for good tells the user nothing.
        this.loadedOpenTimesheet = false;
        this.displayErrorAlert(
          "You are not signed in any more. Please sign in again."
        );
        return;
      }

      this.http
        .get(SERVER_URL + "/getopentimesheet?token=" + val.token)
        .subscribe(
          (result: any) => {
            this.loadedOpenTimesheet = true;

            if (result && result.open && result.timesheet) {
              this.openTimesheet = result.timesheet;
              this.Id = result.timesheet.Id;
            } else {
              this.openTimesheet = null;
              this.Id = null;
            }
          },
          (err) => {
            console.log(err);
            // Nothing is assumed either way. Saying "you are timed out" on a
            // failed call is how a second, overlapping time in gets created.
            this.loadedOpenTimesheet = false;
            this.displayErrorAlert(
              "Could not check your attendance status. Please pull down to retry."
            );
          }
        );
    });
  }

  loadData() {
    this.storage.get("user").then((val) => {
      if (val) {
        this.Name = val.Name;
        this.user = val;
      }
    });

    this.loadUser();

    this.geo
      .getCurrentPosition()
      .then((pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;

        // The distance to each site is measured from here, so the lists are
        // only worth loading once there is a position to measure from.
        this.loadLists();
      })
      .catch((err) => {
        console.log(err);
        this.loadLists();
      });
  }

  loadLists() {
    this.loadBranches();
    this.loadBrands();
    this.loadWorkOrders();
    this.loadCustomers();
    this.loadOfficeLocations();
    this.loadProjectCodes();
  }

  /**
   * The signed-in user, read fresh rather than from storage - an entitlement
   * granted this morning should show up without signing out and in again.
   */
  loadUser() {
    this.storage.get("token").then((val) => {
      if (!val || !val.token) {
        return;
      }

      this.http.get(SERVER_URL + "/getuser?token=" + val.token).subscribe(
        (result: any) => {
          this.user = result;
          this.storage.set("user", result);

          if (result && result.Name) {
            this.Name = result.Name;
          }
        },
        (err) => {
          // The cached copy from storage stands in; nothing here is worth an
          // alert over.
          console.log(err);
        }
      );
    });
  }

  loadProjectCodes() {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/getprojects?token=" + val.token + "&type=attendance")
        .subscribe(
          (result: any) => {
            this.departs = result || [];
          },
          (err) => {
            console.log(err);
            this.departs = [];
          }
        );
    });
  }

  loadBranches() {
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/getbranches?token=" + val.token)
        .subscribe(
          (result: any) => {
            this.branches = result.branches || [];

            if (!this.Branch && result.default) {
              this.Branch = this.branches.filter(
                (b) => b.Branch == result.default
              )[0];
            }
          },
          (err) => {
            console.log(err);
            this.branches = [];
          }
        );
    });
  }

  loadBrands() {
    this.storage.get("token").then((val) => {
      this.http.get(SERVER_URL + "/getbrands?token=" + val.token).subscribe(
        (result: any) => {
          this.brands = result.brands || [];
          this.brandsMultiple = result.multiple;
          this.allModels = result.models || [];

          this.filterModels();
          // The list decides whether the field is required, so the marks have
          // to be re-applied now it is known.
          this.applyTypeValidators();
        },
        (err) => {
          console.log(err);
          this.brands = [];
          this.allModels = [];
          this.models = [];
        }
      );
    });
  }

  loadWorkOrders() {
    this.storage.get("token").then((val) => {
      let url = SERVER_URL + "/getworkorders?token=" + val.token;

      if (this.Latitude_In && this.Longitude_In) {
        url +=
          "&latitude=" + this.Latitude_In + "&longitude=" + this.Longitude_In;
      }

      this.http.get(url).subscribe(
        (result: any) => {
          this.workOrders = result || [];
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
      this.http.get(SERVER_URL + "/getcustomers?token=" + val.token).subscribe(
        (result: any) => {
          // A visit can be to a customer that was never created, so the list
          // always ends with a way to say so.
          this.customers = (result || []).concat([this.otherCustomer()]);
        },
        (err) => {
          console.log(err);
          this.customers = [this.otherCustomer()];
        }
      );
    });
  }

  otherCustomer() {
    return {
      Id: AttendancemainPage.OTHER_CUSTOMER_ID,
      Label: "Other (not listed)",
    };
  }

  loadOfficeLocations() {
    this.storage.get("token").then((val) => {
      this.http.get(SERVER_URL + "/getradius1?token=" + val.token).subscribe(
        (result: any) => {
          this.officeLocations = result || [];
        },
        (err) => {
          console.log(err);
          this.officeLocations = [];
        }
      );
    });
  }

  // ---------------------------------------------------------------------------
  // Pickers
  // ---------------------------------------------------------------------------

  searchWorkOrders(event: {
    component: IonicSelectableComponent;
    text: string;
  }) {
    let text = event.text.trim().toLowerCase();

    // The label is the ticket number, but a job is just as often looked up by
    // who it is for - so the search reads the wider text the server sends.
    event.component.items = this.workOrders.filter(
      (w) =>
        ((w.Search_Label || w.Label) || "").toLowerCase().indexOf(text) !== -1
    );
  }

  searchCustomers(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();

    event.component.items = this.customers.filter(
      (c) => (c.Label || "").toLowerCase().indexOf(text) !== -1
    );
  }

  onCustomerChange() {
    // A customer from the CRM names itself; "Other" leaves the name to type.
    this.Customer_Name = this.isOtherCustomer()
      ? ""
      : this.Customer
      ? this.Customer.Label
      : "";

    this.applyTypeValidators();
  }

  /**
   * Narrows the model list to the chosen brand. A model with no brand on its
   * option row belongs to none in particular and is offered under all of them.
   */
  filterModels() {
    let brand = this.Brand;

    this.models = this.isCommonBrand()
      ? []
      : (this.allModels || []).filter((model) => {
          return !brand || !model.Brand || model.Brand == brand;
        });

    // A model left over from the previous brand is no longer a valid choice.
    let stillListed = this.models.some((model) => model.Model == this.Model);

    if (!stillListed) {
      this.Model = "";

      if (this.signupform && this.signupform.get("Model")) {
        this.signupform.get("Model").setValue("");
      }
    }
  }

  /**
   * The sites under the picked project code.
   *
   * They arrive with the project code rather than from a call of their own, as
   * a list of project rows whose code lives in a different column per level -
   * level 1 is the department, level 5 the site id - so the label is read off
   * whichever column the row's level points at.
   */
  onProjectCodeChange() {
    this.Project_Code = null;
    this.siteDistance = null;

    let sites = this.Department ? this.Department["Site_Code"] : null;

    // Not every project code has sites under it. The list is emptied rather
    // than left holding the previous code's sites, which would offer a site
    // that belongs to a different project.
    this.apps = (sites || []).map((site) => {
      let code = "";

      switch (site.Level) {
        case 1:
          code = site.Department;
          break;
        case 2:
          code = site.Segment;
          break;
        case 3:
          code = site.Contract_No;
          break;
        case 4:
          code = site.PO_No;
          break;
        case 5:
          code = site.Site_ID;
          break;
      }

      return { Id: site.Id, siteCode: site.Site_Name + " - " + code };
    });

    // Whether there is a site to pick decides whether one has to be.
    this.applyTypeValidators();
  }

  /**
   * How far the phone is from the site just picked.
   *
   * Measured on the server against the site and its far ends - the same points
   * time in geofences against - so the distance on screen is the one the time
   * in will be judged by.
   */
  onSiteChange() {
    this.siteDistance = null;

    if (!this.Project_Code || !this.Project_Code.Id) {
      return;
    }

    if (!this.hasLocation()) {
      this.siteDistance = { Distance_Text: "Waiting for your location..." };
      return;
    }

    this.storage.get("token").then((val) => {
      this.http
        .get(
          SERVER_URL +
            "/getsitedistance/" +
            this.Project_Code.Id +
            "/" +
            this.Latitude_In +
            "/" +
            this.Longitude_In +
            "?token=" +
            val.token
        )
        .subscribe(
          (result: any) => {
            this.siteDistance = result;
          },
          (err) => {
            console.log(err);
            this.siteDistance = null;
          }
        );
    });
  }

  searchProjectCodes(event: {
    component: IonicSelectableComponent;
    text: string;
  }) {
    let text = event.text.trim().toLowerCase();

    event.component.items = this.departs.filter(
      (d) => (d.Project_Code || "").toLowerCase().indexOf(text) !== -1
    );
  }

  searchSiteCodes(event: {
    component: IonicSelectableComponent;
    text: string;
  }) {
    let text = event.text.trim().toLowerCase();

    event.component.items = this.apps.filter(
      (a) => (a.siteCode || "").toLowerCase().indexOf(text) !== -1
    );
  }

  /**
   * Driving and Work Anywhere are two different answers to where the day was
   * spent, so only one of them can be ticked.
   */
  onDrivingChange() {
    if (this.isDriving) {
      this.isWorkFromHome = false;
    }
  }

  onBrandChange() {
    this.filterModels();
    this.applyTypeValidators();
  }

  // ---------------------------------------------------------------------------
  // Position
  // ---------------------------------------------------------------------------

  /** Whether there is a position to time in with. */
  hasLocation() {
    return (
      this.Latitude_In !== null &&
      this.Latitude_In !== undefined &&
      this.Latitude_In !== "" &&
      this.Longitude_In !== null &&
      this.Longitude_In !== undefined &&
      this.Longitude_In !== ""
    );
  }

  /**
   * Refreshing the position also refreshes the distances, which are measured
   * from it - leaving them behind would show a distance from where the user was
   * rather than where they are.
   */
  doRefresh() {
    this.platform.ready().then(() => {
      let loading = this.loadingCtrl.create({
        content: "Refreshing your location...",
        spinner: "crescent",
      });

      loading.present();

      // Accept a recently cached fix (up to 60s old) so a cold read does not
      // fail outright, and give it longer to warm up.
      const options = {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60000,
      };

      const onSuccess = (pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;
        loading.dismiss();
        this.loadWorkOrders();
        this.loadOfficeLocations();
        this.presentToast("Location refreshed");
      };

      const showError = (subTitle: string) => {
        loading.dismiss();
        this.displayErrorAlert(subTitle);
      };

      this.geo
        .getCurrentPosition(options)
        .then(onSuccess, (error) => {
          // code 1 = permission denied, 2 = position unavailable, 3 = timeout
          if (error && error.code == 1) {
            showError(error.message || "Location permission denied.");
          } else if (error && error.code == 2) {
            // Common and usually momentary, so it is worth one more go before
            // telling the user it cannot be done.
            this.geo.getCurrentPosition(options).then(onSuccess, () => {
              showError(
                "Unable to determine your location. Please make sure your GPS is on and try again."
              );
            });
          } else {
            showError("Unable to get position. Please try again later.");
          }
        })
        .catch((err) => {
          console.log(err);
          showError("Unable to get position. Please try again later.");
        });
    });
  }

  // ---------------------------------------------------------------------------
  // Photos
  // ---------------------------------------------------------------------------

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

  /**
   * Reads the taken photos into the form data. They are file URIs on the
   * device, so each has to be read off disk before it can be posted.
   */
  appendImages(formData: FormData) {
    return Promise.all(
      this.images.map((i) => {
        return new Promise((resolve) => {
          this.file.resolveLocalFilesystemUrl(i).then(
            (entry: FileEntry) => {
              entry.file(
                function (file) {
                  var reader = new FileReader();

                  reader.onloadend = function (e) {
                    var imgBlob = new Blob([this.result], { type: file.type });

                    formData.append("attachment[]", imgBlob, file.name);
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
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Time in / out
  // ---------------------------------------------------------------------------

  /**
   * Times in for Service Order, Sales and Travel. Office has its own buttons -
   * see officeTimeIn.
   */
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

        // A fix can come back empty even when the read itself succeeds, and a
        // time in with no position is one nobody can check afterwards.
        if (!this.hasLocation()) {
          loading.dismiss();
          this.warnNoLocation();
          return;
        }

        this.storage.get("token").then((val) => {
          this.formData = new FormData();

          this.appendImages(this.formData).then(() => {
            this.formData.append("Latitude_In", this.Latitude_In);
            this.formData.append("Longitude_In", this.Longitude_In);
            this.formData.append("Date", this.formatDate(this.Date));
            this.formData.append("Time", this.startTime());
            // Only Project offers Driving and Work Anywhere; every other type
            // is plain on duty, so the flags fall away with the checkboxes.
            let workFromHome = this.isProject() && this.isWorkFromHome;
            let driving = this.isProject() && this.isDriving;

            this.formData.append("Check_In_Type", this.checkInType());
            this.formData.append("Attendance_Type", this.Attendance_Type);
            this.formData.append("Remarks", this.Remarks || "");
            this.formData.append("isWorkFromHome", workFromHome ? "1" : "0");
            this.formData.append("isDriving", driving ? "1" : "0");

            if (this.isServiceOrder()) {
              // The rest - customer, site, branch - is read off the ticket on
              // the server, so it cannot disagree with the ticket.
              this.formData.append("ServiceTicketId", this.Work_Order.Id);

              // Null when either end has no coordinates, and there is nothing
              // to store for a distance nobody could measure.
              if (
                this.Work_Order.Distance_Km !== null &&
                this.Work_Order.Distance_Km !== undefined
              ) {
                this.formData.append("Distance_Km", this.Work_Order.Distance_Km);
              }

              this.formData.append("Brand", this.Brand || "");
              this.formData.append("Model", this.Model || "");
            }

            if (this.isProject()) {
              // The project code is the department the time is booked to; the
              // site code under it is where the work actually happened, and is
              // what the geofence is measured against on the server.
              this.formData.append("Department", this.Department.Id);
              this.formData.append("ProjectId", this.Department.Id);
              this.formData.append(
                "Branch",
                this.Branch ? this.Branch.Branch : ""
              );

              if (this.Project_Code && this.Project_Code.Id) {
                this.formData.append("Site_Code", this.Project_Code.Id);
              }

              if (
                this.siteDistance &&
                this.siteDistance.Distance_Km !== null &&
                this.siteDistance.Distance_Km !== undefined
              ) {
                this.formData.append("Distance_Km", this.siteDistance.Distance_Km);
              }
            }

            if (this.isSales()) {
              this.formData.append(
                "Branch",
                this.Branch ? this.Branch.Branch : ""
              );
              this.formData.append("Brand", this.Brand || "");
              this.formData.append("Model", this.Model || "");

              // A customer that is not in the CRM has no id to send, only the
              // name the user typed.
              if (this.Customer && !this.isOtherCustomer()) {
                this.formData.append("CustomerId", this.Customer.Id);
              }

              this.formData.append("Customer_Name", this.Customer_Name || "");
            }

            this.http
              .post(
                SERVER_URL + "/newtimesheet?token=" + val.token,
                this.formData,
                {}
              )
              .subscribe(
                (res: any) => {
                  loading.dismiss();
                  this.afterTimeIn();
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
        loading.dismiss();
        this.warnNoLocation();
      });
  }

  /**
   * Times in at one of the department's offices. Each office is a button of its
   * own because that tap is the whole answer - there is nothing else to fill in
   * once the office is chosen.
   */
  officeTimeIn(office) {
    const confirm = this.alertCtrl.create({
      title: "Time in",
      message: "Time in at " + office.Location_Name + "?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Time in",
          handler: () => {
            this.submitOfficeTimeIn(office);
          },
        },
      ],
    });

    confirm.present();
  }

  submitOfficeTimeIn(office) {
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

        if (!this.hasLocation()) {
          loading.dismiss();
          this.warnNoLocation();
          return;
        }

        this.storage.get("token").then((val) => {
          this.formData = new FormData();

          this.appendImages(this.formData).then(() => {
            this.formData.append("Latitude_In", this.Latitude_In);
            this.formData.append("Longitude_In", this.Longitude_In);
            this.formData.append("Date", this.formatDate(this.Date));
            this.formData.append("Time", this.startTime());
            this.formData.append(
              "isWorkFromHome",
              this.isWorkFromHome ? "1" : "0"
            );
            this.formData.append(
              "Check_In_Type",
              this.isWorkFromHome ? "Work From Home" : "On Duty"
            );
            this.formData.append("Site_Name", office.Location_Name);
            this.formData.append("ProjectId", office.Id);
            this.formData.append("Leader_Member", "");
            this.formData.append("Next_Person", "");
            this.formData.append("State", "");
            this.formData.append("Work", "");
            this.formData.append("Reason", "");
            this.formData.append("Remarks", this.Remarks || "");
            this.formData.append("Work_Description", "");
            this.formData.append("Scope", "");
            this.formData.append("Project_Code", "");

            this.http
              .post(
                SERVER_URL + "/attendanceofficebutton?token=" + val.token,
                this.formData,
                {}
              )
              .subscribe(
                (res: any) => {
                  loading.dismiss();
                  this.afterTimeIn();
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
        loading.dismiss();
        this.warnNoLocation();
      });
  }

  submitTimeOut() {
    if (!this.Id) {
      this.displayErrorAlert("There is no open time in to close.");
      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Time out...",
      spinner: "crescent",
    });

    loading.present();

    this.geo
      .getCurrentPosition({ enableHighAccuracy: true })
      .then((pos) => {
        this.Latitude_Out = pos.coords.latitude;
        this.Longitude_Out = pos.coords.longitude;

        this.storage.get("token").then((val) => {
          this.formData = new FormData();

          this.appendImages(this.formData).then(() => {
            this.formData.append("Latitude_Out", this.Latitude_Out);
            this.formData.append("Longitude_Out", this.Longitude_Out);
            this.formData.append("Time_Out", this.startTime());
            this.formData.append("Id", this.Id);

            if (this.Remarks_Out) {
              this.formData.append("Remarks", this.Remarks_Out);
            }

            this.http
              .post(SERVER_URL + "/timeout?token=" + val.token, this.formData, {})
              .subscribe(
                (res: any) => {
                  loading.dismiss();
                  this.clearImage();
                  this.Remarks_Out = "";
                  this.presentToast("Time-Out success");
                  // What is open is the server's to say, so it is asked again
                  // rather than assumed closed.
                  this.loadOpenTimesheet();
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
        loading.dismiss();
        this.displayErrorAlert("Please make sure your GPS is enabled.");
      });
  }

  afterTimeIn() {
    this.clearImage();
    this.Remarks = "";
    this.Work_Order = null;
    this.Customer = null;
    this.Customer_Name = "";
    this.Department = null;
    this.Project_Code = null;
    this.apps = [];
    this.siteDistance = null;
    this.isDriving = false;
    this.isWorkFromHome = false;
    this.formData = new FormData();

    this.presentToast("Time-In success");
    this.loadOpenTimesheet();
  }

  /**
   * What the day is being booked as. Only Project distinguishes them - the
   * other types are always someone on duty somewhere.
   */
  checkInType() {
    if (this.isProject() && this.isWorkFromHome) {
      return "Work From Home";
    }

    if (this.isProject() && this.isDriving) {
      return "Driving";
    }

    return "On Duty";
  }

  warnNoLocation() {
    this.displayErrorAlert(
      "Your location is not available yet. Please tap Refresh Location and try again."
    );
  }

  // ---------------------------------------------------------------------------
  // Feedback
  // ---------------------------------------------------------------------------

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

  presentToast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
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

  // ---------------------------------------------------------------------------
  // Clock
  // ---------------------------------------------------------------------------

  formatDate(date) {
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

    return day + "-" + monthNames[d.getMonth()] + "-" + d.getFullYear();
  }

  startTime() {
    var today = new Date();

    return (
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    );
  }

  time() {
    var d = new Date();

    this.clock =
      d.getHours() +
      ":" +
      ("00" + d.getMinutes()).slice(-2) +
      ":" +
      ("00" + d.getSeconds()).slice(-2);
  }
}
