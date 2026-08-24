import { Component } from "@angular/core";
import { NavParams, LoadingController, Platform } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Storage } from "@ionic/storage";
import { File, FileEntry } from "@ionic-native/file";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Base64 } from "@ionic-native/base64";
import { ToastController } from "ionic-angular";
import { SERVER_URL } from "../../environment";
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

@Component({
  selector: "page-safetycheck",
  templateUrl: "safetycheck.html",
})
export class SafetyCheckPage {
  items: any[];
  itemChecked: any = [];
  safetycheck: FormGroup;
  images = [];
  imagesN = [];
  loading: any;
  formData: FormData;
  Id: any;
  item: any[];
  hideUI: any;
  Name: string = "";

  constructor(
    private formB: FormBuilder,
    public alertCtrl: AlertController,
    public platform: Platform,
    private file: File,
    private base64: Base64,
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public http: HttpClient,
    public navParams: NavParams,
    private toastCtrl: ToastController
  ) {
    this.Id = this.navParams.get("Id");
    this.Name = this.navParams.get("Name");
    this.getItem();
    this.itemChecked = [];
    this.getForm();
    this.loadData();
  }

  getItem() {
    this.items = [
      // { id: 1, name: 'Safety Helmet', isChecked : false },
      // { id: 2, name: 'Safety Shoes', isChecked : false },
      // { id: 3, name: 'Safety Harness', isChecked : false },
      // { id: 4, name: 'Respirator', isChecked : false },
      // { id: 5, name: 'Fall Harness Equipment', isChecked : false },
      // { id: 6, name: 'Ear Protection', isChecked : false },
      // { id: 7, name: 'Chemical Resistant Glove', isChecked : false },
      // { id: 8, name: 'Safety Glasses', isChecked : false },
      // { id: 9, name: 'Rubber Glove', isChecked : false },
      { id: 1, name: "Safety shoes", isChecked: false },
      { id: 2, name: "Safety vest", isChecked: false },
      { id: 3, name: "Safety helmet", isChecked: false },
      { id: 4, name: "Safety harness", isChecked: false },
      { id: 5, name: "Safety glove", isChecked: false },
    ];
  }

  loadData() {
    this.storage.get("timein_id").then((val) => {
      this.Id = val;
    });
  }
  getForm() {
    this.safetycheck = this.formB.group({
      item: ["false", Validators.required],
    });
  }

  selectSafety(item) {
    var index = this.itemChecked.indexOf(item);
    if (index === -1) {
      this.itemChecked.push(item);
    } else {
      this.itemChecked.splice(index, 1);
    }
  }

  setSafetyCheck() {
    let safetycheck = {
      TimesheetId: this.Id,
      item: this.itemChecked,
    };
    return safetycheck;
  }

  onSubmit() {
    let loading = this.loadingCtrl.create({
      content: "Submitting Safety Check...",
      spinner: "crescent",
    });

    this.storage.get("token").then((val) => {
      loading.present();
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
          this.formData.append("Id", this.Id);
          for (const key of Object.keys(this.itemChecked)) {
            this.formData.append("Item[" + key + "]", this.itemChecked[key]);
          }
          resolveReady();
        });
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/safetycheck?token=" + val.token,
            this.formData,
            {}
          )
          .subscribe(
            (res: any) => {
              this.storage.set("TimesheetId", res);
              this.hideUI = true;
              this.Id = res;

              loading.dismiss();
              this.clearImage();
              this.safetycheck.reset();
              this.formData = new FormData();
              this.presentToastIn();
            },
            (err) => {
              this.displayErrorAlert(
                "Error. Please make sure you are connected to the network."
              );
              loading.dismiss();
            }
          );
      });
    });
  }

  presentToastIn() {
    let toast = this.toastCtrl.create({
      message: "Safety check success",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "green",
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
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
}
