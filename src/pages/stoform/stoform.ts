import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  ModalController,
  Platform,
  IonicPage,
} from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { DomSanitizer } from "@angular/platform-browser";
import { AlertController } from "ionic-angular";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { File, FileEntry } from "@ionic-native/file";
import { catchError } from "rxjs/operators";

import { Base64 } from "@ionic-native/base64";

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-stoform",
  templateUrl: "stoform.html",
})
export class StoformPage {
  public signupform: FormGroup;
  formData: FormData;
  images = [];
  imagesO = [];
  imagesN = [];

  Purpose: any = "";
  Company_Name: any = "";
  Segment: any = "";
  Ownership: any = "";
  ProjectCode: any = "";
  SiteCode: any = "";
  DocketNo: any = "";
  Warehouse: any = "";
  ToWarehouse: any = "";

  Remark: any = "";

  public hideCompanyName: boolean = false;
  public hideSegment: boolean = false;
  public hideOwnership: boolean = false;
  public hideProjectCode: boolean = false;
  public hideSiteCode: boolean = false;
  public hideDocketNo: boolean = false;
  public hideWarehouse: boolean = false;
  public hideToWarehouse: boolean = false;

  public hideRemark: boolean = false;

  items: any;
  purpose: any;
  company: any;
  segment: any;
  ownership: any;
  projectcode: any;
  sitecode: any;
  docketno: any;
  warehouse: any;
  towarehouse: any;

  remark: any;

  itemarray: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    private modalController: ModalController,
    private camera: Camera,
    private file: File,
    private base64: Base64,
    public platform: Platform
  ) {}

  ionViewDidLoad() {
    this.loadData();
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Purpose: new FormControl("", [Validators.required]),
      Company_Name: new FormControl("", [Validators.required]),
      Segment: new FormControl("", [Validators.required]),
      Ownership: new FormControl("", [Validators.required]),
      ProjectCode: new FormControl("", [Validators.required]),
      SiteCode: new FormControl("", [Validators.required]),
      DocketNo: new FormControl("", []),
      Warehouse: new FormControl("", [Validators.required]),
      ToWarehouse: new FormControl("", []),

      Remark: new FormControl("", []),
    });
  }

  loadData() {
    let data: Observable<any>;
    let loading = this.loadingCtrl.create({
      content: "Please wait, loading data ...",
    });

    loading.present();

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getStock?token=" + val.token
      );
      data.subscribe((result) => {
        this.purpose = result.purpose;
        this.company = result.company;
        this.segment = result.segment;
        this.ownership = result.ownership;
        this.docketno = result.docket;
        this.warehouse = result.warehouse;
        loading.dismiss();
      });
    });

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojects?token=" + val.token + "&type=sto"
      );
      data.subscribe((result) => {
        this.projectcode = result;
      });
    });
  }

  addrow() {
    let modal = this.modalController.create('StoformnewPage', {
      warehouse: this.Warehouse.Id,
      ownership: this.Ownership.Option,
      segment: this.Segment.Option,
    });
    modal.present();

    modal.onDidDismiss((data) => {
      if (data) {
        this.itemarray.push(data);
      }
    });
  }

  edit(index) {
    let modal = this.modalController.create(
      'StoformnewPage',
      this.itemarray[index]
    );
    modal.present();
    modal.onDidDismiss((data) => {
      if (data) {
        this.itemarray[index] = data;
      }
    });
  }

  remove(ele) {
    this.itemarray.splice(ele, 1);
  }

  siteCode() {
    let data: Observable<any>;
    let selectedProjectCode = this.ProjectCode;
    console.log(selectedProjectCode);
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
      this.sitecode = options;
    } else {
      this.sitecode = [
        {
          Id: selectedProjectCode["Id"],
          siteCode: selectedProjectCode["Project_Code"],
        },
      ];
    }
  }

  setMandatoryField(Purpose) {
    let companyNameControl = this.signupform.get("Company_Name");

    switch (Purpose.toUpperCase()) {
      case "STOCK REQUEST":
        companyNameControl.setValidators([Validators.required]);

        this.hideCompanyName = false;
        this.hideSegment = false;
        this.hideDocketNo = false;
        this.hideOwnership = false;
        this.hideProjectCode = false;
        this.hideRemark = false;
        this.hideSegment = false;
        this.hideSiteCode = false;
        this.hideWarehouse = false;
        this.hideToWarehouse = true;

        break;

      case "STOCK ORDER":
        companyNameControl.setValidators([Validators.required]);

        this.hideCompanyName = false;
        this.hideSegment = false;
        this.hideDocketNo = false;
        this.hideOwnership = false;
        this.hideProjectCode = false;
        this.hideRemark = false;
        this.hideSegment = false;
        this.hideSiteCode = false;
        this.hideWarehouse = false;
        this.hideToWarehouse = true;

        break;

      case "STOCK TRANSFER ORDER":
        companyNameControl.setValidators([Validators.required]);

        this.hideCompanyName = false;
        this.hideSegment = false;
        this.hideDocketNo = true;
        this.hideOwnership = false;
        this.hideProjectCode = false;
        this.hideRemark = false;
        this.hideSegment = false;
        this.hideSiteCode = false;
        this.hideWarehouse = false;
        this.hideToWarehouse = false;

        break;

      default:
        companyNameControl.setValidators([Validators.required]);

        this.hideCompanyName = true;
        this.hideSegment = true;
        this.hideDocketNo = true;
        this.hideOwnership = true;
        this.hideProjectCode = true;
        this.hideRemark = true;
        this.hideSegment = true;
        this.hideSiteCode = true;
        this.hideWarehouse = true;
        this.hideToWarehouse = true;
    }

    companyNameControl.updateValueAndValidity();
  }

  decodeEntities(encodedString) {
    var textArea = document.createElement("textarea");
    textArea.innerHTML = encodedString;
    return textArea.value;
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

  submitSTO() {
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

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
                    console.log("now i have a file ob", file.name);
                    console.dir(JSON.stringify(file));
                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                      var imgBlob = new Blob([this.result], {
                        type: file.type,
                      });
                      self.formData.append("attachment[]", imgBlob, file.name);
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
          this.formData.append("Purpose", this.Purpose);
          this.formData.append("Company_Name", this.Company_Name.Id);
          this.formData.append("segment", this.Segment.Option);
          this.formData.append("ownership", this.Ownership.Option);
          this.formData.append("project", this.ProjectCode.Id);
          this.formData.append("SiteCode", this.SiteCode.Id);
          this.formData.append("DocketNo", this.DocketNo.Id);
          this.formData.append("warehouse", this.Warehouse.Id);
          this.formData.append("towarehouse", this.ToWarehouse.Id);
          this.formData.append("remarks", this.Remark);
          this.formData.append("addItem", JSON.stringify(this.itemarray));

          resolveReady();
        });
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/applysto?token=" + val.token,
            this.formData,
            {}
          )
          .pipe(catchError(this.handleError))
          .finally(() => {
            loading.dismiss();
          })
          .subscribe((res: any) => {
            console.log(res);
            if (res == 1) {
              this.navCtrl.pop();

              loading.dismiss();
              this.clearImage();
            } else {
              var obj = res;
              var errormessage = "";
              for (var item in obj) {
                errormessage = obj[item][0];
              }
              loading.dismiss();

              this.displayErrorAlert(errormessage);
            }
          });
      });
    });
  }

  saje() {}

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
        return Observable.throw(
          "An error occured. Try again later. Validation Error"
        );
      }
      return Observable.throw("An error occured. Try again later");
    }
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
}
