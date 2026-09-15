import { Component } from "@angular/core";
import { ElementRef, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  Platform,
  Events,
  IonicPage,
  ToastController,
} from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
// import { Toast } from "@ionic-native/toast";
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import { Base64 } from "@ionic-native/base64";
import { IonicSelectableComponent } from "ionic-selectable";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { File, FileEntry } from "@ionic-native/file";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ModalController } from "ionic-angular/components/modal/modal-controller";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-claimsubmission",
  templateUrl: "claimsubmission.html",
})


export class ClaimsubmissionPage {
  private ClaimSheetId: any;
  private id: any;
  public items: any;
  public expenses: any;
  public Date: any = "";
  public Project_Name: any = "";
  public Site_Name: any = "";
  public Transport_Type: any = "";
  public Depart_From: any = "";
  public Mileage: any = "";
  No_Of_Night: any = "1";

  public Destination: any = "";
  public Expenses_Type: any = "";
  // The machine the claim is raised against. Both lists come from Option
  // Control; the models shown are only the ones filed under the chosen brand.
  public Brand: any = "";
  public Model: any = "";
  public brands: any = [];
  public models: any = [];
  public allModels: any = [];
  public Total_Expenses: any = "";
  public Advance: any = "0";
  public Total_Amount: any = "";
  public Total_Without_GST: any = "0";
  public Remarks: any = "";
  public image: string;
  public myphoto: string;
  public ProjectId: any = "";
  imageURI: any;
  images = [];
  imagesN = [];
  public signupform: FormGroup;
  public codes: any;
  public scope: any;
  public departs: any;
  approverOptions: any;
  apps: any;
  Location_Name: "";
  Project_Code: any;
  Site_Code: any;
  scopeOfWorkOptions: any;
  ScopeOfWork: any;
  formData: FormData;
  expenses_code: {} = {};
  expenses_rate: {} = {};
  public isFixedRate: boolean = false;

  // The outstation meal allowance is one expense type with the meals ticked
  // beside it, instead of a type per meal: the claim is worth the sum of
  // whichever are ticked, priced by the server for the claimant's own region.
  public mealOptions = [
    { value: "BREAKFAST", label: "Breakfast" },
    { value: "LUNCH", label: "Lunch" },
    { value: "DINNER", label: "Dinner" },
  ];
  public mealComponents: any = {};
  public hideMealComponents: boolean = true;

  // The revised claim policy's date-range expense types. Laundry and the two
  // overseas daily allowances all run over a trip rather than a single day, so
  // they take a start and an end date and are priced from them by the server.
  //
  // These names are the same strings App\Services\ClaimService holds as
  // constants. The app uses them only to decide which fields to SHOW: every
  // amount, limit and refusal comes back from /claimpolicypreview, which runs
  // the same ClaimService::policyClaim() the save runs, so the app and the web
  // form cannot show a claimant different figures.
  public readonly LAUNDRY_TYPE = "LAUNDRY ALLOWANCE";
  public readonly LODGING_TYPE = "LODGING";
  public readonly TRANSPORT_TYPE = "TRANSPORT CLAIM (TAXI/GRAB)";
  public readonly OVERSEAS_TYPES = [
    "OVERSEAS TRAINING/MEETING ALLOWANCE",
    "OVERSEAS BUSINESS TRIP ALLOWANCE",
  ];

  // Lodging. The policy's two halves are different claims: with a hotel receipt
  // the claimant is reimbursed what the room cost, up to a per-night cap for
  // their staff level; without one they draw a flat rate per person per night,
  // so the amount is calculated rather than keyed in.
  public Has_Receipt: any = "1";
  public Pax: any = "1";
  public Lodging_Nights: any = "";

  // A taxi or Grab receipt has to name both ends of the trip. Free text - no
  // map lookup.
  public Pickup_Location: any = "";
  public Dropoff_Location: any = "";

  public Start_Date: any = "";
  public End_Date: any = "";

  // Where an overseas trip went. The only thing the daily subsistence rate
  // depends on - the policy pays every staff level alike - so the claim cannot
  // be priced until it is answered. The values are the same two strings
  // ClaimService::TRIP_REGIONS holds.
  public Trip_Region: any = "";
  public tripRegionOptions = [
    { value: "Asia", label: "Asia (excluding Middle East, Papua New Guinea)" },
    { value: "Europe / USA / Others", label: "Europe / USA / Others" },
  ];

  // What the server said about this claim: the limit behind it, the reason it
  // cannot be raised yet, and - for laundry - the attendance the decision was
  // made on. Laundry is the one claim whose eligibility a claimant cannot work
  // out for themselves, so the days behind it are shown back to them.
  public policyLimit: string = "";
  public policyError: string = "";
  public policyLevelNotice: string = "";
  public policyTimesheet: any[] = [];
  public isPricingPolicyClaim: boolean = false;

  // A mileage claim is priced from a distance nobody types: the road between the
  // site timed in to on the claim date and where the day was timed out,
  // measured by the server. The field is read-only, so this holds what came
  // back - and the reason there is nothing, when there is nothing.
  public autoMileageReason: string = "";
  public isMeasuringMileage: boolean = false;

  public Company_Name: any = "";
  public Company_No: any = "";
  public SST_No: any = "";
  public Work_Description: any = "";
  public Car_No: any = "";
  public Receipt_No: any = "";
  public token: any;
  Docket: any = "";
  hideDocket: boolean = false;

  public Trip: any = "";

  // The receipt issuer's own details are no longer collected on a claim, so
  // these stay hidden. /onchange never asks for them back.
  public hideCompanyName: boolean = true;
  public hideCompanyNo: boolean = true;
  public hideSstNo: boolean = true;
  public hideReceiptNo: boolean = false;
  public hideWorkDescription: boolean = false;
  public hideTotalExpenses: boolean = false;

  public hideCarNo: boolean = false;

  public hideTransport: boolean = true;
  public hideDepart: boolean = true;
  public hideDestination: boolean = true;
  public hideMileage: boolean = true;

  public hideNoOfNight: boolean = true;
  public purchaseOrders = [];
  hideSubcon: boolean = false;
  polisting_id: any;
  vendor_id: any;
  public vendors = [];

  PartnerName: any = [];
  public hidePartnerName: boolean = true;
  public hideTrip: boolean = true;
  allname: any = [];

  exptype: any = "";
  public outstationTypes = [];
  @ViewChild("companyComponent") companyComponent: IonicSelectableComponent;
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
  constructor(
    public navCtrl: NavController,
    private camera: Camera,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private file: File,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    private imagePicker: ImagePicker,
    private base64: Base64,
    // private toast: Toast,
    public navParams: NavParams,
    public platform: Platform,
    public modalCtrl: ModalController,
    public events: Events,
    public toastCtrl: ToastController
  ) {
    this.ClaimSheetId = this.navParams.get("Id");
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Date: new FormControl("", [Validators.required]),
      Transport_Type: new FormControl("", []),
      Depart_From: new FormControl("", []),
      Mileage: new FormControl("", []),
      No_Of_Night: new FormControl("", []),
      Destination: new FormControl("", []),
      Expenses_Type: new FormControl("", [Validators.required]),
      Brand: new FormControl("", [Validators.required]),
      Model: new FormControl("", [Validators.required]),
      Total_Expenses: new FormControl("", []),
      Advance: new FormControl("", []),
      Remarks: new FormControl("", [Validators.required]),
      Project_Code: new FormControl("", [Validators.required]),
      Site_Code: new FormControl("", [Validators.required]),
      Company_Name: new FormControl("", []),
      Company_No: new FormControl("", []),
      SST_No: new FormControl("", []),
      Work_Description: new FormControl("", []),
      Car_No: new FormControl("", []),
      Receipt_No: new FormControl("", []),
      PartnerName: new FormControl("", []),
      Docket: new FormControl("", []),
      Trip: new FormControl("", []),
      polisting_id: new FormControl("", []),
      vendor_id: new FormControl("", []),
      // Required only while a date-range expense type is chosen; see
      // applyPolicyControls().
      Start_Date: new FormControl("", []),
      End_Date: new FormControl("", []),
      // Required only while an overseas allowance is chosen; see
      // applyPolicyControls().
      Trip_Region: new FormControl("", []),
      // Required only while lodging is chosen.
      Has_Receipt: new FormControl("", []),
      Pax: new FormControl("", []),
      Lodging_Nights: new FormControl("", []),
      // Required only while the taxi/e-hailing claim is chosen.
      Pickup_Location: new FormControl("", []),
      Dropoff_Location: new FormControl("", [])
    });

  }

  ionViewDidLoad() {
    this.storage.get('token').then((data) => {
      this.token = data.token;
    });
    this.loadData();
  }

  filterPorts(apps: any, text: string) {
    return apps.filter((app) => {
      return app.Project_Code.toLowerCase().indexOf(text) !== -1;
    });
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
    event.component.items = this.apps.filter(
      (a) => a.siteCode.toLowerCase().indexOf(text) !== -1
    );
    event.component.endSearch();
  }
  searchItems(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    // event.component.startSearch();
    // if (text.length < 2) {
    //   event.component.items = [];
    //   event.component.endSearch();
    //   return;
    // }
    // if (!text) {
    //   event.component.items = [];
    //   event.component.endSearch();
    //   return;
    // }
    event.component.items = this.filterPorts(this.items, text);
    // event.component.endSearch();
  }

  calculateTotal() {
    this.Advance = 0;
    if (this.Expenses_Type == "ACCOMODATION") {
      if (this.PartnerName.length == 0) {
        var total =
          Number.parseFloat(this.Total_Expenses) -
          Number.parseFloat(this.Advance);
        return total.toFixed(2);
      }
      if (this.PartnerName.length == 1) {
        var total =
          Number.parseFloat(this.Total_Expenses) -
          Number.parseFloat(this.Advance);
        return total.toFixed(2);
      }
      if (this.PartnerName.length == 2) {
        var total =
          Number.parseFloat(this.Total_Expenses) -
          Number.parseFloat(this.Advance);
        return total.toFixed(2);
      }
      if (this.PartnerName.length == 3) {
        var total =
          Number.parseFloat(this.Total_Expenses) -
          Number.parseFloat(this.Advance);
        return total.toFixed(2);
      }
      if (this.PartnerName.length == 4) {
        var total =
          Number.parseFloat(this.Total_Expenses) -
          Number.parseFloat(this.Advance);
        return total.toFixed(2);
      }
    } else {
      var total =
        Number.parseFloat(this.Total_Expenses) -
        Number.parseFloat(this.Advance);
      return total.toFixed(2);
    }
  }


  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      // saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      // Full-resolution iPhone photos are 2-5 MB each; nginx on production
      // rejects the whole multipart POST with 413 once the body passes 1 MB.
      // Downscaling keeps a receipt readable while staying well under it.
      targetWidth: 1280,
      targetHeight: 1280,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        // this.image = 'data:image/jpeg/jpg;base64,' + imageData;
        this.images.push(imageData);
        // console.log(image)
        let filePath = imageData;
        let fileName = filePath.split("/").pop();
        let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        console.log(path,fileName);
        this.file
          .readAsDataURL(path, fileName)
          .then((base64File) => {
            console.log(base64File)
            this.imagesN.push(
              this.domSanitizer.bypassSecurityTrustResourceUrl(base64File)
            );
          },(error)=>{
            console.log(error)
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

  getImage() {
    const options: ImagePickerOptions = {
      quality: 70,
      outputType: 0,
      // Same 1 MB server body limit applies to gallery picks. See onTakePicture.
      width: 1280,
      height: 1280,
    };

    const pick = () => {
      this.imagePicker.getPictures(options).then(
        (results) => {
          for (let result of results) {
            this.addPickedImage(result);
          }
        },
        (err) => {
          this.displayErrorAlert("Could not open the gallery. " + JSON.stringify(err));
        }
      );
    };

    this.imagePicker.hasReadPermission().then((granted) => {
      if (granted) {
        pick();
        return;
      }

      this.imagePicker.requestReadPermission().then(
        () => pick(),
        (err) => {
          this.displayErrorAlert("Permission to read photos was denied.");
        }
      );
    });
  }

  /**
   * Record one picked photo: exactly once in `images` (what gets uploaded) and
   * once in `imagesN` (the thumbnail). The picker returns bare paths on iOS and
   * already-qualified URIs on Android, so the scheme is only added when missing.
   */
  private addPickedImage(result: string) {
    let uri = result;

    if (uri.indexOf("file://") !== 0 && uri.indexOf("content://") !== 0) {
      uri = "file://" + uri;
    }

    this.images.push(uri);

    let fileName = uri.split("/").pop();
    let path = uri.substring(0, uri.lastIndexOf("/") + 1);

    this.file.readAsDataURL(path, fileName).then(
      (base64File) => {
        this.imagesN.push(
          this.domSanitizer.bypassSecurityTrustResourceUrl(base64File)
        );
      },
      () => {
        // The file plugin cannot always read a picker path directly; the base64
        // plugin handles the cases it misses.
        this.base64.encodeFile(uri).then(
          (base64File: string) => {
            this.imagesN.push(
              this.domSanitizer.bypassSecurityTrustResourceUrl(
                "data:image/jpeg;base64," +
                base64File.substring(base64File.indexOf(",") + 1)
              )
            );
          },
          (err) => {
            console.log("Could not build a thumbnail for " + uri, err);
          }
        );
      }
    );
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

  // The old handler blamed the network for every failure, which hid real server
  // responses - a 413 from nginx never reaches PHP, so it leaves no Laravel log
  // either and there was nothing to go on. Report the status instead.
  describeSubmitError(err) {
    if (err && err.status === 0) {
      return "Could not reach the server. Please check network connection.";
    }

    if (err && err.status === 413) {
      return "The attached photos are too large for the server to accept. Please attach fewer or smaller photos.";
    }

    if (err && err.status === 401) {
      return "Your session has expired. Please log in again.";
    }

    var detail = "";
    if (err && err.error) {
      if (typeof err.error === "string") {
        detail = err.error;
      } else if (err.error.message) {
        detail = err.error.message;
      } else {
        for (var item in err.error) {
          detail = err.error[item][0];
        }
      }
    }

    return (
      "Error submitting claim (HTTP " +
      (err && err.status ? err.status : "?") +
      ")." +
      (detail ? " " + detail : "")
    );
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

  setApproverOptions(value) {
    if (!value) {
      return;
    }

    let arrApps = new Array();
    let projectName = "";
    for (let item of this.items) {
      if (item.Id == value) {
        projectName = item.Project_Name;
        break;
      }
    }
    this.approverOptions = arrApps;
  }

  scopeOfWorks(id) {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getscope/" +
        id +
        "?token=" +
        val.token
      );
      data.subscribe((result) => {
        console.log(result);
        this.scope = result;
      });
    });
  }

  siteCode() {
    let data: Observable<any>;
    let selectedProjectCode = this.Project_Code;
    this.clearVendor();
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
      this.apps = [
        {
          Id: selectedProjectCode["Id"],
          siteCode: selectedProjectCode["Project_Code"],
        },
      ];
    }
  }

  loadData() {
    let data: Observable<any>;
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojects?token=" +
        val.token  + "&type=claim"
      );
      data.subscribe((result) => {
        console.log(result);
        this.items = result;
      });

      data = this.http.get(
        SERVER_URL + "/getclaimoption?token=" +
        val.token
      );
      data.subscribe((result) => {
        console.log(result);
        let expenses = new Array();
        let brands = new Array();
        this.allModels = new Array();
        for (let res of result) {
          if (res.Field == "Brand") {
            brands.push(res);
          }
          // A model carries the brand it belongs to in Parent_Option; one with
          // no brand on its option row is offered under every brand.
          if (res.Field == "Model") {
            this.allModels.push(res);
          }
          if (res.Field == "Expenses_Type") {
            expenses.push(res);
            this.expenses_code[res.Option] = [
              { Department: res.Department, Code: res.Code },
            ];
            // `Extra` holds a fixed rate for allowance-style options (e.g. meals);
            // when present the amount is auto-filled and not manually entered.
            this.expenses_rate[this.decodeEntities(res.Option)] = res.Extra;
          }
        }
        this.expenses = expenses;
        this.brands = brands;
        this.filterModels();
        // A claim already booked to "Common" opens with no Model asked for.
        this.applyModelValidator();
      });
    });

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getName?token=" + val.token
      );
      data.subscribe((result) => {
        this.allname = result;
      });

      // this.http
      //   .get(SERVER_URL + "/claims/get-outstation-types", {
      //     params: {
      //       token: val.token,
      //     },
      //   })
      //   .subscribe((result: any) => {
      //     this.outstationTypes = result;
      //   });
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error("An error occurred:", error.error.message);
      return Observable.throw("An error occurred:" + error.error.message);
    } else {
      console.error(
        `Backend returned code ${JSON.stringify(error)}, ` +
        `body was: ${JSON.stringify(error)}`
      );
      if (error.status == 422) {
        return Observable.throw("Invalid username or password");
      }
      return Observable.throw("An error occured. Try again later");
    }
  }

  submitClaim() {
    if (this.Expenses_Type == "ACCOMODATION") {
      let a = this.Total_Expenses / this.No_Of_Night;

      if (this.PartnerName.length == 0 && a > 100) {
        stop;
        this.displayErrorAlert("Claim amount exceeded the limit!");
        return;
      }

      if (this.PartnerName.length == 1 && a > 120) {
        stop;
        this.displayErrorAlert("Claim amount exceeded the limit!");
        return;
      }

      if (this.PartnerName.length == 2 && a > 150) {
        stop;
        this.displayErrorAlert("Claim amount exceeded the limit!");
        return;
      }

      if (this.PartnerName.length == 3 && a > 200) {
        stop;
        this.displayErrorAlert("Claim amount exceeded the limit!");
        return;
      }
    }

    if (
      this.isOutstationMealAllowance(this.Expenses_Type) &&
      this.tickedMeals().length == 0
    ) {
      this.displayErrorAlert(
        "Please tick at least one meal (breakfast, lunch or dinner)."
      );
      return;
    }

    if (!this.Remarks) {
      this.displayErrorAlert("Must input remarks");
      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });

    loading.present();

    this.storage.get("token").then((val) => {
      var Location_Name = "";
      if (this.Site_Name) {
        Location_Name = this.Site_Name;
      } else {
        Location_Name = this.Project_Code["Site Id"]
          ? this.Project_Code["Site Id"]
          : this.Project_Code["Site LRD"]
            ? this.Project_Code["Site LRD"]
            : this.Project_Code["Site Name"];
      }

      let p = new Promise((resolveReady, rejectReady) => {
        var defs = [];
        this.formData = new FormData();
        this.images.forEach((i) => {
          var self = this;
          // Every branch below has to settle. A path that neither resolves nor
          // rejects leaves Promise.all pending forever, which is what made the
          // submit spinner hang instead of reporting a photo it could not read.
          var def = new Promise((resolve, reject) => {
            this.file.resolveLocalFilesystemUrl(i).then(
              (entry: FileEntry) => {
                entry.file(
                  function (file) {
                    var reader = new FileReader();
                    reader.onload = function () {
                      var imgBlob = new Blob([this.result], {
                        type: file.type,
                      });
                      self.formData.append("attachment[]", imgBlob, file.name);
                      resolve(i);
                    };
                    reader.onerror = function () {
                      reject("Could not read one of the selected photos.");
                    };
                    reader.readAsArrayBuffer(file);
                  },
                  function (e) {
                    reject("Could not open one of the selected photos. " + JSON.stringify(e));
                  }
                );
              },
              (err) => {
                reject("Could not find one of the selected photos on this device. " + JSON.stringify(err));
              }
            );
          });

          defs.push(def);
        });

        Promise.all(defs).then((res) => {
          this.formData.append("Date", this.myFunction(this.Date));
          this.formData.append("No_Of_Night", this.No_Of_Night);

          // The trip a laundry or overseas allowance covers. Sent only when the
          // expense type actually has one, so an ordinary claim does not carry
          // stale dates from a type that was chosen and then changed.
          if (this.isTripDateType(this.Expenses_Type)) {
            this.formData.append("Start_Date", this.myFunction(this.Start_Date));
            this.formData.append("End_Date", this.myFunction(this.End_Date));
          }

          // Only the overseas allowances have a destination, and the server
          // prices them from it.
          if (this.isOverseasAllowance(this.Expenses_Type)) {
            this.formData.append("Trip_Region", this.Trip_Region);
          }

          // Lodging is priced from the receipt, the nights and the pax.
          if (this.isLodgingClaim(this.Expenses_Type)) {
            this.formData.append("Has_Receipt", this.Has_Receipt);
            this.formData.append("Pax", this.Pax);
            this.formData.append("Lodging_Nights", this.Lodging_Nights);
          }

          // A taxi receipt has to name both ends of the trip.
          if (this.isTransportClaim(this.Expenses_Type)) {
            this.formData.append("Pickup_Location", this.Pickup_Location);
            this.formData.append("Dropoff_Location", this.Dropoff_Location);
          }
          this.formData.append("Project_Code", this.Project_Code.Id);
          this.formData.append("Site_Code", this.Site_Code.Id);
          this.formData.append("Site_Name", this.Site_Name);
          this.formData.append("Transport_Type", this.Transport_Type);
          this.formData.append("Depart_From", this.Depart_From);
          this.formData.append("Destination", this.Destination);
          this.formData.append("Mileage", this.Mileage);
          this.formData.append("Expenses_Type", this.Expenses_Type);
          this.formData.append("Brand", this.Brand);
          this.formData.append("Model", this.Model);
          this.formData.append("Code", this.getExpenseCode(this.Expenses_Type));
          this.formData.append("Total_Expenses", this.Total_Expenses);
          this.formData.append("Advance", this.Advance);
          this.formData.append("Total_Amount", this.calculateTotal());
          this.formData.append("Total_Without_GST", this.Total_Without_GST);
          this.formData.append("Remarks", this.Remarks);
          this.formData.append("Trip", this.Trip);
          this.formData.append("Scope", "");
          this.formData.append("Docket", this.Docket);
          this.formData.append("TrackerId", this.Project_Code.Id);
          this.formData.append(
            "Company_Name",
            typeof this.Company_Name === "object"
              ? this.Company_Name.Vendor_Name
              : this.Company_Name
          );
          this.formData.append("Company_No", this.Company_No);
          this.formData.append("SST_No", this.SST_No);

          this.formData.append("Car_No", this.Car_No);
          this.formData.append("Work_Description", this.Work_Description);
          this.formData.append("Receipt_No", this.Receipt_No);
          this.formData.append("PartnerName", JSON.stringify(this.PartnerName));
          this.formData.append("PartnerNo", this.PartnerName.length);
          this.formData.append('vendor_id', this.vendor_id ? this.vendor_id.Id : "");
          this.formData.append('polisting_id', this.polisting_id ? this.polisting_id.Id : "");
          // One claim line for however many meals were ticked: the server sums
          // the rates and records which in the expense type's own label.
          this.tickedMeals().forEach((meal) => {
            this.formData.append("meal_components[]", meal);
          });
          resolveReady();
        }, rejectReady);
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/newclaim3?token=" +
            val.token +
            "&ClaimSheetId=" +
            this.ClaimSheetId,
            this.formData,
            {}
          )
          .subscribe(
            (res: any) => {
              if (res == 1) {
                this.events.publish("new-claim", []);
                this.navCtrl.pop();
                loading.dismiss();
                const toast = this.toastCtrl.create({
                  message: "New Claim created",
                  duration: 1500,
                  position: 'bottom'
                });
                toast.present();
                // this.toast
                //   .show(`New Claim created`, "10000", "center")
                //   .subscribe((toast) => { });
              } else if (res == 2) {
                loading.dismiss();
                const toast = this.toastCtrl.create({
                  message: "Need to add Attachment",
                  duration: 2000,
                  position: 'bottom'
                });
                toast.present();
                // this.toast
                //   .show(`Need to add Attachment`, "50000", "center")
                //   .subscribe((toast) => { });
              } else {
                var obj = res;
                var errormessage = "";
                for (var item in obj) {
                  errormessage = obj[item][0];
                }
                loading.dismiss();

                this.displayErrorAlert(errormessage);
              }
            },
            (err) => {
              loading.dismiss();

              this.displayErrorAlert(this.describeSubmitError(err));
            }
          );
      }).catch((err) => {
        loading.dismiss();
        this.displayErrorAlert(
          typeof err === "string" ? err : "Error submitting claim."
        );
      });
    });
  }

  /**
   * Narrows the model dropdown to the chosen brand. Called when the brand
   * changes and once the options have loaded, so what is on screen always
   * matches the brand selected.
   */
  filterModels() {
    let brand = this.Brand;

    this.models = this.isCommonBrand()
      ? []
      : (this.allModels || []).filter((model) => {
          return !brand || !model.Parent_Option || model.Parent_Option == brand;
        });

    // A model left over from the previous brand is no longer a valid choice.
    let stillListed = this.models.some((model) => model.Option == this.Model);

    if (!stillListed) {
      this.Model = "";
      if (this.signupform && this.signupform.get("Model")) {
        this.signupform.get("Model").setValue("");
      }
    }
  }

  brandChanged() {
    this.filterModels();
    this.applyModelValidator();
  }

  /**
   * "Common" is not a brand of its own but the answer for a claim covering
   * several of them, so there is no one machine to name: the Model field is
   * taken off the form while it is chosen.
   */
  isCommonBrand() {
    return String(this.Brand || "").toLowerCase() == "common";
  }

  /**
   * Model is required with every brand but "Common", which does not ask for
   * one - left required, the form would never validate with the field off
   * screen.
   */
  applyModelValidator() {
    let model = this.signupform ? this.signupform.get("Model") : null;

    if (!model) {
      return;
    }

    model.setValidators(this.isCommonBrand() ? [] : [Validators.required]);
    model.updateValueAndValidity();
  }

  getExpenseCode(Expenses_Type) {
    if (
      this.expenses_code[Expenses_Type] &&
      this.expenses_code[Expenses_Type].length > 0
    ) {
      if (this.Project_Name == 1) {
        return this.expenses_code[Expenses_Type][0].Department
          ? this.expenses_code[Expenses_Type][0].Department
          : "";
      }

      return this.expenses_code[Expenses_Type][0].Code
        ? this.expenses_code[Expenses_Type][0].Code
        : "";
    }

    return "";
  }

  isObject(variable) {
    return typeof variable === "object";
  }

  setSiteName(Project_Code) {
    if (typeof Project_Code === "object") {
      let str = "";

      if (Project_Code["Site Id"]) {
        str = Project_Code["Site Id"];
      }

      if (str != "" && Project_Code["Site LRD"]) {
        str = str + " - " + Project_Code["Site LRD"];
      } else if (Project_Code["Site LRD"]) {
        str = Project_Code["Site LRD"];
      }

      if (str != "" && Project_Code["Site Name"]) {
        str = str + " - " + Project_Code["Site Name"];
      } else if (Project_Code["Site Name"]) {
        str = Project_Code["Site Name"];
      }
      this.Site_Name = Project_Code["Site Name"];
    }
  }


  /** Whether an expense type is the single outstation meal allowance entry. */
  isOutstationMealAllowance(Expenses_Type) {
    return (
      String(Expenses_Type || "").trim().toUpperCase() ==
      "OUTSTATION MEAL ALLOWANCE"
    );
  }

  /**
   * Whether this expense type runs over a trip rather than a single day, and so
   * takes a start and an end date.
   */
  isTripDateType(Expenses_Type) {
    let type = String(Expenses_Type || "").trim().toUpperCase();

    return type == this.LAUNDRY_TYPE || this.OVERSEAS_TYPES.indexOf(type) !== -1;
  }

  /**
   * Whether this expense type is one of the two overseas daily allowances, and
   * so needs a destination before it can be priced.
   */
  isOverseasAllowance(Expenses_Type) {
    return (
      this.OVERSEAS_TYPES.indexOf(
        String(Expenses_Type || "").trim().toUpperCase()
      ) !== -1
    );
  }

  /** Whether this expense type is the laundry allowance. */
  isLaundryClaim(Expenses_Type) {
    return (
      String(Expenses_Type || "").trim().toUpperCase() == this.LAUNDRY_TYPE
    );
  }

  /**
   * Turn the trip dates on or off with the expense type, and clear whatever was
   * answered for the last one so a trip cannot be carried over onto a claim
   * that is no longer a trip.
   */
  /** Whether this expense type is the lodging claim. */
  isLodgingClaim(Expenses_Type) {
    return (
      String(Expenses_Type || "").trim().toUpperCase() == this.LODGING_TYPE
    );
  }

  /** Whether this expense type is the taxi / e-hailing transport claim. */
  isTransportClaim(Expenses_Type) {
    return (
      String(Expenses_Type || "").trim().toUpperCase() == this.TRANSPORT_TYPE
    );
  }

  /** Whether the revised claim policy prices this expense type at all. */
  isPolicyType(Expenses_Type) {
    return (
      this.isTripDateType(Expenses_Type) ||
      this.isLodgingClaim(Expenses_Type) ||
      this.isTransportClaim(Expenses_Type)
    );
  }

  /** Whether a lodging claim is being made against a hotel receipt. */
  lodgingHasReceipt() {
    return String(this.Has_Receipt) == "1";
  }

  /**
   * Turn each of the policy's own fields on or off with the expense type, and
   * clear whatever was answered for the last one so nothing is carried over
   * onto a claim that no longer has that field.
   *
   * Only which fields are ASKED for is decided here. What the answers are worth
   * is decided by the server - see updatePolicyClaim().
   */
  applyPolicyControls(Expenses_Type) {
    let isTrip = this.isTripDateType(Expenses_Type);
    let isOverseas = this.isOverseasAllowance(Expenses_Type);
    let isLodging = this.isLodgingClaim(Expenses_Type);
    let isTransport = this.isTransportClaim(Expenses_Type);

    this.policyLimit = "";
    this.policyError = "";
    this.policyLevelNotice = "";
    this.policyTimesheet = [];

    // Anything not being asked for is emptied, so a trip cannot survive a
    // switch to a taxi fare.
    if (!isTrip) {
      this.Start_Date = "";
      this.End_Date = "";
    }

    if (!isOverseas) {
      this.Trip_Region = "";
    }

    if (!isLodging) {
      this.Has_Receipt = "1";
      this.Pax = "1";
      this.Lodging_Nights = "";
    }

    if (!isTransport) {
      this.Pickup_Location = "";
      this.Dropoff_Location = "";
    }

    this.requireWhen("Start_Date", isTrip);
    this.requireWhen("End_Date", isTrip);
    this.requireWhen("Trip_Region", isOverseas);
    this.requireWhen("Has_Receipt", isLodging);
    this.requireWhen("Pax", isLodging);
    this.requireWhen("Lodging_Nights", isLodging);
    this.requireWhen("Pickup_Location", isTransport);
    this.requireWhen("Dropoff_Location", isTransport);

    if (!this.isPolicyType(Expenses_Type)) {
      return;
    }

    // Whether the amount is the claimant's to type. The overseas allowances and
    // laundry are always worked out; lodging is worked out only when there is
    // no receipt, because with one the claimant is reimbursed what the room
    // actually cost. A taxi fare is always keyed in.
    this.isFixedRate = isTrip || (isLodging && !this.lodgingHasReceipt());

    if (this.isFixedRate) {
      this.Total_Expenses = "";
    }

    this.updatePolicyClaim();
  }

  /** Add or drop the required validator on one control. */
  private requireWhen(name, required) {
    let control = this.signupform.get(name);

    control.setValidators(required ? [Validators.required] : []);
    control.updateValueAndValidity();
  }

  /**
   * With a receipt the claimant types what the room cost and it is checked
   * against the cap; without one the rate is the policy's, so the field is
   * locked and filled from the server.
   */
  onLodgingChange() {
    this.isFixedRate = !this.lodgingHasReceipt();

    if (this.isFixedRate) {
      this.Total_Expenses = "";
    }

    this.updatePolicyClaim();
  }

  /** Re-price the claim when either end of the trip moves. */
  onTripDateChange() {
    this.updatePolicyClaim();
  }

  /** The destination sets the daily rate, so it re-prices the claim too. */
  onTripRegionChange() {
    this.updatePolicyClaim();
  }

  /**
   * Whether enough has been filled in for the server to have an answer worth
   * showing.
   *
   * Asking too early would put a "choose where the trip went" under a field the
   * claimant has not reached yet, so each type names what it needs before the
   * question is worth asking at all.
   */
  private policyClaimIsAnswerable() {
    if (this.isLodgingClaim(this.Expenses_Type)) {
      return Number(this.Lodging_Nights) > 0;
    }

    if (!this.Start_Date || !this.End_Date) {
      return false;
    }

    return !this.isOverseasAllowance(this.Expenses_Type) || !!this.Trip_Region;
  }

  /**
   * Ask the server what this claim comes to, and keep the answer.
   *
   * Nothing is worked out here: the amount, the limit and the refusal all come
   * from ClaimService::policyClaim(), the same code the save runs, so what the
   * claimant is shown and what the claim is stored with cannot disagree.
   *
   * For laundry the answer carries the attendance it was judged on, which is
   * what makes a refusal explain itself instead of just being a "no".
   */
  updatePolicyClaim() {
    // A taxi fare has no limit and no calculated amount - the only rule is that
    // both ends of the trip are named, which the form already insists on - so
    // there is nothing to ask the server for.
    if (
      !this.isPolicyType(this.Expenses_Type) ||
      this.isTransportClaim(this.Expenses_Type)
    ) {
      return;
    }

    if (!this.policyClaimIsAnswerable()) {
      this.Total_Expenses = this.isFixedRate ? "" : this.Total_Expenses;
      this.policyTimesheet = [];
      this.policyError = "";
      this.policyLimit = "";
      return;
    }

    this.isPricingPolicyClaim = true;

    this.storage.get("token").then((val) => {
      this.http
        .post(
          SERVER_URL + "/claimpolicypreview?token=" + val.token,
          {
            Expenses_Type: this.Expenses_Type,
            Date: this.Date ? this.myFunction(this.Date) : "",
            Start_Date: this.Start_Date ? this.myFunction(this.Start_Date) : "",
            End_Date: this.End_Date ? this.myFunction(this.End_Date) : "",
            Trip_Region: this.Trip_Region,
            Has_Receipt: this.Has_Receipt,
            Pax: this.Pax,
            No_Of_Night: this.Lodging_Nights,
            Total_Expenses: this.Total_Expenses,
          },
          httpOptions
        )
        .subscribe(
          (result: any) => {
            this.isPricingPolicyClaim = false;

            if (!result) {
              return;
            }

            this.policyLimit = result.limit || "";
            this.policyError = result.error || "";
            this.policyLevelNotice = result.levelNotice || "";
            this.policyTimesheet = result.timesheet || [];

            // An amount only when the claim actually stands; a refused one is
            // left empty rather than showing a figure that will not be paid.
            this.Total_Expenses =
              result.error || result.amount === null || result.amount === undefined
                ? ""
                : Number(result.amount).toFixed(2);
          },
          (error) => {
            this.isPricingPolicyClaim = false;
            console.error("Could not price the claim", error);
            this.policyError =
              "The claim limit could not be checked just now. Try again before submitting.";
          }
        );
    });
  }

  /** The meals ticked, in the order the policy lists them. */
  tickedMeals() {
    return this.mealOptions
      .filter((meal) => this.mealComponents[meal.value])
      .map((meal) => meal.value);
  }

  /**
   * Re-measures the mileage when the claim date changes.
   *
   * The date is what decides the distance - it is the day whose attendance the
   * journey is read off - so it matters as much as the expense type.
   */
  onClaimDateChange() {
    this.updateAutoMileage();
  }

  /**
   * The site code only picks BETWEEN attendances on a day that has more than
   * one, but that is enough to change which journey is measured.
   */
  onSiteCodeChange() {
    this.clearVendor();
    this.updateAutoMileage();
  }

  /**
   * Fills the read-only kilometres from the claimant's own attendance.
   *
   * Measured server side from the site timed in to out to where they timed out
   * - see App\Services\ClaimMileageService. Measured again on save, so what is
   * shown here and what the claim is stored with are the same number.
   *
   * When it cannot be measured the reason is shown under the field and the
   * kilometres are left empty: the save is refused with the same reason, so
   * saying so now is better than after they have filled the rest in.
   */
  updateAutoMileage() {
    if (this.hideMileage) {
      this.autoMileageReason = "";
      return;
    }

    if (!this.Date) {
      this.Mileage = "";
      this.autoMileageReason =
        "Pick the claim date and the distance will be measured from your attendance.";
      return;
    }

    this.isMeasuringMileage = true;
    this.autoMileageReason = "";

    this.storage.get("token").then((val) => {
      this.http
        .post(
          SERVER_URL + "/automileage?token=" + val.token,
          {
            Date: this.myFunction(this.Date),
            Site_Code: this.Site_Code ? this.Site_Code.Id : "",
            Expenses_Type: this.Expenses_Type,
            Transport_Type: this.Transport_Type,
          },
          httpOptions
        )
        .subscribe(
          (result: any) => {
            this.isMeasuringMileage = false;

            if (!result || !result.available) {
              this.Mileage = "";
              this.autoMileageReason =
                (result && result.reason) ||
                "The distance for this date could not be measured.";
              return;
            }

            this.Mileage = result.mileage;
            this.Depart_From = result.depart_from;
            this.Destination = result.destination;
            this.autoMileageReason = "";
          },
          (error) => {
            this.isMeasuringMileage = false;
            console.error("Could not measure the mileage", error);
            this.Mileage = "";
            this.autoMileageReason =
              "The distance could not be measured. Please try again.";
          }
        );
    });
  }

  /**
   * What the ticked meals come to.
   *
   * The rate follows the claimant's home base and staff category, so only the
   * server can answer it - and it is worked out again on save, so this fill is
   * for the claimant's benefit, not the figure the claim is stored with.
   */
  updateMealTotal() {
    let meals = this.tickedMeals();

    if (meals.length == 0) {
      this.Total_Expenses = "";
      return;
    }

    this.storage.get("token").then((val) => {
      this.http
        .post(
          SERVER_URL + "/mealallowance?token=" + val.token,
          {
            Expenses_Type: "OUTSTATION MEAL ALLOWANCE",
            meal_components: meals,
          },
          httpOptions
        )
        .subscribe(
          (result: any) => {
            if (result && result.rate !== null && result.rate !== undefined) {
              this.Total_Expenses = Number(result.rate).toFixed(2);
            }
          },
          (error) => {
            console.error("Could not price the meal allowance", error);
          }
        );
    });
  }

  setMandatoryField(Expenses_Type) {
    let data: Observable<any>;

    // Fixed-rate options (e.g. meal allowances) carry their rate in `Extra`.
    // Auto-fill the total from the rate and lock the field; other types stay manual.
    let rate = this.expenses_rate[Expenses_Type];
    if (rate !== null && rate !== undefined && rate !== "" && !isNaN(Number(rate))) {
      this.isFixedRate = true;
      this.Total_Expenses = Number(rate).toFixed(2);
    } else {
      this.isFixedRate = false;
      this.Total_Expenses = "";
    }

    // Switching type drops whatever was ticked, so a meal cannot be carried
    // over onto a claim that is no longer a meal allowance. The outstation meal
    // allowance is priced from the ticks, so its total is locked straight away
    // rather than only once /onchange answers.
    this.mealComponents = {};

    if (this.isOutstationMealAllowance(Expenses_Type)) {
      this.isFixedRate = true;
      this.Total_Expenses = "";
    }

    // The revised claim policy's own fields - trip dates, destination, lodging
    // and the taxi locations - and the amount it works out.
    this.applyPolicyControls(Expenses_Type);

    let companyNameControl = this.signupform.get("Company_Name");
    let companyNoControl = this.signupform.get("Company_No");
    let sstNoControl = this.signupform.get("SST_No");
    let receiptNoControl = this.signupform.get("Receipt_No");

    let workDescriptionControl = this.signupform.get("Work_Description");
    let carNoControl = this.signupform.get("Car_No");
    let totalExpensesControl = this.signupform.get("Total_Expenses");

    let transportControl = this.signupform.get("Transport_Type");
    let departFromControl = this.signupform.get("Depart_From");
    let destinationControl = this.signupform.get("Destination");
    let mileageControl = this.signupform.get("Mileage");

    let partnerControl = this.signupform.get("PartnerName");

    let noofnightControl = this.signupform.get("No_Of_Night");

    let docketControl = this.signupform.get("Docket");

    let tripControl = this.signupform.get("Trip");
    let polistingControl = this.signupform.get("polisting_id");
    let vendorControl = this.signupform.get("vendor_id");

    companyNameControl.setValidators([]);
    companyNoControl.setValidators([]);
    sstNoControl.setValidators([]);
    receiptNoControl.setValidators([]);
    workDescriptionControl.setValidators([]);
    totalExpensesControl.setValidators([]);
    carNoControl.setValidators([]);
    transportControl.setValidators([]);
    departFromControl.setValidators([]);
    destinationControl.setValidators([]);
    mileageControl.setValidators([]);
    partnerControl.setValidators([]);
    noofnightControl.setValidators([]);
    docketControl.setValidators([]);
    tripControl.setValidators([]);
    polistingControl.setValidators([]);
    vendorControl.setValidators([]);

    this.hideCompanyName = true;
    this.hideCompanyNo = true;
    this.hideSstNo = true;
    this.hideReceiptNo = true;
    this.hideWorkDescription = true;
    this.hideTotalExpenses = true;
    this.hideCarNo = true;
    this.hideTransport = true;
    this.hideDepart = true;
    this.hideDestination = true;
    this.hideMileage = true;
    this.hidePartnerName = true;
    this.hideNoOfNight = true;
    this.hideDocket = true;
    this.hideTrip = true;
    this.hideSubcon = true;
    this.hideMealComponents = true;
    // Nothing measured yet for the type just picked; a stale reason under the
    // field would be describing the previous one.
    this.autoMileageReason = "";

    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/onchange?token=" +
          val.token,
          { Expenses_Type: Expenses_Type },
          httpOptions
        )
        .subscribe((result: any) => {
          this.exptype = result.js;

          if (this.exptype.includes("tripControl")) {
            this.hideTrip = false;
            tripControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("companyNameControl")) {
            this.hideCompanyName = false;
            companyNameControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("workDescriptionControl")) {
            this.hideWorkDescription = false;
            workDescriptionControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("totalExpensesControl")) {
            this.hideTotalExpenses = false;
            totalExpensesControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("carNoControl")) {
            this.hideCarNo = false;
            carNoControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("transportControl")) {
            this.hideTransport = false;
            transportControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("departFromControl")) {
            this.hideDepart = false;
            departFromControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("destinationControl")) {
            this.hideDestination = false;
            destinationControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("mileageControl")) {
            this.hideMileage = false;
            mileageControl.setValidators([Validators.required]);
            // The distance is measured, not typed - fill it from the attendance
            // for whatever date is already on the form.
            this.updateAutoMileage();
          }

          if (this.exptype.includes("partnerControl")) {
            this.hidePartnerName = false;
            partnerControl.setValidators([]);
          }

          if (this.exptype.includes("noofnightControl")) {
            this.hideNoOfNight = false;
            noofnightControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("sstNoControl")) {
            this.hideSstNo = false;
            sstNoControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("companyNoControl")) {
            this.hideCompanyNo = false;
            companyNoControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("receiptNoControl")) {
            this.hideReceiptNo = false;
            receiptNoControl.setValidators([Validators.required]);
          }

          if (this.exptype.includes("docketControl")) {
            this.hideDocket = false;
            docketControl.setValidators([Validators.required]);
          }
          if (this.exptype.includes("subconControl")) {
            this.hideSubcon = false;
            polistingControl.setValidators([Validators.required]);
            vendorControl.setValidators([Validators.required]);
          }
          if (this.exptype.includes("mealComponentsControl")) {
            this.hideMealComponents = false;
            // The amount comes from the meals ticked, never typed.
            this.isFixedRate = true;
          }
        });
    });
    companyNameControl.updateValueAndValidity();
    companyNoControl.updateValueAndValidity();
    sstNoControl.updateValueAndValidity();
    receiptNoControl.updateValueAndValidity();

    workDescriptionControl.updateValueAndValidity();
    carNoControl.updateValueAndValidity();
    totalExpensesControl.updateValueAndValidity();

    transportControl.updateValueAndValidity();
    departFromControl.updateValueAndValidity();
    destinationControl.updateValueAndValidity();
    mileageControl.updateValueAndValidity();

    partnerControl.updateValueAndValidity();
    noofnightControl.updateValueAndValidity();
  }

  decodeEntities(encodedString) {
    var textArea = document.createElement("textarea");
    textArea.innerHTML = encodedString;
    return textArea.value;
  }
  searchVendors(event: { component: IonicSelectableComponent, text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    this.http.get(SERVER_URL + '/vendors/getOptions', {
      params: {
        token: this.token,
        companyAccount: this.Site_Code.siteCode.split(' - ')[0] || "",
        search: text
      }
    }).subscribe((response: any) => {
      event.component.items = response.data;
    })
    event.component.endSearch();
    return;
  }
  searchPurchaseOrders(event: { component: IonicSelectableComponent, text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();

    this.http.get(SERVER_URL + '/polisting/getOptions', {
      params: {
        token: this.token,
        vendorId: this.vendor_id.Id || "",
        siteCodeId: this.Site_Code.Id || "",
        search: text
      }
    }).subscribe((response: any) => {
      event.component.items = response.data;
    })
    event.component.endSearch();
    return;
  }

  clearPo() {
    this.polisting_id = null;
  }

  clearVendor() {
    this.vendor_id = null;
    this.clearPo();
  }


}
