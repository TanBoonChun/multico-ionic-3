import { Component, NgZone } from "@angular/core";
import {
  AlertController,
  IonicPage,
  LoadingController,
  ModalController,
  NavController,
  NavParams,
  Platform,
  PopoverController,
  ToastController,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { SERVER_URL } from "../../environment";
import { GlobalProvider } from "../../providers/global/global";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { File, FileEntry } from "@ionic-native/file";
import { DomSanitizer } from "@angular/platform-browser";
import { ImagePicker, ImagePickerOptions } from "@ionic-native/image-picker";
import { Base64 } from "@ionic-native/base64";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { FileChooser } from '@ionic-native/file-chooser';
import { FilePath } from '@ionic-native/file-path'
import { IOSFilePicker } from '@ionic-native/file-picker'
@IonicPage()
@Component({
  selector: "page-task-details",
  templateUrl: "task-details.html",
})
export class TaskDetailsPage {
  public userTaskId;
  public callback;
  public userTask: any;

  public token: any;
  public files = [];
  public images = [];
  public imagesSanitize = [];
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public storage: Storage,
    public http: HttpClient,
    public global: GlobalProvider,
    public alertCtrl: AlertController,
    public loading: LoadingController,
    public modal: ModalController,
    public camera: Camera,
    public file: File,
    public domSanitizer: DomSanitizer,
    public popoverCtrl: PopoverController,
    public imagePicker: ImagePicker,
    public base64: Base64,
    public toast: ToastController,
    public platform: Platform,
    public transfer: FileTransfer,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    private filePicker: IOSFilePicker,
    public zone: NgZone
  ) {
    this.userTaskId = this.navParams.data.user_task_id;
    this.callback = this.navParams.get("callback");
    this.token = this.global.getStorageData().then(([user, token]) => {
      this.token = token.token;
    });
  }

  ionViewDidLoad() {
    let loading = this.loading.create({
      content: "Please wait...",
    });
    loading.present();
    this.getData(loading);
  }

  getData(loading?, refresher?) {
    this.storage.get("token").then((value) => {
      this.http
        .get(SERVER_URL + "/tasks/" + this.userTaskId, {
          params: {
            token: value.token,
          },
        })
        .finally(() => loading && loading.dismiss())
        .timeout(10000)
        .subscribe(
          (result: any) => {
            if (refresher) {
              refresher.complete();
            }
            this.userTask = result;
            this.images = result.task.files
          },
          (error) => {
            if (refresher) {
              refresher.complete();
            }
            if (error.name == "TimeoutError") {
              let alert = this.alertCtrl.create({
                title: "Error",
                subTitle: "Cannot connect to server..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            } else {
              let alert = this.alertCtrl.create({
                title: "Error",
                subTitle: "Something went wrong..Please try again later...",
                buttons: ["Dismiss"],
              });
              alert.present();
            }
          }
        );
    });
  }

  doRefresh(refresher) {
    this.getData(null, refresher);
  }

  updateStatus(status) {
    let that = this;
    if (status == "in-progress") {
      let loading = this.loading.create({
        content: "Please wait...",
      });
      // let modal = this.modal.create("TaskModalPage", {
      //   id: this.userTaskId,
      // });
      // modal.onDidDismiss((data) => {
      //   that.getData();
      //   that.callback(data).then(() => {
      //     that.navCtrl.pop();
      //   });
      // });
      // modal.present();
      loading.present();
      this.http
        .put(SERVER_URL + "/tasks/" + this.userTaskId, {}, {
          params: {
            token: this.token,
            taskStatus: "in-progress",
          },
        })
        .finally(() => loading.dismiss())
        .timeout(10000)
        .subscribe(
          (result) => {
            const toast = this.toast.create({
              message: "Accepted",
              duration: 2000,
              position: 'centeer'
            });
            toast.present();
            this.getData();
            // this.toast.show("Accepted", "2000", "center").subscribe();
          },
          (error) => {
            if (error.name == "TimeoutError") {
              let alert = this.alertCtrl.create({
                title: "Error",
                subTitle: "Cannot connect to server..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            } else {
              let alert = this.alertCtrl.create({
                title: "Error",
                subTitle: "Something went wrong..Please try again later.",
                buttons: ["Dismiss"],
              });
              alert.present();
            }
          }
        );
      return;
    } else if (status == "rejected") {
      let modal = this.modal.create("TaskRejectModalPage", {
        id: this.userTaskId,
      });
      modal.onDidDismiss((data) => {
        that.getData();
        that.callback(data).then(() => {
          that.navCtrl.pop();
        });
      });
      modal.present();
      return;
    } else if (status == "completed") {
      let modal = this.modal.create("TaskCompleteModalPage", {
        id: this.userTaskId,
      });
      modal.onDidDismiss((data) => {
        that.getData();
        that.callback(data).then(() => {
          that.navCtrl.pop();
        });
      });
      modal.present();
    }
    return;
  }

  async onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    };

    await this.camera.getPicture(options).then(
      (imageData) => {
        let filePath = imageData;
        let fileName = filePath.split("/").pop();
        let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        this.uploadFile(imageData);
        // this.file
        //   .readAsDataURL(path, fileName)
        //   .then(async (base64File) => {
        //     let sanitize =
        //       this.domSanitizer.bypassSecurityTrustResourceUrl(base64File);
        //     await 
        //     this.imagesSanitize.push(sanitize);
        //   })
        //   .catch(() => {
        //     console.log("Error reading file");
        //   });
      },
      (err) => {
        this.displayErrorAlert(err);
      }
    );
  }

  selectFile() {
    let self = this;
    if(this.platform.is('ios')){
      this.filePicker.pickFile()
      .then(uri => {
        self.uploadFile('file://'+uri);
      })
      .catch(err => console.log('Error', err));
    }else{
      this.fileChooser.open()
        .then(uri => {
          this.filePath.resolveNativePath(uri).then((nativePath) => {
            self.uploadFile(nativePath, null);
          });  
        })
        .catch(e => console.log(e));
    }
  }
  displayErrorAlert(err) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }

  presentFilePopover(event, id) {
    const popover = this.popoverCtrl.create("FilePopoverPage", {
      Id: id,
    });
    popover.present({
      ev: event,
    });
    popover.onDidDismiss((data) => {
      const findIndex = this.images.findIndex(image => image.Id == data);
      this.images.splice(findIndex, 1);
    })
  }
  async uploadFile(fileUri, sanitize?) {
    let self = this;
    this.file.resolveLocalFilesystemUrl(fileUri).then((entry: FileEntry) => {
      entry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = async function (e) {
          if (file.type.includes('image')) {
            let path = fileUri.substring(0, fileUri.lastIndexOf("/") + 1);
            const base64 = await self.file.readAsDataURL(path, file.name);
            sanitize = self.domSanitizer.bypassSecurityTrustResourceUrl(base64);
          }
          var fileBlob = new Blob([this.result], {
            type: file.type,
          });
          const formData = new FormData();
          formData.append('id', self.navParams.get('Id'));
          formData.append('tasks[]', fileBlob, file.name);
          self.http.post(SERVER_URL + "/files", formData).subscribe(({ data }: any) => {
            self.zone.run(() => self.images.push({ ...data[0], ...{ uri: sanitize } }));
          });
        }
        reader.readAsArrayBuffer(file);
      });
    })
  }
}
