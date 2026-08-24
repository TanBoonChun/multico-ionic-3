import { Component } from "@angular/core";
import { NavController, App, Platform, IonicPage } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { NavParams } from "ionic-angular";
import { IonicImageLoader } from "ionic-image-loader";
import { File } from "@ionic-native/file";
import { DocumentViewer } from "@ionic-native/document-viewer";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { FileOpener } from "@ionic-native/file-opener";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};
import * as moment from "moment";

import { AndroidPermissions } from "@ionic-native/android-permissions";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";
@IonicPage()
@Component({
  selector: "page-noticedetails",
  templateUrl: "noticedetails.html",
})
export class NoticedetailsPage {
  public serverUrl = SERVER_URL_WITHOUT_API;
  public items: any;
  private token: string = "";
  private Id: any;

  currentdate = new Date();

  public Title: string;
  public Content: string;
  public Start_Date: string;
  public End_Date: string;
  public Attachment: string;
  public Created_By: string;
  public FileName: string;
  public created_at: any = moment().format("H:i:s");
  public imageSrc: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public ionicImageLoader: IonicImageLoader,
    private document: DocumentViewer,
    private file: File,
    private transfer: FileTransfer,
    private platform: Platform,
    private alertCtrl: AlertController,
    private fileOpener: FileOpener,
    private androidPermissions: AndroidPermissions
  ) {
    this.loadData();
    this.Id = this.navParams.get("Id");
    this.Title = this.navParams.get("Title");
    this.Content = this.navParams.get("Content");
    this.Start_Date = this.navParams.get("Start_Date");
    this.End_Date = this.navParams.get("End_Date");
    this.Attachment = this.navParams.get("Attachment");
    this.Created_By = this.navParams.get("Created_By");
    this.FileName = this.navParams.get("FileName");
    this.created_at = this.navParams.get("created_at");
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad NoticedetailsPage");

    this.currentdate = new Date();
    let h = this.currentdate.getHours();
    let m = this.currentdate.getMinutes();
    let s = this.currentdate.getSeconds();

    return h + ":" + m + ":" + s;
  }

  download(Attachment, FileName) {
    let path = "null";

    if (this.platform.is("ios")) {
      path = this.file.documentsDirectory;
    } else if (this.platform.is("android")) {
      // path = this.file.externalRootDirectory +'/Download/';
      // path = this.file.applicationStorageDirectory +'/Download/';
      path = this.file.externalApplicationStorageDirectory + "/Download/";
    }

    // const transfer = this.transfer.create();
    const fileTransfer: FileTransferObject = this.transfer.create();
    fileTransfer
      .download(SERVER_URL_WITHOUT_API + "/" + Attachment, path + FileName, true)
      .then(
        (entry) => {
          let url = entry.toURL();

          // entry.file(function(data) {
          //    // get mime type
          //    var mime = data.type;
          // this.document.viewDocument(url, mime, {});
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

          // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
          //   result => {

          //   },
          //   err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
          // );

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
          // })
        },
        (error) => {
          console.log(error);
          let alert = this.alertCtrl.create({
            title: "Low low",
            subTitle: JSON.stringify(error),
            buttons: ["Dismiss"],
          });
          alert.present();
        }
      );
  }

  loadData() {
    let data: Observable<any>;

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getnotice?token=" + val.token
      );
      data.subscribe((result) => {
        this.items = result;
      });

      // this.http
      //   .post(
      //     SERVER_URL + "/notifications/updatenoticebadge?token=" +
      //       val.token,
      //     { TargetId: this.Id }
      //   )
      //   .subscribe((result) => {
      //     console.log(result);
      //   });
    });
  }
}
