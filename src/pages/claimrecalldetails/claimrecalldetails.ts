import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform, Events, IonicPage } from 'ionic-angular';
import { App } from 'ionic-angular';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, IFile } from '@ionic-native/file';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { Toast } from '@ionic-native/toast';
import { Base64 } from '@ionic-native/base64';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';


@IonicPage()
@Component({
  selector: "page-claimrecalldetails",
  templateUrl: "claimrecalldetails.html",
})
export class ClaimrecalldetailsPage {
  claimsubmission = 'ClaimsubmissionPage';
  private ClaimSheetId: any;
  public items: any;
  private token: string = "";
  private id: any;
  public barangs: any;
  public Claim_Sheet_Name: string;
  public Status: string;
  public Total_Amount: any = 0;
  public Total_Advance: any = 0;
  public Total_Payable: any = 0;
  public Claim_Object: any;
  public Total_Expenses: number = 0;
  images = [];
  imagesO = [];
  imagesN = [];
  formData: FormData;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private imagePicker: ImagePicker,
    private file: File,
    public alertCtrl: AlertController,
    private toast: Toast,
    public loadingCtrl: LoadingController,
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    private storage: Storage,
    private base64: Base64,
    public platform: Platform,
    private events: Events
  ) {
    this.id = this.navParams.get("Id");

    this.Claim_Object = { Id: this.id };
    this.ClaimSheetId = this.navParams.get("ClaimSheetId");
    this.Claim_Sheet_Name = this.navParams.get("Claim_Sheet_Name");
    this.Status = this.navParams.get("Status");

    this.Total_Advance = 0;
    this.Total_Amount = 0;
    this.Total_Payable = 0;
    // this.events.subscribe("new-claim", () => {
    //   this.loadData();
    //   console.log("this was called")
    // });
    // this.loadData();
  }

  ionViewWillUnload() {
    this.events.unsubscribe("new-claim");
  }

  ionViewWillEnter() {


    console.log("enterrrrrrrrrrrrrrrrrr");
  }

  ionViewDidEnter() {
    this.loadData();
    console.log("enterrrrrrrrrrr");
  }

  loadData() {

    this.Total_Advance = 0;
    this.Total_Amount = 0;
    this.Total_Payable = 0;
    this.imagesO = [];

    let data: Observable<any>;
    let data2: Observable<any>;

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getclaims2?token="+val.token+"&id="+this.id
      );
      data.subscribe((result) => {
        this.Total_Advance = result.totalAdvanceRequest;

        this.items = result.myclaimdetail;
        for (let item of this.items) {
          this.Total_Amount = Number(
            Number(this.Total_Amount) + Number(item.Total_Expenses)
          ).toFixed(2);
          
        }
        this.Total_Payable = Number(
          Number(this.Total_Amount) - Number(this.Total_Advance)
        ).toFixed(2);

      });
      console.log(
        SERVER_URL + "/claimreceipts?token=" +
          val.token +
          "&id=" +
          this.id
      );
      data2 = this.http.get(
        SERVER_URL + "/claimreceipts?token=" +
          val.token +
          "&id=" +
          this.id
      );
      data2.subscribe((result2) => {
        for (let item of result2) {
          console.log(item);
          this.imagesO.push(SERVER_URL_WITHOUT_API + item.Web_Path);
        }
        console.log(this.imagesO);
      });
    });
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
    };

    this.camera
      .getPicture(options)
      .then(
        (imageData) => {
          // this.image = 'data:image/jpeg/jpg;base64,' + imageData;
          this.images.push(imageData);
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
              throw "Error reading file";
              // console.log("Error reading file");
            });
          // console.log(imageData);
        },
        (err) => {
          throw "Error getting file";
        }
      )
      .then(() => {
        this.uploadfile();
      })
      .catch((err) => this.displayErrorAlert(err));
  }

  getImage() {
    // // **** Original ****
    const options: ImagePickerOptions = {
      quality: 70,
      outputType: 0,
    };
    if (this.platform.is("ios")) {
      this.imagePicker
        .hasReadPermission()
        .then((res) => {
          if (res) {
            this.imagePicker
              .getPictures({})
              .then(
                (results) => {
                  for (var i = 0; i < results.length; i++) {
                    console.log("Image URI: " + results[i]);
                    // this.images.push(results[i]);
                    this.base64.encodeFile(results[i]).then(
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

                    this.images.push("file://" + results[i]);
                    let filePath = "file://" + results[i];
                    let fileName = filePath.split("/").pop();
                    let path = filePath.substring(
                      0,
                      filePath.lastIndexOf("/") + 1
                    );

                    this.file
                      .readAsDataURL(path, fileName)
                      .then((base64File) => {
                        // console.log("here is encoded image ", base64File)
                        this.imagesN.push(
                          this.domSanitizer.bypassSecurityTrustResourceUrl(
                            base64File
                          )
                        );
                      })
                      .catch(() => {
                        console.log("Error reading file");
                      });
                  }
                },
                (err) => {}
              )
              .then(() => {
                this.uploadfile();
              });
          } else {
            this.imagePicker.requestReadPermission().then((res) => {
              this.imagePicker
                .getPictures({})
                .then(
                  (results) => {
                    for (var i = 0; i < results.length; i++) {
                      console.log("Image URI: " + results[i]);
                      this.images.push(results[i]);
                      this.base64.encodeFile(results[i]).then(
                        (base64File: string) => {
                          this.imagesN.push(
                            this.domSanitizer.bypassSecurityTrustResourceUrl(
                              "data:image/jpeg/jpg;base64," +
                                base64File.substring(
                                  base64File.indexOf(",") + 1
                                )
                            )
                          );
                        },
                        (err) => {
                          console.log(err);
                        }
                      );

                      this.images.push("file://" + results[i]);
                      let filePath = "file://" + results[i];
                      let fileName = filePath.split("/").pop();
                      let path = filePath.substring(
                        0,
                        filePath.lastIndexOf("/") + 1
                      );

                      this.file
                        .readAsDataURL(path, fileName)
                        .then((base64File) => {
                          // console.log("here is encoded image ", base64File)
                          this.imagesN.push(
                            this.domSanitizer.bypassSecurityTrustResourceUrl(
                              base64File
                            )
                          );
                        })
                        .catch(() => {
                          console.log("Error reading file");
                        });
                    }
                  },
                  (err) => {}
                )
                .then(() => {
                  this.uploadfile();
                });
            });
          }
        })
        .catch((err) => this.displayErrorAlert(err));
    } else {
      this.imagePicker
        .hasReadPermission()
        .then((res) => {
          if (res) {
            this.imagePicker
              .getPictures({})
              .then(
                (results) => {
                  for (var i = 0; i < results.length; i++) {
                    console.log("Image URI: " + results[i]);
                    this.images.push(results[i]);
                    this.base64.encodeFile(results[i]).then(
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
                (err) => {}
              )
              .then(() => {
                this.uploadfile();
              });
          } else {
            this.imagePicker.requestReadPermission().then((res) => {
              this.imagePicker
                .getPictures({})
                .then(
                  (results) => {
                    for (var i = 0; i < results.length; i++) {
                      console.log("Image URI: " + results[i]);
                      this.images.push(results[i]);
                      this.base64.encodeFile(results[i]).then(
                        (base64File: string) => {
                          this.imagesN.push(
                            this.domSanitizer.bypassSecurityTrustResourceUrl(
                              "data:image/jpeg/jpg;base64," +
                                base64File.substring(
                                  base64File.indexOf(",") + 1
                                )
                            )
                          );
                        },
                        (err) => {
                          console.log(err);
                        }
                      );
                    }
                  },
                  (err) => {}
                )
                .then(() => {
                  this.uploadfile();
                });
            });
          }
        })
        .catch((err) => this.displayErrorAlert(err));
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

  uploadfile() {
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

    this.storage.get("token").then((val) => {
      loading.present();
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
                      self.formData.append("receipt[]", imgBlob, file.name);
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
          resolveReady();
        });
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/claimuploadreceipt?token=" +
              val.token +
              "&ClaimSheetId=" +
              this.id,
            this.formData,
            {}
          )
          .pipe(catchError(this.handleError))
          .finally(() => {
            loading.dismiss();
            this.images.length = 0;
          })
          .subscribe((res: any) => {
            console.log(JSON.stringify(res));
            this.toast
              .show(`Image uploaded`, "5000", "center")
              .subscribe((toast) => {
                console.log(toast);
              });
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
        return Observable.throw("Invalid username or password");
      }
      return Observable.throw("An error occured. Try again later");
    }
  }

  Submit() {
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
      spinner: "crescent",
    });
    var arrid = [];
    this.items.forEach(function (value) {
      arrid.push(value.Id);
    });
    this.storage.get("token").then((val) => {
      loading.present();
      return this.http
        .post(
          SERVER_URL + "/submitforapproval?token=" + val.token,
          {
            ClaimIds: arrid.join(","),
            Id: this.id,
          },
          httpOptions
        )
        .subscribe((res: any) => {
          loading.dismiss();

          if (res == 1) {
            this.events.publish("claim-submitted", []);
            this.navCtrl.pop();
            this.toast
              .show(`Claim Submitted`, "5000", "center")
              .subscribe((toast) => {
                console.log(toast);
              });

          } else {
            this.displayErrorAlert("Error on submitting claims.");
          }
        });
    });
  }

  Recall() {
    let loading = this.loadingCtrl.create({
      content: "Logging in...",
      spinner: "crescent",
    });
    var arrid = [];
    this.items.forEach(function (value) {
      arrid.push(value.Id);
    });
    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/submitforapproval?token=" + val.token,
          {
            // ClaimIds : arrid.join(','),
            Id: this.id,
          },
          httpOptions
        )
        .subscribe((res: any) => {
          this.navCtrl.pop();
          console.log(res);
          this.toast
            .show(`Claim Recalled`, "5000", "center")
            .subscribe((toast) => {
              console.log(toast);
            });
        });
    });
  }

  gotoEdit(index, item) {
    this.storage.get("token").then((val) => {
      const confirm = this.alertCtrl.create({
        title: "Claim",
        message: "Click for button you want to pick",
        buttons: [
          {
            text: "Edit",
            handler: ()=>{
              this.navCtrl.push('ClaimeditPage',item)
              console.log(item)
            },

          },
          {
            text: "Delete",
            handler: () => {
              this.http
                .post(
                  SERVER_URL + "/deleteclaim?token=" + val.token,
                  {
                    ClaimId: item.Id,
                  },
                  httpOptions
                )
                .subscribe((res) => {
                  if (res == 1) {
                    // this.loadData();
                    this.items.splice(index, 1);

                    this.toast
                      .show(`Claim deleted`, "3000", "center")
                      .subscribe((toast) => {
                        // console.log(toast);
                      });
                  } else {
                    this.displayErrorAlert("Delete operation failed!");
                  }
                });
            },
          },
          {
            text: "Cancel",
            handler: () => {
              // console.log("no clicked");
            },
          },
        ],
      });
      confirm.present();
    });
  }
}
