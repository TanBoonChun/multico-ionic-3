import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { ElementRef, ViewChild } from "@angular/core";
import { App, LoadingController } from "ionic-angular";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { File, FileEntry, IFile } from "@ionic-native/file";
import { Base64 } from "@ionic-native/base64";
import { catchError } from "rxjs/operators";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@IonicPage()
@Component({
  selector: "page-advancerejecteddetailsSite",
  templateUrl: "advancerejecteddetailsSite.html",
})
export class AdvancerejecteddetailsSitePage {
  public serverUrl = SERVER_URL_WITHOUT_API;
  images = [];
  imagesO = [];
  imagesN = [];
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
  allApprover: any = [];
  totalreq: any = [];
  partner: any = [];
  myattachment = [];
  formData: FormData;
  Att_Remarks: any = "";
  public signupform: FormGroup;
  ProjectId: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    private file: File,
    public platform: Platform,
    public http: HttpClient,
    private storage: Storage,
    private base64: Base64,
    private toast: Toast,
    public loadingCtrl: LoadingController
  ) {
    this.advanceid = this.navParams.get("Id");
    this.ProjectId = this.navParams.get("ProjectId");
    console.log("advanceid", this.advanceid);
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Att_Remarks: new FormControl("", [Validators.required]),
    });
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
        SERVER_URL + "/myadvancedetail2/" +
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
        this.totalreq = result.totalreq;
        this.partner = result.partner;
        this.myattachment = result.myattachment;

        console.log(this.user);
        console.log("ProjectId", this.advance.ProjectId);
      });

      this.http
        .post(
          SERVER_URL + "/notifications/updateadvancerejected?token=" +
            val.token,
          { TargetId: this.advanceid }
        )
        .subscribe((result) => {});
    });
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

  submit() {
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
          this.formData.append("Att_Remarks", this.Att_Remarks);
          this.formData.append("AdvanceId", this.advanceid);
          this.formData.append("SiteId", "0");
          this.formData.append("ProjectId", this.advance.ProjectId);

          resolveReady();
        });
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/resubmit?token=" + val.token,
            this.formData,
            {}
          )
          .pipe(catchError(this.handleError))
          .finally(() => {
            loading.dismiss();
          })
          .subscribe((res: any) => {
            this.navCtrl.pop();

            loading.dismiss();
            this.clearImage();
          });
      });
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
      return Observable.throw("An error occurred:" + error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
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
}
