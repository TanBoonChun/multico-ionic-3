import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { Toast } from "@ionic-native/toast";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { File } from "@ionic-native/file";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { FileOpener } from "@ionic-native/file-opener";
import { DocumentViewer } from "@ionic-native/document-viewer";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@IonicPage()
@Component({
  selector: "page-advancepaymentdonedet",
  templateUrl: "advancepaymentdonedet.html",
})
export class AdvancepaymentdonedetPage {
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
  attachment: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private platform: Platform,
    private document: DocumentViewer,
    private file: File,
    private transfer: FileTransfer,
    private fileOpener: FileOpener,
    private storage: Storage,
    private toast: Toast,
    public loadingCtrl: LoadingController
  ) {
    this.advanceid = this.navParams.get("Id");
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

    // Leave_Type
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/myadvancedetail2/" +
          this.advanceid +
          "?token=" +
          val.token
      );
      data.subscribe((result) => {
        this.advance = result.advance[0];
        this.advancedetails = result.advancedetails;
        this.user = result.me;
        this.allApprover = result.allApprover;
        this.totalreq = result.totalreq;
        this.partner = result.partner;
        this.attachment = result.myattachment;
      });

      this.http
        .post(
          SERVER_URL + "/notifications/updateadvancepaymentdone?token=" +
            val.token,
          { TargetId: this.advanceid }
        )
        .subscribe((result) => {});
    });
  }

  downloadViewImage(url) {
    var a =
      "https://docs.google.com/gview?embedded=true&url=" +
      SERVER_URL_WITHOUT_API + "/" +
      url;
    window.open(a, "location=yes");
  }

  download(Attachment, FileName) {
    let path = "null";

    if (this.platform.is("ios")) {
      path = this.file.documentsDirectory;
    } else if (this.platform.is("android")) {
      path = this.file.externalApplicationStorageDirectory + "/Download/";
    }

    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer
      .download(SERVER_URL_WITHOUT_API + "/" + Attachment, path + FileName, true)
      .then(
        (entry) => {
          let url = entry.toURL();

          let ext = Attachment.substr(
            Attachment.lastIndexOf(".") + 1
          ).toUpperCase();
          let mime = "";
          if (ext == "PDF") {
            mime = "application/pdf";
          } else if (ext == "DOC") {
            mime = "application/msword";
          } else if (ext == "DOCX") {
            mime =
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
          } else if (ext == "XLS") {
            mime = "application/vnd.ms-excel";
          } else if (ext == "XLSX") {
            mime =
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
          } else if (ext == "PPT") {
            mime = "application/vnd.ms-powerpoint";
          } else if (ext == "PPTX") {
            mime =
              " application/vnd.openxmlformats-officedocument.presentationml.presentation";
          } else if (ext == "PDF") {
            mime = "application/pdf";
          }

          this.fileOpener
            .open(decodeURIComponent(url), mime)
            .then(() => console.log("File is opened"))
            .catch((e) => {
              let alert = this.alertCtrl.create({
                title: JSON.stringify(e),
                subTitle: url,
                buttons: ["Dismiss"],
              });
              alert.present();
            });
        },
        (error) => {
          let alert = this.alertCtrl.create({
            title: "Low low",
            subTitle: JSON.stringify(error),
            buttons: ["Dismiss"],
          });
          alert.present();
        }
      );
  }
}
