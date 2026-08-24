import { Component } from "@angular/core";
import { ElementRef, ViewChild } from "@angular/core";
import {
  NavController,
  NavParams,
  Platform,
  Events,
  IonicPage,
} from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import { Base64 } from "@ionic-native/base64";
import { IonicSelectableComponent } from "ionic-selectable";

import { DomSanitizer } from "@angular/platform-browser";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { File, FileEntry } from "@ionic-native/file";
import { FilePath } from "@ionic-native/file-path";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ModalController } from "ionic-angular/components/modal/modal-controller";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";

@IonicPage()
@Component({
  selector: "page-claimedit",
  templateUrl: "claimedit.html",
})
export class ClaimeditPage {
  Web_Path: any = [];

  Advance: any = "";
  Approver: any = "";
  Car_No: any = "";
  ClaimSheetId: any = "";
  Claims_Amount_Exclude_SmartPay: any = "";
  Code: any = "";
  Comment: any = "";
  Company_Name: any = "";
  Company_No: any = "";
  Currency: any = "";
  Date: any = "";
  Dates: any = "";

  Day: any = "";
  Depart_From: any = "";
  Destination: any = "";
  Expenses_Type: any = "";
  Id: any = "";
  JV_Description: any = "";
  Mileage: any = "";
  Mileage_End: any = "";
  Mileage_Start: any = "";
  Next_Person: any = "";
  Petrol_SmartPay: any = "";
  Project_Name: any = "";
  Rate: any = "";
  Receipt_No: any = "";
  Remarks: any = "";
  SST_No: any = "";
  Scope: any = "";
  Site_Name: any = "";
  Status: any = "";
  Total_Amount: any = "";
  Total_Expenses: any = "";
  Total_Without_GST: any = "";
  Transport_Type: any = "";
  Updated_At: any = "";
  Work_Description: any = "";
  project_code: any = "";
  site_code: any = "";
  outstationTypes = [];
  formData: FormData;
  expenses_code: {} = {};
  expenses_rate: {} = {};
  public isFixedRate: boolean = false;
  public companyForm: FormGroup;

  Docket: any = "";
  hideDocket: boolean = false;

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
  allname: any = [];

  exptype: any = "";
  imageURI: any;
  images = [];
  imagesN = [];
  imagesO = [];
  public signupform: FormGroup;
  apps: any;
  items: any;
  approverOptions: any;
  public codes: any;
  public scope: any;
  public departs: any;
  Project_Code: any;
  public expenses: any;
  No_Of_Night: any = "1";
  Site_Code: any = "";
  public token: any;

  private id: any;
  public myphoto: string;
  public ProjectId: any = "";
  public ProjectId2: any = "";

  Location_Name: "";
  scopeOfWorkOptions: any;
  ScopeOfWork: any;

  userImg: any = "";
  base64Img = "";

  public Trip: any = "";
  public hideTrip: boolean = true;
  public firstTime = true;
  gelleryOptions: CameraOptions = {
    quality: 100,
    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
    destinationType: this.camera.DestinationType.DATA_URL,
    allowEdit: true,
  };

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
  public count = 0;
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
    private toast: Toast,
    public navParams: NavParams,
    public platform: Platform,
    public modalCtrl: ModalController,
    public events: Events,
    statusBar: StatusBar,
    splashScreen: SplashScreen,
    private sanitizer: DomSanitizer,
    private filePath: FilePath
  ) {
    this.Advance = this.navParams.get("Advance");
    this.Approver = this.navParams.get("Approver");
    this.Car_No = this.navParams.get("Car_No");
    this.ClaimSheetId = this.navParams.get("ClaimSheetId");
    this.Claims_Amount_Exclude_SmartPay = this.navParams.get(
      "Claims_Amount_Exclude_SmartPay"
    );
    this.Code = this.navParams.get("Code");
    this.Comment = this.navParams.get("Comment");
    this.Company_Name = this.navParams.get("Company_Name");
    this.Company_No = this.navParams.get("Company_No");
    this.Currency = this.navParams.get("Currency");
    this.Dates = this.navParams.get("Date");
    this.Day = this.navParams.get("Day");
    this.Depart_From = this.navParams.get("Depart_From");
    this.Destination = this.navParams.get("Destination");
    this.Expenses_Type = this.navParams.get("Expenses_Type");
    this.Id = this.navParams.get("Id");
    this.JV_Description = this.navParams.get("JV_Description");
    this.Mileage = this.navParams.get("Mileage");
    this.Mileage_End = this.navParams.get("Mileage_End");
    this.Mileage_Start = this.navParams.get("Mileage_Start");
    this.Next_Person = this.navParams.get("Next_Person");
    this.Petrol_SmartPay = this.navParams.get("Petrol_SmartPay");
    this.Project_Name = this.navParams.get("Project_Name");
    this.Rate = this.navParams.get("Rate");
    this.Receipt_No = this.navParams.get("Receipt_No");
    this.Remarks = this.navParams.get("Remarks");
    this.SST_No = this.navParams.get("SST_No");
    this.Scope = this.navParams.get("Scope");
    this.Site_Name = this.navParams.get("Site_Name");
    this.Status = this.navParams.get("Status");
    this.Total_Amount = this.navParams.get("Total_Amount");
    this.Total_Expenses = this.navParams.get("Total_Expenses");
    this.Total_Without_GST = this.navParams.get("Total_Without_GST");
    this.Transport_Type = this.navParams.get("Transport_Type");
    this.Updated_At = this.navParams.get("Updated_At");
    this.Work_Description = this.navParams.get("Work_Description");
    this.project_code = this.navParams.get("project_code");
    this.site_code = this.navParams.get("site_code");
    this.ProjectId = this.navParams.get("ProjectId");
    this.ProjectId2 = this.navParams.get("ProjectId2");
    this.No_Of_Night = this.navParams.get("NoOfNight");
    this.Date = this.myFunction2(this.Dates);

    this.Trip = this.navParams.get("Type");
    this.vendor_id = {
      Id: this.navParams.get('vendor_id'),
      Vendor_Name: this.navParams.get('Vendor_Name')
    };
    this.polisting_id = {
      Id: this.navParams.get('polisting_id'),
      PO_No: this.navParams.get('PO_No')
    };
    // this.firstTime = false;
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
    //  this.userImg = 'assets/imgs/logo.png';
  }

  openGallery() {
    this.camera.getPicture(this.gelleryOptions).then(
      (imgData) => {
        console.log("image data =>  ", imgData);
        this.base64Img = "data:image/jpeg/jpg;base64," + imgData;
        this.userImg = this.base64Img;
      },
      (err) => {
        console.log(err);
        console.log("userimg", this.userImg);
      }
    );
  }

  myFunction2(date) {
    var d = new Date(date);
    var monthNames = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ];

    var day = ("0" + d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return year + "-" + monthNames[monthIndex] + "-" + day;
  }

  ionViewDidLoad() {
    this.storage.get('token').then((data) => {
      this.token = data.token;
    });
    this.loadData();
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
      // ScopeOfWork: new FormControl("", [Validators.required]),
      PartnerName: new FormControl("", []),
      Docket: new FormControl("", []),
      Trip: new FormControl("", []),
      polisting_id: new FormControl("", []),
      vendor_id: new FormControl("", [])
    });

    this.companyForm = new FormGroup({
      Company_Name: new FormControl("", []),
      Registration_Number: new FormControl("", []),
      SST_ID: new FormControl("", []),
    });
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
    // event.component.items = this.filterPorts(this.apps, text);
    event.component.items = this.apps.filter(
      (a) => a.siteCode.toLowerCase().indexOf(text) !== -1
    );
    event.component.endSearch();
  }
  searchItems(event: { component: IonicSelectableComponent; text: string }) {
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
    event.component.items = this.filterPorts(this.items, text);
    event.component.endSearch();
  }

  calculateTotal() {
    this.Advance = 0;

    if (this.Expenses_Type == "ACCOMODATION") {
      // console.log(this.PartnerName.length)
      if (this.PartnerName.length == 0) {
        // var total = (Number.parseFloat(this.Total_Expenses) * Number.parseFloat(this.No_Of_Night)) - Number.parseFloat(this.Advance);
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

  // Drops a photo that was added on this screen and has not been uploaded yet.
  // `images` (the upload list) and `imagesN` (the thumbnails) are filled in
  // step, so the same index refers to the same photo in both.
  removeNewImage(index: number) {
    this.images.splice(index, 1);
    this.imagesN.splice(index, 1);
  }

  // An already-uploaded receipt only disappears once the server has dropped it.
  // Removing it from the list first would make it look deleted while it is
  // still attached to the claim.
  removeExistingImage(index: number) {
    let attachment = this.imagesO[index];

    let confirm = this.alertCtrl.create({
      title: "Remove attachment",
      message: "This photo will be deleted from the claim.",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete",
          handler: () => {
            this.runDelete([attachment]);
          },
        },
      ],
    });
    confirm.present();
  }

  // Deletes one uploaded receipt and takes it off the thumbnail list. Rejects
  // with a message the caller can show; the thumbnail stays put on failure.
  private deleteExistingImage(attachment): Promise<any> {
    return this.storage.get("token").then((val) => {
      return new Promise((resolve, reject) => {
        this.http
          .post(
            SERVER_URL + "/deleteclaimfile?token=" + val.token,
            { Id: attachment.Id },
            httpOptions
          )
          .subscribe(
            (res: any) => {
              if (res != 1) {
                reject(
                  res && res.error
                    ? res.error[0]
                    : "Could not delete the attachment."
                );
                return;
              }

              let at = this.imagesO.indexOf(attachment);
              if (at > -1) {
                this.imagesO.splice(at, 1);
              }
              resolve(attachment);
            },
            (err) => reject(this.describeSubmitError(err))
          );
      });
    });
  }

  private runDelete(attachments) {
    let loading = this.loadingCtrl.create({ content: "Deleting ..." });
    loading.present();

    Promise.all(attachments.map((a) => this.deleteExistingImage(a))).then(
      () => loading.dismiss(),
      (err) => {
        loading.dismiss();
        this.displayErrorAlert(
          typeof err === "string" ? err : "Could not delete the attachment."
        );
      }
    );
  }

  // The trash button clears everything on the card, not just the photos added
  // in this session - leaving the uploaded ones behind made the button look
  // like it had done nothing.
  clearImage() {
    if (!this.images.length && !this.imagesO.length) {
      return;
    }

    let confirm = this.alertCtrl.create({
      title: "Remove all attachments",
      message: "Every photo on this claim will be deleted.",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Delete All",
          handler: () => {
            this.images.length = 0;
            this.imagesN.length = 0;
            if (this.imagesO.length) {
              this.runDelete(this.imagesO.slice());
            }
          },
        },
      ],
    });
    confirm.present();
  }

  getImage() {
    const option2: ImagePickerOptions = {
      outputType: 0,
      // Same 1 MB server body limit applies to gallery picks. See onTakePicture.
      quality: 70,
      width: 1280,
      height: 1280,
    };

    const pick = () => {
      this.imagePicker.getPictures(option2).then(
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
        () => {
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

    // Scope of work
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

  // The label a site row is shown under depends on the level it sits at in the
  // project tree. Shared by the dropdown list and by the preselected value, so
  // the two always read the same.
  private siteCodeLabel(item) {
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
    return item.Option + " - " + siteCode;
  }

  // A project with no site rows stands in for itself, so the dropdown always
  // has something to offer.
  private buildSiteOptions(project) {
    if (!project || typeof project["Site_Code"] === "undefined") {
      return [
        {
          Id: project ? project["Id"] : "",
          siteCode: project ? project["Project_Code"] : "",
        },
      ];
    }

    return project["Site_Code"].map((item) => {
      return { Id: item["Id"], siteCode: this.siteCodeLabel(item) };
    });
  }

  siteCode() {
    this.clearAllDependantOption();
    this.apps = this.buildSiteOptions(this.Project_Code);
  }

  loadData() {
    let data: Observable<any>;
    let data2: Observable<any>;

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojects?token=" +
        val.token  + "&type=claim"
      );
      data.subscribe((result) => {
        console.log(result);
        this.items = result;
        for (let res of result) {
          if (res.Id != this.ProjectId) {
            continue;
          }

          this.Project_Code = res;

          // The Site Code dropdown is only filled when the project changes, so
          // on load it had no items and the saved site had nothing to render
          // against. Build the same list up front and pick the saved site out
          // of it, so the selectable gets an object it recognises.
          this.apps = this.buildSiteOptions(res);
          let saved = this.apps.find((option) => option.Id == this.ProjectId2);
          if (saved) {
            this.Site_Code = saved;
          }
        }
      });

      data = this.http.get(
        SERVER_URL + "/getclaimoption?token=" +
        val.token
      );
      data.subscribe((result) => {
        console.log(result);
        let expenses = new Array();
        for (let res of result) {
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
        // The options arrive after the claim is loaded, so lock the amount now
        // if the claim being edited already uses a fixed-rate type.
        this.isFixedRate = this.hasFixedRate(
          this.decodeEntities(this.Expenses_Type)
        );
      });
      this.http
        .get(SERVER_URL + "/claims/get-outstation-types", {
          params: {
            token: val.token,
          },
        })
        .subscribe((result: any) => {
          this.outstationTypes = result;
        });
    });

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getName?token=" + val.token
      );
      data.subscribe((result) => {
        this.allname = result;
      });
    });

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getPartner/" +
        this.Id +
        "?token=" +
        val.token
      );
      data.subscribe((result) => {
        console.log(result);
        // this.departs = result;
        this.PartnerName = result;
      });
    });

    // Attachments come back for the whole sheet, so keep only the ones stored
    // against this claim line - that is where both newclaim and updateclaim
    // write the photos taken on this page.
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/claimreceipts?token=" +
        val.token +
        "&id=" +
        this.ClaimSheetId
      );
      data.subscribe((result) => {
        let mine = [];
        for (let item of result) {
          if (item.Type == "Claim_Line" && item.TargetId == this.Id) {
            mine.push(item);
            // The Id travels with the thumbnail so a single one can be removed.
            this.imagesO.push({
              Id: item.Id,
              url: SERVER_URL_WITHOUT_API + item.Web_Path,
            });
          }
        }
        this.Web_Path = mine;
      });
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

    if (!this.Remarks) {
      this.displayErrorAlert("Must input remarks");
      return;
    }

    if (this.Expenses_Type == "OWN ACCOMODATION") {
      let a = 150 / this.No_Of_Night;

      if (this.PartnerName.length == 0) {
        this.Total_Expenses = 50 * 1;
      }

      if (this.PartnerName.length == 1) {
        this.Total_Expenses = 50 * 2;
      }

      if (this.PartnerName.length == 2) {
        this.Total_Expenses = 50 * 3;
      }

      if (this.PartnerName.length == 3) {
        this.Total_Expenses = 50 * 3;
      }
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
                    reader.onloadend = function () {
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
          this.formData.append("ClaimSheetId", this.ClaimSheetId);
          this.formData.append("Id", this.Id);
          this.formData.append("Date", this.myFunction(this.Date));
          this.formData.append("No_Of_Night", this.No_Of_Night);
          // this.formData.append("ProjectId", this.Project_Name);
          // this.formData.append("Site_Name", Location_Name);
          this.formData.append("Project_Code", this.Project_Code.Id);
          this.formData.append("Site_Code", this.Site_Code.Id);
          this.formData.append("Site_Name", this.Site_Name);
          this.formData.append("Transport_Type", this.Transport_Type);
          this.formData.append("Depart_From", this.Depart_From);
          this.formData.append("Destination", this.Destination);
          this.formData.append("Mileage", this.Mileage);
          this.formData.append("Expenses_Type", this.Expenses_Type);
          this.formData.append("Code", this.getExpenseCode(this.Expenses_Type));
          this.formData.append("Total_Expenses", this.Total_Expenses);
          this.formData.append("Advance", this.Advance);
          this.formData.append("Total_Amount", this.calculateTotal());
          this.formData.append("Total_Without_GST", this.Total_Without_GST);
          this.formData.append("Remarks", this.Remarks);
          this.formData.append("Scope", "");
          this.formData.append("Docket", this.Docket);
          this.formData.append("TrackerId", this.Project_Code.Id);
          this.formData.append('vendor_id', this.vendor_id.Id);
          this.formData.append('polisting_id', this.polisting_id.Id);
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
          this.formData.append("Trip", this.Trip);
          resolveReady();
        }, rejectReady);
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/updateclaim?token=" +
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
                // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
                this.navCtrl.pop();
                console.log(res);
                loading.dismiss();
                this.toast
                  .show(`Claim updated`, "10000", "center")
                  .subscribe((toast) => { });
              } else if (res == 2) {
                loading.dismiss();
                this.toast
                  .show(`Need to add Attachment`, "50000", "center")
                  .subscribe((toast) => { });
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


  hasFixedRate(Expenses_Type) {
    let rate = this.expenses_rate[Expenses_Type];
    return (
      rate !== null && rate !== undefined && rate !== "" && !isNaN(Number(rate))
    );
  }

  setMandatoryField(Expenses_Type) {
    let data: Observable<any>;

    // Fixed-rate options (e.g. meal allowances) carry their rate in `Extra`.
    // Auto-fill the total from the rate and lock the field; other types stay
    // manual, and only lose the amount when leaving a fixed-rate type.
    if (this.hasFixedRate(Expenses_Type)) {
      this.isFixedRate = true;
      this.Total_Expenses = Number(this.expenses_rate[Expenses_Type]).toFixed(2);
    } else {
      if (this.isFixedRate) {
        this.Total_Expenses = "";
      }
      this.isFixedRate = false;
    }

    let companyNameControl = this.signupform.get("Company_Name");
    let companyNoControl = this.signupform.get("Company_No");
    let sstNoControl = this.signupform.get("SST_No");
    let receiptNoControl = this.signupform.get("Receipt_No");

    let workDescriptionControl = this.signupform.get("Work_Description");
    let carNoControl = this.signupform.get("Car_No");
    let totalExpensesControl = this.signupform.get("Total_Expenses");

    // mileage
    let transportControl = this.signupform.get("Transport_Type");
    let departFromControl = this.signupform.get("Depart_From");
    let destinationControl = this.signupform.get("Destination");
    let mileageControl = this.signupform.get("Mileage");
    console.log(Expenses_Type.toUpperCase());

    // partnername
    let partnerControl = this.signupform.get("PartnerName");

    let noofnightControl = this.signupform.get("No_Of_Night");

    let docketControl = this.signupform.get("Docket");
    let tripControl = this.signupform.get("Trip");
    let polistingControl = this.signupform.get("polisting_id");
    let vendorControl = this.signupform.get("vendor_id");
    // this.hidePartnerName = true;

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

    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/onchange?token=" +
          val.token,
          { Expenses_Type: Expenses_Type },
          httpOptions
        )
        .subscribe((result: any) => {
          console.log(result);
          this.exptype = result.js;
          console.log(this.exptype);

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
    console.log(this.Site_Code)
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
    if (this.firstTime) {
      this.count++;
      if (this.count == 2) {
        this.firstTime = false;
      }
      return false;
    }
    this.polisting_id = null;
    return true;
  }

  clearVendor() {
    if (!this.clearPo()) {
      return false;
    };
    this.vendor_id = null;
    return true;
  }

  clearAllDependantOption() {
    if (!this.clearVendor()) {
      return;
    };
    this.Site_Code = null;
  }

  
}
