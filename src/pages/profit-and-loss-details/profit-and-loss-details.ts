import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { Storage } from "@ionic/storage";
import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform,
} from "ionic-angular";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";
import { Toast } from "@ionic-native/toast";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { GlobalProvider } from "../../providers/global/global";
import { File } from "@ionic-native/file";
import { FileTransfer } from "@ionic-native/file-transfer";
import { FileOpener } from "@ionic-native/file-opener";
import { GalleryModal } from "ionic-gallery-modal";

declare let cordova: any;

@IonicPage()
@Component({
  selector: "page-profit-and-loss-details",
  templateUrl: "profit-and-loss-details.html",
})
export class ProfitAndLossDetailsPage {
  public serverUrl = SERVER_URL_WITHOUT_API;
  private id: any;

  private pnl;
  private siteCodes;

  private contractors;
  private materialCosts = [];

  private callback;
  public browser;
  public user;
  public remarks: any;
  public clientImages;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    public storage: Storage,
    public iab: InAppBrowser,
    public loader: LoadingController,
    public alert: AlertController,
    public toast: Toast,
    public globalProvider: GlobalProvider,
    public file: File,
    public fileTransfer: FileTransfer,
    public platform: Platform,
    public fileOpener: FileOpener,
    public modalCtrl: ModalController
  ) {
    this.id = this.navParams.get("id");
    this.callback = this.navParams.get("callback");
    this.globalProvider.getStorageData().then(([user]) => {
      this.user = user;
    });
  }

  ionViewDidLoad() {
    this.loadData();
  }

  loadData(refresher?) {
    let loading = this.loader.create({
      content: "Please wait...",
    });
    if (!refresher) {
      loading.present();
    }
    this.storage.get("token").then((val) => {
      this.http
        .get(SERVER_URL + "/profit/" + this.id, {
          params: {
            token: val.token,
          },
        })
        .finally(() => !refresher && loading.dismiss())
        .timeout(20000)
        .subscribe(
          (result: any) => {
            if (refresher) {
              refresher.complete();
            }
            this.pnl = result;
            this.siteCodes = result.pnl_site
              .map((site) => site.siteCode)
              .join("<br>");
            this.materialCosts = result.material_cost.reduce(
              (function (hash) {
                return function (a, b) {
                  (hash[b.project_id2] =
                    hash[b.project_id2] ||
                    a[
                      a.push({ project_id2: b.project_id2, total: 0 }) - 1
                    ]).total += parseFloat(b.total);
                  return a;
                };
              })(Object.create(null)),
              []
            );
            let array = [];
            this.materialCosts.forEach(function (value) {
              array[value.project_id2] = value.total;
            });
            this.materialCosts = array;
            array = [];
            this.contractors = result.contractor.reduce(
              (function (hash) {
                return function (a, b) {
                  (hash[b.project_id2] =
                    hash[b.project_id2] ||
                    a[
                      a.push({ project_id2: b.project_id2, total: 0 }) - 1
                    ]).total += parseFloat(b.total);
                  return a;
                };
              })(Object.create(null)),
              []
            );
            this.contractors.forEach(function (value) {
              array[value.project_id2] = value.total;
            });
            this.contractors = array;

            this.clientImages = result.client_files
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
          },
          (err) => {
            if (refresher) {
              refresher.complete();
            }
            if (err.name == "TimeoutError") {
              let alert = this.alert.create({
                title: "Error",
                subTitle: "Cannot connect to server..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            }
          }
        );
    });
  }

  profitPdf() {
    let loading = this.loader.create({
      content: "Please wait...",
    });
    loading.present();
    this.storage.get("token").then((value) => {
      this.http
        .get(SERVER_URL + "/profit/" + this.id + "/export", {
          params: {
            token: value.token,
          },
        })
        .subscribe((res: any) => {
          this.openFile(SERVER_URL_WITHOUT_API + "/" + res, loading);
        });
    });
  }

  viewPdf(webPath) {
    let that = this;
    let loading = this.loader.create({
      content: "Please wait...",
    });
    loading.present();
    this.openFile( SERVER_URL_WITHOUT_API + webPath, loading);
    // this.browser = this.InAppBrowser.open(
    //   SERVER_URL_WITHOUT_API + webPath,
    //   "_blank",
    //   "beforeload=yes"
    // );
    // console.log(SERVER_URL_WITHOUT_API + webPath);
    // console.log(this.browser);
    // this.browser.addEventListener(
    //   "beforeload",
    //   function (params, callback) {
    //     console.log("test");
    //     this.openFile(params.url, loading);
    //   }
    // );
    // browser.close();
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
            .then(loading.dismiss())
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
    if (this.browser) {
      this.browser.close();
    }
  }

  sum(arr) {
    return arr.reduce(function (a, b) {
      return a + b;
    }, 0);
  }

  updateStatus(status) {
    let loader = this.loader.create({
      content: "Please wait...",
    });
    let title = status == "approved" ? "approve" : "reject";
    let alert = this.alert.create({
      title: "P&L",
      subTitle: "Are you sure you want to " + title + " this pnl?",
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
                .put(
                  SERVER_URL + "/profit/" + this.id + "/update-status",
                  null,
                  {
                    params: {
                      token: token.token,
                      status: status,
                      remarks: this.remarks || "",
                    },
                  }
                )
                .timeout(10000)
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

  doRefresh(refresher) {
    this.loadData(refresher);
  }
  imageGallery() {
    let index = 0;
    let modal = this.modalCtrl.create(GalleryModal, {
      photos: this.clientImages,
      initialSlide: index,
    });
    modal.present();
  }
}
