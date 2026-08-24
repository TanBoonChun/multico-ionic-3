import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { File } from "@ionic-native/file";
import { FileOpener } from "@ionic-native/file-opener";
import { FileTransfer } from "@ionic-native/file-transfer";
import { Toast } from "@ionic-native/toast";
import { Storage } from "@ionic/storage";
import {
  AlertController,
  IonicPage,
  LoadingController,
  NavController,
  NavParams,
  Platform,
} from "ionic-angular";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";
import { ModalController } from "ionic-angular";
import { GalleryModal } from "ionic-gallery-modal";

declare let cordova: any;

@IonicPage()
@Component({
  selector: "page-order-details",
  templateUrl: "order-details.html",
})
export class OrderDetailsPage {
  public serverUrl = SERVER_URL_WITHOUT_API;
  public id;
  public order;

  public user;
  public remarks;
  public callback;

  public browser;
  public images;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public storage: Storage,
    public loader: LoadingController,
    public alert: AlertController,
    public toast: Toast,
    public fileOpener: FileOpener,
    public fileTransfer: FileTransfer,
    public file: File,
    public platform: Platform,
    public modalCtrl: ModalController
  ) {
    this.id = this.navParams.get("id");
    this.callback = this.navParams.get("callback");
  }

  ionViewDidLoad() {
    let loading = this.loader.create({
      content: "Please wait...",
    });
    loading.present();
    this.loadData(loading, null);
  }

  loadData(loading?, refresher?) {
    Promise.all([this.storage.get("user"), this.storage.get("token")]).then(
      ([user, token]) => {
        this.user = user;
        this.http
          .get(SERVER_URL + "/orders/" + this.id, {
            params: {
              token: token.token,
            },
          })
          .finally(() => loading && loading.dismiss())
          .subscribe((response: any) => {
            if (refresher) {
              refresher.complete();
            }
            this.order = response;
            this.images = response.files
              .filter((file) => {
                return (
                  file.Web_Path.toUpperCase().includes("PNG") ||
                  file.Web_Path.toUpperCase().includes("JPG") ||
                  file.Web_Path.toUpperCase().includes("JPEG")
                );
              })
              .map(function (item) {
                return {
                  url: SERVER_URL_WITHOUT_API + item.Web_Path,
                };
              });
          });
      }
    );
  }
  updateStatus(status) {
    let loader = this.loader.create({
      content: "Please wait...",
    });
    let title = status == "Approved" ? "approve" : "reject";
    let alert = this.alert.create({
      title: "P&L",
      subTitle: "Are you sure you want to " + title + " this pr?",
      buttons: [
        {
          text: "cancel",
          role: "cancel",
          handler: () => {},
        },
        {
          text: title,
          handler: () => {
            loader.present();
            Promise.all([
              this.storage.get("user"),
              this.storage.get("token"),
            ]).then(([user, token]) => {
              this.http
                .put(SERVER_URL + "/orders/update-status", null, {
                  params: {
                    token: token.token,
                    OrderId: this.id,
                    Status: status,
                    comment: this.remarks || "",
                  },
                })
                .finally(() => loader.dismiss())
                .subscribe(
                  (result) => {
                    this.toast
                      .show(status.toUpperCase(), "4000", "center")
                      .subscribe();
                    this.callback().then(() => {
                      this.navCtrl.pop();
                    });
                  },
                  (response) => {
                    let errorAlert = this.alert.create({
                      title: "Error",
                      subTitle: response.error.error,
                      buttons: ["Dismiss"],
                    });
                    errorAlert.present();
                  }
                );
            });
          },
        },
      ],
    });
    alert.present();
  }

  pdf(webPath) {
    let that = this;
    let loading = this.loader.create({
      content: "Please wait...",
    });
    loading.present();
    that.openFile(SERVER_URL_WITHOUT_API + webPath, loading);
  }

  profitPdf(id) {
    let loading = this.loader.create({
      content: "Please wait...",
    });
    loading.present();
    this.storage.get("token").then((value) => {
      this.http
        .get(SERVER_URL + "/profit/" + id + "/export", {
          params: {
            token: value.token,
          },
        })
        .subscribe((res: any) => {
          this.openFile(SERVER_URL_WITHOUT_API + "/" + res, loading);
        });
    });
  }

  openFile(url: string, loading?) {
    let title = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf("."));
    let ext = url.substring(url.lastIndexOf("."));
    let that = this;
    let path = this.file.dataDirectory;
    const transfer = this.fileTransfer.create();
    transfer.download(url, path + title + ext).then((entry) => {
      let url = entry.toURL();
      that.file.resolveLocalFilesystemUrl(url).then((response: any) => {
        response.file(function (file) {
          that.fileOpener
            .open(url, file.type)
            .then(()=>{
              if(loading){
                loading.dismiss();
              }
            })
            .catch((err) => {
              let alert = that.alert.create({
                title: "Error",
                message: "You don`t have any apps that can open this file.",
                buttons: ["Dismiss"],
              });
              alert.present();
            });
        });
      });
    });
    this.browser.close();
  }
  imageGallery() {
    let index = 0;
    let modal = this.modalCtrl.create(GalleryModal, {
      photos: this.images,
      initialSlide: index,
    });
    modal.present();
  }

  doRefresh(refresher) {
    this.loadData(null, refresher);
  }

}
