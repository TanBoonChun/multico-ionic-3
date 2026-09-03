import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController, Platform, AlertController, App } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation } from '@ionic-native/geolocation';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { File, FileEntry, IFile } from '@ionic-native/file';
import { catchError } from 'rxjs/operators';


import { TimesheetPage } from '../timesheet/timesheet';
import { ReassignPage } from '../reassign/reassign';
import { ReschedulePage } from '../reschedule/reschedule';
import { AttachmentPage } from '../attachment/attachment';
import { ThrowStmt, analyzeAndValidateNgModules } from '@angular/compiler';
import { DealPage } from '../deal/deal';
import { DealdetailsPage } from '../dealdetails/dealdetails';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { CameraOptions,Camera } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64';
// import { CallNumber } from '@ionic-native/call-number';
import { ScheduleupdatePage } from '../scheduleupdate/scheduleupdate';
import { CancelPage } from '../cancel/cancel';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}

/**
 * Generated class for the ScheduledetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-scheduledetails',
  templateUrl: 'scheduledetails.html',
})
export class ScheduledetailsPage {
  public signupform: FormGroup;

  currentDate;
  formattedDate;
  formattedDateObj;
  Date: any='';
  Time: string;
  Latitude_In: any;
  Longitude_In: any;
  Latitude_Out: any;
  Longitude_Out: any;
  Id: any='';
  hideUI: any;
  UserId: any='';
  items: any=[];
  appointment_date: any='';
  // Time: any='';
  ClientId:any='';
  PIC_name:any='';
  PIC_no:any='';
  PIC_Email:any='';
  companyid:any='';
  Title:any='';
  Location:any='';
  assign_to:any='';
  created_by:any='';
  Company_Name:any='';
  remarks:any='';
  UplineId: any='';
  dealId:any;
  Time_In:any;
  Time_Out:any;
  assignTo='ReassignPage';
  reschedule='ReschedulePage';
  gotoDeal='DealdetailsPage';
  assign:any='';
  sched:any=[];
  DealId:any='';
  schedule:any='';
  scheduleId:any='';
  Id2:any='';
  Name:any='';
 Deal_Name:any='';
  dealitem:any='';

  PO_Amount:any='';
  PO_Date:any='';
  PO_No:any='';
  PO_Remarks:any='';
  Quotation_Amount:any='';
  Quotation_Date:any='';
  Quotation_No:any='';
  Quotation_Remarks:any='';
  Remarks:any='';
  Dealid2:any='';

  imageURI:any;
  images = [];
  imagesN = [];
  formData: FormData;
  AssignToName:any;
  Reason:any;

  Project_Name:any='';
  Status:any='';

  constructor(
    public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    private storage: Storage,
    private locationAccuracy: LocationAccuracy,
    public http: HttpClient,
    private toast: Toast,
    public geo: Geolocation,
    private toastCtrl: ToastController,
    public domSanitizer: DomSanitizer,
    private alertCtrl: AlertController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private platform: Platform,
    private file: File,
    // private callNumber: CallNumber,
    private app: App,
    private base64: Base64,
    public navParams: NavParams) {

      this.Id=this.navParams.get('Id')
      this.scheduleId=this.navParams.get('Id')
      this.appointment_date=this.navParams.get('appointment_date')
      this.Time=this.navParams.get('Time')
      this.ClientId=this.navParams.get('ClientId')
      this.PIC_name=this.navParams.get('PIC_name')
      this.PIC_no=this.navParams.get('PIC_no')
      this.PIC_Email=this.navParams.get('PIC_Email')
      this.companyid=this.navParams.get('companyid')
      this.Title=this.navParams.get('Title')
      this.Location=this.navParams.get('Location')
      this.assign_to=this.navParams.get('assign_to')
      this.created_by=this.navParams.get('created_by')
      this.Company_Name=this.navParams.get('Company_Name')
      this.remarks=this.navParams.get('remarks')
      this.UplineId=this.navParams.get('uplineId')
      this.dealId=this.navParams.get('dealid')
      this.DealId=this.navParams.get('DealId')
      this.Id2=this.navParams.get('Id')
      this.Time_In=this.navParams.get('Time_In')
      this.Time_Out=this.navParams.get('Time_Out')
      this.Name=this.navParams.get('Name')
      this.Deal_Name=this.navParams.get('Deal_Name')
      this.Project_Name=this.navParams.get('Project_Name')
      this.PO_Amount=this.navParams.get('PO_Amount')
      this.PO_Date=this.navParams.get('PO_Date')
      this.PO_No=this.navParams.get('PO_No')
      this.PO_Remarks=this.navParams.get('PO_Remarks')
      this.Quotation_Amount=this.navParams.get('Quotation_Amount')
      this.Quotation_Date=this.navParams.get('Quotation_Date')
      this.Quotation_No=this.navParams.get('Quotation_No')
      this.Quotation_Remarks=this.navParams.get('Quotation_Remarks')

      this.Dealid2=this.navParams.get('Dealid2')
      this.AssignToName=this.navParams.get('AssignToName')
      this.Reason=this.navParams.get('reason')
      this.Project_Name=this.navParams.get('Project_Name')
      this.Status=this.navParams.get('status')

      this.sched={Id:this.scheduleId,UplineId:this.UplineId,appointment_date:this.appointment_date,Time:this.Time,ClientId:this.ClientId,PIC_name:this.PIC_name,PIC_no:this.PIC_no,PIC_Email:this.PIC_Email,companyid:this.companyid,Title:this.Title,Location:this.Location,assign_to:this.assign_to,created_by:this.created_by,Company_Name:this.Company_Name,remarks:this.remarks,dealId:this.dealId,DealId:this.DealId,Id2:this.Id2,Dealid2:this.Dealid2};
      console.log(this.Id,'Id')
      console.log(this.ClientId,'clientid')
      console.log(this.DealId,'DealId')
      console.log(this.sched.Id,'sched.id')
      console.log(this.PO_Amount,'PO amo')
      console.log(this.Dealid2,'Dealid2')



      // this.Time = new Date().toISOString();


  }

  ionViewDidLoad() {
    this.loadData();

    console.log('ionViewDidLoad ScheduledetailsPage');
  }

  ngOnInit() {
    this.signupform = new FormGroup({

    Date: new FormControl('', []),
    Latitude_In: new FormControl('', [Validators.required]),
    Longitude_In: new FormControl('', [Validators.required]),
    })

  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      // sourceType: this.camera.PictureSourceType.CAMERA
    }
    
    this.camera.getPicture(options).then((imageData) => {
      // this.image = 'data:image/jpeg;base64,' + imageData;
      // this.images.push(imageData)
      // this.images.push('data:image/jpeg;base64,' +imageData)

      
      // // ****Original****
      
      
      if(this.platform.is('ios')){
        let filePath = imageData
        let fileName = filePath.split('/').pop();
        let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        this.file.readAsDataURL(path, fileName)
        .then(base64File => {
          // console.log("here is encoded image ", base64File)
          // this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
          path = this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))

        })
        .catch(() => {
          console.log('Error reading file');
        })
      }else{
        this.images.push(imageData)
        this.base64.encodeFile(imageData).then((base64File: string) => {
          this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
        }, (err) => {
          console.log(err);
        });
      }
      
      console.log(imageData)
     
    }, (err) => {
    this.displayErrorAlert(err);
    });
  }

  clearImage() {
    this.images.length = 0
    this.imagesN.length = 0
  }
  
  getImage() {
    // // **** Original ****
    const options: ImagePickerOptions = {
      quality: 70,            
      outputType: 0,                  
    }
    if(this.platform.is('ios')){
      this.imagePicker.hasReadPermission().then(res => {
        if (res) {
          this.imagePicker.getPictures({}).then((results) => {
            for (var i = 0; i < results.length; i++) {
              console.log('Image URI: ' + results[i]);          
              this.images.push(results[i])
              this.base64.encodeFile(results[i]).then((base64File: string) => {
                this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
              }, (err) => {
                console.log(err);
              });

              this.images.push('file://'+results[i])
              let filePath = 'file://'+results[i]
              let fileName = filePath.split('/').pop();
              let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

              this.file.readAsDataURL(path, fileName)
              .then(base64File => {
                  // console.log("here is encoded image ", base64File)
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
              })
              .catch(() => {
                console.log('Error reading file');
              });
            }
          }, (err) => { });
        } else {
          this.imagePicker.requestReadPermission().then(res => {
            this.imagePicker.getPictures({}).then((results) => {
              for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]);          
                this.images.push(results[i])
                this.base64.encodeFile(results[i]).then((base64File: string) => {
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
                }, (err) => {
                  console.log(err);
                });

                this.images.push('file://'+results[i])
              let filePath = 'file://'+results[i]
              let fileName = filePath.split('/').pop();
              let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

              this.file.readAsDataURL(path, fileName)
              .then(base64File => {
                  // console.log("here is encoded image ", base64File)
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
              })
              .catch(() => {
                console.log('Error reading file');
              });
              }
            }, (err) => { });
          })
        }
      })
    } else {
      this.imagePicker.hasReadPermission().then(res => {
        if (res) {
          this.imagePicker.getPictures({}).then((results) => {
            for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]);
                this.images.push(results[i])
                this.base64.encodeFile(results[i]).then((base64File: string) => {
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
                }, (err) => {
                  console.log(err);
                });
            }
          }, (err) => { });
        } else {
          this.imagePicker.requestReadPermission().then(res => {
            this.imagePicker.getPictures({}).then((results) => {
              for (var i = 0; i < results.length; i++) {
                  console.log('Image URI: ' + results[i]);
                  this.images.push(results[i])
                  this.base64.encodeFile(results[i]).then((base64File: string) => {
                    this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
                  }, (err) => {
                    console.log(err);
                  });
              }
            }, (err) => { });
          })
        }
      })
    }
  }

  displayErrorAlert(err){
    console.log(err);
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: 'Error while trying to capture picture',
      buttons: ['OK']
    });
    alert.present();
  }

  startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10

    return h + ":" + m ;
  }

  getFormattedDate(){
    var dateObj = new Date()

    var year = dateObj.getFullYear().toString()
    var month = dateObj.getMonth().toString()
    var date = dateObj.getDate().toString()

    var monthArray = ['Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sep','Oct','Nov','Dis']

    this.formattedDate = year + '-' + monthArray[month] + '-' + date;
    this.formattedDateObj = new Date(this.formattedDate)
  }

  calculateTime(offset: any) {
    // create Date object for current location
    let d = new Date();

    // create new Date object for different city
    // using supplied offset
    let nd = new Date(d.getTime() + (3600000 * offset));

    return nd.toISOString();
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

    return day + "-" + monthNames[monthIndex] + "-" + year;
  }

  timesheet() {
    this.navCtrl.push('TimesheetPage');
  }

  reassign() {
    this.navCtrl.push('ReassignPage');
  }

  // reschedule() {
  //   this.navCtrl.push(ReschedulePage,{
  //     Id:this.Id,UplineId:this.UplineId,appointment_date:this.appointment_date,Time:this.Time,ClientId:this.ClientId,PIC_name:this.PIC_name,PIC_no:this.PIC_no,PIC_Email:this.PIC_Email,companyid:this.companyid,Title:this.Title,Location:this.Location,assign_to:this.assign_to,created_by:this.created_by,Company_Name:this.Company_Name,remarks:this.remarks,dealId:this.dealId,DealId:this.DealId,
  //   });
  //   console.log(this.Id)
  // }

  attachment() {
    this.navCtrl.push('AttachmentPage',{
      dealId:this.dealId,
      DealId:this.DealId,
      Title:this.Title,
      Company_Name:this.Company_Name,
      Id:this.sched.Id,
      PO_Amount:this.PO_Amount,
      PO_Date:this.PO_Date,
      PO_No:this.PO_No,
      PO_Remarks:this.PO_Remarks,
      Quotation_Amount:this.Quotation_Amount,
      Quotation_Date:this.Quotation_Date,
      Quotation_No:this.Quotation_No,
      Quotation_Remarks:this.Quotation_Remarks

    });
    console.log(this.Id)
  }

  cancel(){
    this.navCtrl.push('CancelPage',{scheduleId:this.scheduleId});
console.log(this.scheduleId)
  }

  timeIn(){
    let loading = this.loadingCtrl.create({
      content: "Time in...",
      spinner: 'crescent'
    });
    console.log(this.Id,'id')
    console.log(this.sched.Id,'schedid')

    this.storage.get('token').then((val) => {
      loading.present();
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();
        this.images.forEach((i) => {
          console.log('processing '+i);
          var self = this;        
          var def = new Promise((resolve) => {
            this.file.resolveLocalFilesystemUrl(i)
            .then((entry: FileEntry) => {
              entry.file(function(file) {          
                console.log('now i have a file ob', file.name);
                console.dir(JSON.stringify(file));
                var reader = new FileReader();
                reader.onloadend = function(e) {
                  var imgBlob = new Blob([this.result], { type:file.type});
                  self.formData.append('ScheduleIn[]', imgBlob, file.name);
                  resolve(i)
                };
                reader.readAsArrayBuffer(file);           
              }, function(e) {
                console.log('error getting file', e);
              });			
            }, (err) => {
              console.log("Put error message here", JSON.stringify(err));
            })
          });
          defs.push(def)          
        });
    
        Promise.all(defs).then((res) => {
          this.formData.append('Latitude_In', this.Latitude_In);
          this.formData.append('Longitude_In', this.Longitude_In);
          this.formData.append('Date', this.myFunction(new Date));
          this.formData.append('Time_In', this.startTime());
          this.formData.append('a',this.dealId);
          this.formData.append('scheduleId',this.Id2)

          console.log(JSON.stringify(res))
          console.log('all preparation done')
          console.log(this.Latitude_In)
          console.log(this.Longitude_In)
          console.log(this.dealId)
          console.log(this.Id2)
          // this.upload()
          resolveReady();
        })
        
      });
      p.then(() => {
        return this.http.post(SERVER_URL + '/newtimesheet?token=' + val.token, this.formData,
          {})
          .pipe(
            catchError(this.handleError)
          )
          .finally(() => {
            loading.dismiss();
          })
        .subscribe(
          (res: any) =>{
            this.navCtrl.pop();
            loading.dismiss();
  
            // if (isNaN(res)){
            //     this.toast.show(res, '5000', 'center').subscribe(
            //   toast => {
            //     console.log(toast);
            //   }
            // );     
            // return;     
            // }
            // this.storage.set('timeinoffice', true);
            // this.storage.set('timein_idoffice', res);
            // this.hideUI = true;
            // this.Id = res;
            
            this.clearImage();
            this.presentToastIn();
          })
      });
    });

    // this.storage.get('token').then((val) => {
      
    //   loading.present();
    //   return this.http.post('/newtimesheet?token=' + val.token, {
    //     Latitude_In: this.Latitude_In,
    //     Longitude_In: this.Longitude_In,
    //     scheduleId: this.Id2,
    //     a: this.dealId,
    //     Date: this.myFunction(new Date),
    //     Time_In: this.startTime(),
    //   },
    //     httpOptions)
    //   .subscribe(
    //     (res: any) =>{
    //       // this.navCtrl.pop();
    //       loading.dismiss();

    //       if (isNaN(res)){
    //           this.toast.show(res, '5000', 'center').subscribe(
    //         toast => {
    //           console.log(toast);
    //         }
    //       );     
    //       return;     
    //       }
    //       this.storage.set('timeinoffice', true);
    //       this.storage.set('timein_idoffice', res);
    //       this.hideUI = true;
    //       this.Id = res;
    //       // this.sched.Id = res.id;

    //       // this.toast.show(`Time-In success`, '5000', 'center').subscribe(
    //       //   toast => {
    //       //     console.log(toast);
    //       //   }
    //       // );
    //       this.presentToastIn();
    //     }
    //   )
    // });
  }

  timeOut(){
    let loading = this.loadingCtrl.create({
      content: "Time out...",
      spinner: 'crescent'
    });


    this.storage.get('token').then((val) => {
      loading.present();
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();
        this.images.forEach((i) => {
          console.log('processing '+i);
          var self = this;        
          var def = new Promise((resolve) => {
            this.file.resolveLocalFilesystemUrl(i)
            .then((entry: FileEntry) => {
              entry.file(function(file) {          
                console.log('now i have a file ob', file.name);
                console.dir(JSON.stringify(file));
                var reader = new FileReader();
                reader.onloadend = function(e) {
                  var imgBlob = new Blob([this.result], { type:file.type});
                  self.formData.append('ScheduleOut[]', imgBlob, file.name);
                  resolve(i)
                };
                reader.readAsArrayBuffer(file);           
              }, function(e) {
                console.log('error getting file', e);
              });			
            }, (err) => {
              console.log("Put error message here", JSON.stringify(err));
            })
          });
          defs.push(def)          
        });
    
        Promise.all(defs).then((res) => {
          this.formData.append('Latitude_Out', this.Latitude_Out);
          this.formData.append('Longitude_Out', this.Longitude_Out);
          // this.formData.append('Date', this.myFunction(new Date));
          this.formData.append('Time_Out', this.startTime());
          this.formData.append('Id',this.Id);
          this.formData.append('scheduleId',this.Id2)

          console.log(JSON.stringify(res))
          console.log('all preparation done')
          console.log(this.Latitude_Out)
          console.log(this.Longitude_Out)
          console.log(this.Id)
          console.log('scheduleId',this.Id2)
          // this.upload()
          resolveReady();
        })
        
      });
      p.then(() => {

        console.log(' lat out ->',this.Latitude_Out);
        console.log(' long out ->',this.Longitude_Out);
        console.log(' starttime ->',this.startTime());
        // console.log(' remarks2 ->',this.Remarks2);
        console.log(' id ->',this.Id);

        return this.http.post(SERVER_URL + '/timeout2?token=' + val.token, this.formData,
          {})
          .pipe(
            catchError(this.handleError)
          )
          .finally(() => {
            loading.dismiss();
          })
        .subscribe(
          (res: any) =>{
            this.navCtrl.pop();
            // this.storage.set('timeinoffice', false);
            // this.hideUI = false;
            console.log(res)
            // this.toast.show(`Time-Out success`, '5000', 'center').subscribe(
            //   toast => {
            //     console.log(toast);
            //   }
            // );
            loading.dismiss();
            this.presentToastOut();
          })
      });
    });

    // // this.geo.getCurrentPosition({enableHighAccuracy:true}).then( pos => {
    //   this.storage.get('token').then((val) => {
    //     // this.Latitude_Out = pos.coords.latitude;
    //     // this.Longitude_Out = pos.coords.longitude;
    //     loading.present();

    //     console.log(' lat out ->',this.Latitude_Out);
    //     console.log(' long out ->',this.Longitude_Out);
    //     console.log(' starttime ->',this.startTime());
    //     // console.log(' remarks2 ->',this.Remarks2);
    //     console.log(' id ->',this.Id);

    //     return this.http.post('/timeout?token=' + val.token, {
    //       Latitude_Out: this.Latitude_In,
    //       Longitude_Out: this.Longitude_In,
    //       // Remarks: this.Remarks2,
    //       Time_Out: this.startTime(),
    //       scheduleId: this.Id2,
    //       Id: this.Id,
    //     },
    //     httpOptions)
    //     .subscribe(
    //       (res: any) =>{
    //         this.navCtrl.pop();
    //         this.storage.set('timeinoffice', false);
    //         this.hideUI = false;
    //         console.log(res)
    //         // this.toast.show(`Time-Out success`, '5000', 'center').subscribe(
    //         //   toast => {
    //         //     console.log(toast);
    //         //   }
    //         // );
    //         loading.dismiss();
    //         this.presentToastOut();
    //       }
    //     )
    //   });
  }

  presentToastIn() {
    let toast = this.toastCtrl.create({
      message: 'Time-In success',
      position: 'middle',
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: 'green'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();

  }

  presentToastOut() {
    let toast = this.toastCtrl.create({
      message: 'Time-Out success',
      position: 'middle',
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: 'green'
    });
  
    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();

  }

  enableLocation() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        // the accuracy option will be ignored by iOS
        this.locationAccuracy
          .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
          .then(
            () => alert("Location information is on"),
            (error) =>
              alert(
                "Error requesting location permissions" + JSON.stringify(error)
              )
          );
      }
    });
  }

  // loadData(){

  //   // this.storage.get('timein_idoffice').then((val) => {

  //   //   this.Id = val;
  //   // });
  //   // this.storage.get('timeinoffice').then((val) => {

  //   //   // this.hideUI = val;
  //   //   this.sched.Id = val
  //   // });

  //   this.storage.get('user').then((val) => {
  //     // this.Name = val.Name;
  //     // this.DepartmentUser = val.Department;
  //     this.UserId = val.Id;
  //     console.log(this.UserId);
  //   });
  //   let data:Observable<any>;

  //   let loading = this.loadingCtrl.create({
  //     content: "",
  //     spinner: 'crescent'
  //   });
  //   // Or to get a key/value pair
  //   loading.present();
  //   this.storage.get('token').then((val) => {
  //     data = this.http.get(SERVER_URL + '/getTodaySchedule2/'+this.scheduleId+'?token=' + val.token,{
  //       params:{
  //         UserId:this.UserId,
  //       }
  //     } );
  //     data.subscribe(result => {
  //       loading.dismiss();
  //       this.items = result.schedule;
  //       console.log(this.items)
  //       console.log('Title',this.Title)
  //     })
  //   });

  //   // Deal
  //   this.storage.get('token').then((val) => {
  //     data = this.http.get(SERVER_URL + '/getdeal2?token=' + val.token,{
  //       params:{
  //         Id:this.DealId,
  //       }
  //     } );
  //     data.subscribe(result => {
  //       this.dealitem = result;
  //       console.log(this.items)
  //     })
  //   });

   

  //   this.geo.getCurrentPosition().then((pos) => {
  //     this.Latitude_In = pos.coords.latitude;
  //     this.Longitude_In = pos.coords.longitude;
  //     this.Longitude_Out = pos.coords.longitude;
  //     this.Latitude_Out = pos.coords.latitude;
  //   })
  //   .catch((err) => console.log(err));

  // }

  loadData(){
  let data:Observable<any>;

  let loading = this.loadingCtrl.create({
    content: "",
    spinner: 'crescent'
  });
  loading.present();

  this.storage.get('user').then((val) => {
    this.UserId = val.UserId; // fix: Id -> UserId

    this.storage.get('token').then((tokenVal) => {
      data = this.http.get(SERVER_URL + '/getTodaySchedule2/'+this.scheduleId+'?token=' + tokenVal.token,{
        params:{
          UserId: this.UserId,
        }
      });
      data.subscribe(result => {
        loading.dismiss();
        this.items = result['schedule'];
        console.log(this.items);
      });
    });
  });

  // Deal - tak depend on UserId, boleh separate
  this.storage.get('token').then((val) => {
    data = this.http.get(SERVER_URL + '/getdeal2?token=' + val.token,{
      params:{
        Id: this.DealId,
      }
    });
    data.subscribe(result => {
      this.dealitem = result;
    });
  });

  this.geo.getCurrentPosition().then((pos) => {
    this.Latitude_In = pos.coords.latitude;
    this.Longitude_In = pos.coords.longitude;
    this.Longitude_Out = pos.coords.longitude;
    this.Latitude_Out = pos.coords.latitude;
  }).catch((err) => console.log(err));
}

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
        return Observable.throw('An error occurred:' + error.error.message);
    } else {      
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,        
        console.error( 
            `Backend returned code ${JSON.stringify(error)}, ` +
            `body was: ${JSON.stringify(error)}`);
        if (error.status == 422) {
            return Observable.throw('Invalid username or password');
        }
        return Observable.throw('An error occured. Try again later');        
    }   
  }

  // callSupport(): void{
  //   this.callNumber.callNumber(this.PIC_no,true);
  // }

  gotoEdit(){
    const confirm = this.alertCtrl.create({
      title: 'Do you want to update?',
      message: '',
      buttons: [
        {
          text: 'Update',
          handler: () => {
            let nav = this.app.getRootNav();
            nav.push('ScheduleupdatePage',{
              DealId: this.DealId,
              Title: this.Title,
              Date: this.appointment_date,
              Time: this.Time,
              Place: this.Location, 
              Assign: this.assign_to,
              clientid: this.ClientId,
              Reasons: this.Reason,
              uplineid: this.UplineId,
              uplineid2:this.UplineId,
              reasons: this.Remarks,
              oits: this.DealId,   
              Deal_Name: this.dealitem[0].Deal_Name,
              Contact:this.PIC_name,
              scId:this.Id2,
              AssignToName:this.AssignToName,
            })
          }
        },
        {
          text: 'Cancel',
          handler:() => {
            console.log('no clicked')
          }
        }
      ]
    });
    confirm.present();
  }

}
