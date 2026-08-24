import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  App,
  Platform,
  IonicPage,
} from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { IonicImageLoader } from "ionic-image-loader";
import { File } from "@ionic-native/file";
import { DocumentViewer } from "@ionic-native/document-viewer";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { FileOpener } from "@ionic-native/file-opener";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { SERVER_URL } from "../../environment";
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@IonicPage()
@Component({
  selector: "page-notice",
  templateUrl: "notice.html",
})
export class NoticePage {
  public items: any;
  private token: string = "";
  private Id: any;

  public Title: string;
  public Content: string;
  public Start_Date: string;
  public End_Date: string;
  public Attachment: string;
  public Created_By: string;
  public FileName: string;

  public imageSrc: string;

  noticeBadgeCount: any;
  public notifications: any = [];

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
    private fileOpener: FileOpener
  ) {
    this.Id = this.navParams.get("Id");
    this.Title = this.navParams.get("Title");
    this.Content = this.navParams.get("Content");
    this.Start_Date = this.navParams.get("Start_Date");
    this.End_Date = this.navParams.get("End_Date");
    this.Attachment = this.navParams.get("Attachment");
    this.Created_By = this.navParams.get("Created_By");
    this.FileName = this.navParams.get("FileName");

    this.noticeBadgeCount = 0;
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getnotice?token=" + val.token
      );
      data.subscribe((result) => {
        this.items = result;
      });
    });

    this.storage.get("token").then((val) => {
      this.http
        .get<{ badge_count: any; notifications: any }>(
          SERVER_URL + "/notifications/getnoticebadge?token=" +
            val.token
        )
        .subscribe((result) => {
          let that = this;
          result.notifications.map(function (value) {
            that.notifications[value.TargetId] = value;
            that.http
              .post(
                SERVER_URL + "/notifications/updatenoticebadge?token=" +
                  val.token,
                { TargetId: value.TargetId }
              )
              .subscribe((result) => {});
          });
        });
    });
  }
}
