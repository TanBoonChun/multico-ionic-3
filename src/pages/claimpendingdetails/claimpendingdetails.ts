import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Platform, Events, IonicPage, ToastController } from 'ionic-angular';
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
  selector: "page-claimpendingdetails",
  templateUrl: "claimpendingdetails.html",
})
export class ClaimpendingdetailsPage {
  claimsubmission = 'ClaimsubmissionPage';
  private ClaimSheetId: any;
  public items: any;
  private token: string = "";
  private id: any;
  public barangs: any;
  public Claim_Sheet_Name: string;
  public Status: string;
  public Total_Amount: any = "0";
  public Total_Advance: any = '0';
  public Total_Payable: any = '0';
  public Claim_Object: any;
  formData: FormData;
  images = [];
  imagesO = [];
  imagesN = [];
  receiptsByClaim: any = {};
  Balance: any;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private imagePicker: ImagePicker,
    private file: File,
    public alertCtrl: AlertController,
    // private toast: Toast,
    public toastCtrl:ToastController,
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
    this.Balance = this.navParams.get("Balance");
  }

  ionViewWillEnter() {
    this.loadData();
  }
  loadData() {

    this.Total_Advance = 0;
    this.Total_Amount = 0;
    this.Total_Payable = 0;
    this.imagesO = [];
    this.receiptsByClaim = {};
    let data: Observable<any>;
    let data2: Observable<any>;

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getclaims2?token=" + val.token + "&id=" + this.id
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

      data2 = this.http.get(
        SERVER_URL + "/claimreceipts?token=" +
        val.token +
        "&id=" +
        this.id
      );
      data2.subscribe((result2) => {
        // Claim_Line files belong to a single claim row, Claim files to the sheet.
        let sheetReceipts = [];
        let byClaim = {};
        for (let item of result2) {
          let url = SERVER_URL_WITHOUT_API + item.Web_Path;
          if (item.Type == "Claim_Line") {
            let key = String(item.TargetId);
            if (!byClaim[key]) {
              byClaim[key] = [];
            }
            byClaim[key].push(url);
          } else {
            sheetReceipts.push(url);
          }
        }
        this.imagesO = sheetReceipts;
        this.receiptsByClaim = byClaim;
      });
    });
  }

  receiptsFor(item) {
    return this.receiptsByClaim[String(item.Id)] || [];
  }

  // onTakePicture() {
  //   const options: CameraOptions = {
  //     quality: 70,
  //     destinationType: this.camera.DestinationType.FILE_URI,
  //     // saveToPhotoAlbum: true,
  //     encodingType: this.camera.EncodingType.JPEG,
  //     mediaType: this.camera.MediaType.PICTURE,
  //     correctOrientation: true,
  //   };

  //   this.camera
  //     .getPicture(options)
  //     .then(
  //       (imageData) => {
  //         // this.image = 'data:image/jpeg/jpg;base64,' + imageData;
  //         this.images.push(imageData);
  //         let filePath = imageData;
  //         let fileName = filePath.split("/").pop();
  //         let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

  //         this.file
  //           .readAsDataURL(path, fileName)
  //           .then((base64File) => {
  //             this.imagesN.push(
  //               this.domSanitizer.bypassSecurityTrustResourceUrl(base64File)
  //             );
  //           })
  //           .catch(() => {
  //           });
  //       },
  //       (err) => {
  //         this.displayErrorAlert(err);
  //       }
  //     )
  //     .then(() => {
  //       this.uploadfile();
  //     });
  // }

  getImage() {
    // // **** Original ****
    const options: ImagePickerOptions = {
      quality: 70,
      outputType: 0,
    };
    if (this.platform.is("ios")) {
      this.imagePicker.hasReadPermission().then((res) => {
        if (res) {
          this.imagePicker
            .getPictures({})
            .then(
              (results) => {
                for (var i = 0; i < results.length; i++) {
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
                      this.imagesN.push(
                        this.domSanitizer.bypassSecurityTrustResourceUrl(
                          base64File
                        )
                      );
                    })
                    .catch(() => {
                    });
                }
              },
              (err) => { }
            )
            .then(() => {
              // this.uploadfile();
            });
        } else {
          this.imagePicker.requestReadPermission().then((res) => {
            this.imagePicker
              .getPictures({})
              .then(
                (results) => {
                  for (var i = 0; i < results.length; i++) {
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
                        this.imagesN.push(
                          this.domSanitizer.bypassSecurityTrustResourceUrl(
                            base64File
                          )
                        );
                      })
                      .catch(() => {
                      });
                  }
                },
                (err) => {
                  this.displayErrorAlert(err);

                }
              )
              .then(() => {
                // this.uploadfile();
              });
          });
        }
      });
    } else {
      this.imagePicker.hasReadPermission().then((res) => {
        if (res) {
          this.imagePicker
            .getPictures({})
            .then(
              (results) => {
                for (var i = 0; i < results.length; i++) {
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
                    }
                  );
                }
              },
              (err) => {
                this.displayErrorAlert(err);
              }
            )
            .then(() => {
              // this.uploadfile();
            });
        } else {
          this.imagePicker.requestReadPermission().then((res) => {
            this.imagePicker
              .getPictures({})
              .then(
                (results) => {
                  for (var i = 0; i < results.length; i++) {
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
                      }
                    );
                  }
                },
                (err) => {
                  this.displayErrorAlert(err);
                }
              )
              .then(() => {
                // this.uploadfile();
              });
          });
        }
      });
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
            const toast = this.toastCtrl.create({
              message: "Claim Submitted",
              duration: 1500,
              position: 'bottom'
            });
            toast.present();
            // this.toast
            //   .show("Claim Submitted", "5000", "center")
            //   .subscribe((toast) => {
            //   });
          } else {
            this.displayErrorAlert("Error on submitting claims.");
          }

        },
          (err) => {
            this.displayErrorAlert(err.error);
          }
        );
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
          const toast = this.toastCtrl.create({
            message: "Claim Recalled",
            duration: 1500,
            position: 'bottom'
          });
          toast.present();
          // this.toast
          //   .show("Claim Recalled", "5000", "center")
          //   .subscribe((toast) => {
          //   });
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
            handler: () => {
              this.navCtrl.push('ClaimeditPage', item)
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
                    const toast = this.toastCtrl.create({
                      message: "Claim deleted",
                      duration: 1500,
                      position: 'bottom'
                    });
                    toast.present();
                    // this.toast
                    //   .show(`Claim deleted`, "3000", "center")
                    //   .subscribe((toast) => {
                    //   });
                  } else {
                    this.displayErrorAlert("Delete operation failed!");
                  }
                });
            },
          },
          {
            text: "Cancel",
            handler: () => {
            },
          },
        ],
      });
      confirm.present();
    });
  }
}
