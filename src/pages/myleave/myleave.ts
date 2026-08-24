import { catchError } from 'rxjs/operators';
import { Component } from '@angular/core';
import { ModalController, IonicPage, NavController, NavParams, normalizeURL } from 'ionic-angular';
import { ElementRef, ViewChild} from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular';
import { Base64 } from '@ionic-native/base64';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { File, FileEntry, IFile } from '@ionic-native/file';
import { LeaveModalPage } from '../leave-modal/leave-modal';
import { Platform } from 'ionic-angular';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

/**
 * Generated class for the MyleavePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-myleave',
  templateUrl: 'myleave.html',
})

export class MyleavePage {

  items: any;
  Leave_Type: any='';
  Leave_Term: any='';
  Start_Date: any='';
  End_Date: any='';
  Reason: any='';
  image: string;
  myphoto: string;
  reason: string;
  types:any;
  terms: any;
  formData: FormData;
  imageURI:any;
  images = [];
  imagesN = [];
  totalDays = 0;
  leaveDaysList = [];
  Leave_Period = [];
  private token: string = '';
  public signupform: FormGroup;
  isSubmitting: boolean = false;



  @ViewChild('myInput') myInput: ElementRef;
  resize() {
      var element = this.myInput['_elementRef'].nativeElement.getElementsByClassName("text-input")[0];
      var scrollHeight = element.scrollHeight;
      element.style.height = scrollHeight + 'px';
      this.myInput['_elementRef'].nativeElement.style.height = (scrollHeight + 16) + 'px';
  }


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private camera: Camera,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,    
    private base64: Base64,
    private imagePicker: ImagePicker,
    private file: File,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public platform: Platform) {
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Leave_Type: new FormControl('', [Validators.required]),
      Start_Date: new FormControl('', [Validators.required]),
      End_Date: new FormControl('', [Validators.required]),
      Reason: new FormControl('', [Validators.required]),
    })
  }

  ionViewWillEnter() {
    this.loadData();
  }

  getLeaveDays() {
    return this.totalDays > 1 ? this.totalDays + " days" : this.totalDays + " day";
  }

  onTakePicture() {
  const options: CameraOptions = {
    quality: 70,
    destinationType: this.camera.DestinationType.FILE_URI,
    // Do NOT set saveToPhotoAlbum: true. The plugin requests
    // WRITE_EXTERNAL_STORAGE before opening the camera, and that permission was
    // removed in Android 13 (API 33) - the request is auto-denied without ever
    // showing a dialog, so getPicture() fails before the camera even opens.
    // Works up to Android 12, breaks on 13+.
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    correctOrientation: true,
    // Full-resolution phone photos are 2-5 MB each; nginx on production rejects
    // the whole multipart POST with 413 once the body passes 1 MB.
    targetWidth: 1280,
    targetHeight: 1280
  }

  this.camera.getPicture(options).then((imageData) => {
      // Reserve the preview slot now so imagesN stays index-aligned with
      // images even though the base64 read below resolves asynchronously.
      const slot = this.images.push(imageData) - 1;
      this.loadPreview(imageData, slot);
    }, (err) => {
      // A plain cancel rejects too - don't dress that up as an error.
      if (this.isUserCancelled(err)) {
        return;
      }
      this.displayErrorAlert('Error while trying to capture picture. ' + this.describeError(err));
    });
  }

  /**
   * Gallery picks go through cordova-plugin-camera, NOT the telerik image
   * picker. The telerik plugin's hasReadPermission() checks
   * READ_EXTERNAL_STORAGE, which this APK can never hold: it targets SDK 35
   * (platforms/android/build.gradle) and that permission is inert on Android
   * 13+ - the request shows no dialog and auto-denies. Worse, its
   * requestReadPermission() calls success() immediately without waiting for the
   * user, so there was no error to report either. Result: every tap on Gallery
   * did nothing at all, forever, with no message.
   *
   * cordova-plugin-camera's PHOTOLIBRARY path asks for READ_MEDIA_IMAGES on
   * API 33+ (see the patched CameraLauncher.java) and reports real errors. The
   * trade-off is one image per tap - it has no multi-select.
   */
  getImage() {
    const options: CameraOptions = {
      quality: 70,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      // Same 1 MB server body limit as onTakePicture. Keeping the scaling on
      // also makes the plugin write a plain file:// copy into app cache rather
      // than handing back a content:// URI we would have to resolve.
      targetWidth: 1280,
      targetHeight: 1280
    }

    this.camera.getPicture(options).then((imageData) => {
      this.addPickedImage(imageData);
    }, (err) => {
      if (this.isUserCancelled(err)) {
        return;
      }
      this.displayErrorAlert('Could not open the gallery. ' + this.describeError(err));
    });
  }

  /**
   * Record one picked photo: once in `images` (what gets uploaded) and once in
   * `imagesN` (the thumbnail). The picker returns bare paths on iOS and
   * already-qualified URIs on Android, so the scheme is only added when missing.
   */
  private addPickedImage(result: string) {
    // The picker can hand back empty/whitespace entries (see the race note in
    // getImage). Drop them here so they never become a blank attachment card.
    if (!result || !result.trim()) {
      return;
    }

    let uri = result.trim();
    if (uri.indexOf('file://') !== 0 && uri.indexOf('content://') !== 0) {
      uri = 'file://' + uri;
    }

    // A bare scheme with no path is another phantom shape.
    if (uri === 'file://' || uri === 'content://') {
      return;
    }

    console.log('Picked URI:', uri);
    // Reserve the slot before the async read so imagesN stays index-aligned
    // with images: the reads below resolve out of order.
    const slot = this.images.push(uri) - 1;
    this.loadPreview(uri, slot);
  }

  /**
   * Build the thumbnail for one attachment, three tiers deep. readAsDataURL
   * often fails on external-storage paths under scoped storage, and the old
   * code just console.log'd that - leaving images populated but imagesN empty,
   * so the template rendered no card and the pick looked like it did nothing.
   */
  private loadPreview(uri: string, slot: number) {
    const fileName = uri.split('/').pop();
    const path = uri.substring(0, uri.lastIndexOf('/') + 1);

    this.file.readAsDataURL(path, fileName).then(
      (base64File) => {
        this.imagesN[slot] = this.domSanitizer.bypassSecurityTrustResourceUrl(base64File);
      },
      () => {
        this.base64.encodeFile(uri).then(
          (base64File: string) => {
            this.imagesN[slot] = this.domSanitizer.bypassSecurityTrustResourceUrl(
              'data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',') + 1)
            );
          },
          () => {
            this.readPreviewViaFileEntry(uri, slot);
          }
        );
      }
    );
  }

  /** Last resort - the only tier that can read a content:// URI. */
  private readPreviewViaFileEntry(uri: string, slot: number) {
    this.file.resolveLocalFilesystemUrl(uri).then(
      (fileEntry: any) => {
        fileEntry.file(
          (f: any) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              this.imagesN[slot] = this.domSanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
            };
            reader.readAsDataURL(f);
          },
          (err) => {
            // Keep the slot so images/imagesN stay aligned for deletePhoto().
            this.imagesN[slot] = null;
            console.log('Could not build a thumbnail for ' + uri, err);
          }
        );
      },
      (err) => {
        this.imagesN[slot] = null;
        console.log('Could not resolve ' + uri, err);
      }
    );
  }

  private isUserCancelled(err): boolean {
    const text = this.describeError(err).toLowerCase();
    return text.indexOf('cancel') > -1 || text.indexOf('no image selected') > -1;
  }

  private describeError(err): string {
    if (err === null || err === undefined) {
      return '';
    }
    if (typeof err === 'string') {
      return err;
    }
    if (err.message) {
      return err.message;
    }
    try {
      return JSON.stringify(err);
    } catch (e) {
      return String(err);
    }
  }

  displayErrorAlert(message){
  console.log(message);
  let alert = this.alertCtrl.create({
    title: 'Error',
    subTitle: this.describeError(message),
    buttons: ['OK']
  });
   alert.present();
  }

  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
       "Jan", "Feb", "Mar",
       "Apr", "May", "Jun", "Jul",
       "Aug", "Sep", "Oct",
       "Nov", "Dec"
     ];
  
     var day = ('0'+ d.getDate()).slice(-2);
     var monthIndex = d.getMonth();
     var year = d.getFullYear();
  
     return day + '-' + monthNames[monthIndex] + '-' + year;
  }

  fetchCalculatedLeaveDays(value) {
    if (this.End_Date != "" && this.Start_Date != "" && this.Leave_Type != "") {
      this.storage.get('token').then((val) => {
        this.Leave_Period.length = 0 //reset array        
        // console.log('http://localhost:8300/api/fetchCalculatedLeaveDays?token=' + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjU2MiwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo4MzAwL2FwaS9sb2dpbiIsImlhdCI6MTUzNjA0Mzg2MSwiZXhwIjoxNjMwNjUxODYxLCJuYmYiOjE1MzYwNDM4NjEsImp0aSI6Ikx3ck9jdUEwMkFwcE9xcnoifQ.PAs9HLy5TALxkFVAegiaCNz_NbXaX6_eRX_zmfl9IvE" + "&Start_Date=" + this.myFunction(this.Start_Date) + "&End_Date=" + this.myFunction(this.End_Date) + "&Leave_Type=" + this.Leave_Type);      
        this.http.get(SERVER_URL + '/fetchCalculatedLeaveDays?token=' + val.token + "&Start_Date=" + this.myFunction(this.Start_Date) + "&End_Date=" + this.myFunction(this.End_Date) + "&Leave_Type=" + this.Leave_Type)
        .subscribe((result : any) => {
          var days = 0;
          this.leaveDaysList = result.list;
          this.totalDays = result.calculated_days;
          if (this.Leave_Type == 'Maternity Leave' || this.Leave_Type == 'Hospitalization Leave') {
            this.leaveDaysList.forEach((l, index) => {
              this.Leave_Period[index] = "Full";  
            });
            this.Leave_Term == "Full"
          } else {
             if (this.Leave_Type != '1 Hour Time Off' && this.Leave_Type != '2 Hours Time Off') {
                this.leaveDaysList.forEach((l, index) => {
                    if (l.Day_Type == 0 || l.Day_Type == 2 || l.Day_Type == -1) {
                      this.Leave_Period[index] = l.Period;
                    } else {
                      this.Leave_Period[index] = "Full";
                    }
                });    
             } else {
               this.leaveDaysList.forEach((l, index) => {
                 if (l.Day_Type == 0 || l.Day_Type == 2 || l.Day_Type == -1) {                   
                 } else {
                   if (this.Leave_Type == '1 Hour Time Off') {
                      days += 0.125;  
                      this.Leave_Period[index] = l.Period;  
                   } else if (this.Leave_Type == '2 Hours Time Off') {
                      days += 0.25;
                      this.Leave_Period[index] = this.Leave_Type == '1 Hour Time Off' ? '1 Hour' : '2 Hours';
                   }
                 }
               }); 
               this.totalDays = days;
               if(this.totalDays >= 1)
               {
                 this.Leave_Term = "Full Day"
               }
             }
          }
          
          console.log(JSON.stringify(result));  
          
        })
      });
    }
  }

  presentLeaveModal() {
    let profileModal = this.modalCtrl.create("LeaveModalPage", {leavelist: this.leaveDaysList, leavetype: this.Leave_Type, Leave_Period: this.Leave_Period});
    profileModal.onDidDismiss(data => {
      this.Leave_Period = data
      var days = 0;
      data.forEach((item, index) => {
        if (item == "Full") {
          days += 1;
        } else if (item == 'AM' || item == 'PM') {
          days += 0.5;
        } else if (item == '1 Hour') {
          days += 0.125;
        } else if (item == '2 Hours') {
          days += 0.25;
        }
      });

      this.totalDays = days;
      console.log(data);
    });
    profileModal.present();
  }
  
  loadData(){

    let data:Observable<any>;

    // Leave_Type
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/getleaveoption?token=' + val.token);
        data.subscribe(result => {
          console.log(result);
          let types = new Array();
          for (let res of result) {
            if(res.Field == 'Leave_Type') {
              types.push(res);
            }
          }
          this.types = types;
        })
    });
  
    // Leave_Term
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/getleaveoption?token=' + val.token);
        data.subscribe(result => {
          console.log(result);
          let terms = new Array();
          for (let res of result) {
            if(res.Field == 'Leave_Term') {
              terms.push(res);
            }
          }
          this.terms = terms;
        })
    });

  }
  
  daysUntilStart(): number {
    if (!this.Start_Date) {
      return 999;
    }
    let start = new Date(this.Start_Date);
    start.setHours(0, 0, 0, 0);
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  applyLeave() {
    // One-week rule: Annual Leave applied less than 7 days before the start date
    // is submitted as Emergency Leave (warn the user first).
    if (this.Leave_Type === 'Annual Leave' && this.daysUntilStart() < 7) {
      let confirm = this.alertCtrl.create({
        title: 'Emergency Leave',
        message: 'You are applying less than 1 week before the start date. ' +
          'This leave will be submitted as <b>Emergency Leave</b> and requires an attachment. Continue?',
        buttons: [
          { text: 'No', role: 'cancel' },
          {
            text: 'Yes',
            handler: () => {
              // Don't assign this.Leave_Type here: ngModelChange would re-run
              // fetchCalculatedLeaveDays and clear Leave_Period mid-submit.
              this.proceedSubmit('Emergency Leave');
            }
          }
        ]
      });
      confirm.present();
      return;
    }

    this.proceedSubmit();
  }

  proceedSubmit(leaveTypeOverride?: string) {
    let leaveType = leaveTypeOverride || this.Leave_Type;
    // Attachment is required for Emergency Leave and Sick Leave
    if ((leaveType === 'Emergency Leave' || leaveType === 'Sick Leave') && this.images.length === 0) {
      let alert = this.alertCtrl.create({
        title: 'Attachment Required',
        subTitle: 'An attachment is required for ' + leaveType + '.',
        buttons: ['OK']
      });
      alert.present();
      return;
    }
    this.submitClaim(leaveType);
  }

  submitClaim(leaveType?: string) {
    leaveType = leaveType || this.Leave_Type;
    if (this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    let loading = this.loadingCtrl.create({
      content: 'Submitting ...'
    });

    // Present once. The old code presented twice and dismissed on a 2s timer,
    // which hid the spinner while the request was still in flight and could
    // leave an orphan overlay behind.
    loading.present();

    this.storage.get('token').then((val) => {
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();
        // Read each attachment into a slot indexed by its position in
        // this.images, then append to formData in that fixed order once every
        // read has settled. The reads themselves still run in parallel - only
        // the append order is pinned. The old code appended straight from each
        // FileReader's onloadend callback, so attachment[] order followed
        // whichever file finished reading first, not the order the user
        // attached them. Since only one attachment ends up displayed
        // server-side, this decided - by a disk-read race - which photo the
        // user actually sees afterwards.
        var self = this;
        var slots: any[] = new Array(this.images.length).fill(null);
        this.images.forEach((i, index) => {
          console.log('processing '+i);
          // Every failure path below MUST resolve. The old code only logged,
          // so a single unreadable attachment left this promise pending
          // forever - Promise.all never settled and the POST was never sent,
          // which read to the user as the submit button doing nothing.
          var def = new Promise((resolve) => {
            this.file.resolveLocalFilesystemUrl(i)
            .then((entry: FileEntry) => {

              entry.file(function(file) {


                console.log('now i have a file ob', file.name);
                console.dir(JSON.stringify(file));
                var reader = new FileReader();
                reader.onloadend = function(e) {
                  slots[index] = { blob: new Blob([this.result], { type:file.type}), name: file.name };
                  resolve(i)
                };
                reader.onerror = function(e) {
                  console.log('error reading file', e);
                  resolve(i)
                };
                reader.readAsArrayBuffer(file);
              }, function(e) {
                console.log('error getting file', e);
                resolve(i)
              });
            }, (err) => {
              console.log("Could not resolve attachment " + i, JSON.stringify(err));
              resolve(i)
            })
          });

          defs.push(def)
        });



        Promise.all(defs).then((res) => {
          slots.forEach((slot) => {
            if (slot) {
              this.formData.append('attachment[]', slot.blob, slot.name);
            }
          });
          this.formData.append('Leave_Type', leaveType);
          console.log(JSON.stringify(this.Leave_Period))
          this.Leave_Period.forEach((item, index) => {
            this.formData.append('Leave_Period['+ index+']', item);  
          });
          this.formData.append('Start_Date', this.myFunction(this.Start_Date));
          this.formData.append('End_Date', this.myFunction(this.End_Date));
          this.formData.append('Reason', this.Reason);
          console.log(JSON.stringify(res))
          console.log('all preparation done')
          // this.upload()
          resolveReady();
        })
        
      });
      p.then(() => {
        return this.http.post(SERVER_URL + '/newleavewithperiod?token=' + val.token, this.formData,
          {})
          .pipe(
            catchError(this.handleError)
          )
          .finally(() => {
            loading.dismiss();
            this.isSubmitting = false;
          })
        .subscribe(
          (res: any) =>{                      
            if (res == 1) {
              console.log(JSON.stringify(res))
              this.toast.show(`Leave application submitted`, '5000', 'center').subscribe(
                toast => {
                  console.log(toast);
                }
              );
              this.navCtrl.pop();

            } else {

                var obj = res;
                var errormessage = obj && obj.error ? obj.error : 'Submission failed. Please try again.';
                if (errormessage instanceof Array) {
                  errormessage = errormessage.join(' ');
                }
                this.toast.show(errormessage, '5000', 'center').subscribe(
                  toast => {
                    console.log(toast);
                  }
                );

            }

        },
        (err) => {
          let alert = this.alertCtrl.create({
            title: 'Submission Failed',
            subTitle: typeof err === 'string' ? err : JSON.stringify(err),
            buttons: ['OK']
          });
          alert.present();
        })
      });
    }, (err) => {
      // The old 2s dismiss timer used to hide this; without it a failed token
      // read would leave the spinner up forever.
      loading.dismiss();
      this.isSubmitting = false;
      this.displayErrorAlert('Could not read your session. Please log in again. ' + this.describeError(err));
    });
  }
  clearImage() {
    this.images.length = 0;
    this.imagesN.length = 0;
  }
  deletePhoto(id) {
    // images holds the native URIs used to build the upload FormData,
    // imagesN the base64 previews. They are index-aligned, so drop both.
    this.images.splice(id, 1);
    this.imagesN.splice(id, 1);
  }
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
        return Observable.throw('An error occurred:' + error.error.message);
    } else {      
        console.error( 
            `Backend returned code ${JSON.stringify(error)}, ` +
            `body was: ${JSON.stringify(error)}`);
        if (error.error && error.error.error) {
            var serverMessage = error.error.error;
            return Observable.throw(typeof serverMessage === 'string' ? serverMessage : JSON.stringify(serverMessage));
        }
        return Observable.throw('An error occured. Try again later');
    }   
  };
}
  