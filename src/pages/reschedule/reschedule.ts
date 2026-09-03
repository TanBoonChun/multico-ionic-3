import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { catchError } from 'rxjs/operators';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the ReschedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reschedule',
  templateUrl: 'reschedule.html',
})
export class ReschedulePage {

  Title: any='';
  Date: any='';
  Time: any='';
  Place: any='';
  Remarks: any='';
  formData: FormData;
  Assign: any='';
  Reasons: any='';
  Id: any='';
  public signupForm: FormGroup;
  UplineId: any;
  items: any;
  ClientId:any='';
  PIC_name:any='';
  PIC_no:any='';
  PIC_Email:any='';
  companyid:any='';
  Location:any='';
  created_by:any='';
  Company_Name:any='';
  remarks:any='';
  appointment_date: any='';
sched:any='';
aa:any='';
DealId:any;
assign_to:any;
dealId:any;

  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    public navParams: NavParams,
    private toast: ToastController,    
    public http: HttpClient,
    private datePipe: DatePipe,
    public loadingCtrl: LoadingController
    ) {
console.log(this.navParams)
      this.Id=this.navParams.get('Id2');
      this.Date=this.navParams.get('appointment_date')
      this.Time=this.navParams.get('Time')
      // this.Time=moment(this.Time).format('hh:mm A')
      console.log(this.Time);
      this.ClientId=this.navParams.get('ClientId')
      this.PIC_name=this.navParams.get('PIC_name')
      this.PIC_no=this.navParams.get('PIC_no')
      this.PIC_Email=this.navParams.get('PIC_Email')
      this.companyid=this.navParams.get('companyid')
      this.Title=this.navParams.get('Title')
      this.Location=this.navParams.get('Location')
      // this.assign_to=this.navParams.get('assign_to')
      this.created_by=this.navParams.get('created_by')
      this.Company_Name=this.navParams.get('Company_Name')
      this.remarks=this.navParams.get('remarks')
      this.UplineId=this.navParams.get('uplineId')
this.aa=this.navParams.get('Id');

this.sched={Id:this.Id,UplineId:this.UplineId,appointment_date:this.appointment_date,Time:this.Time,ClientId:this.ClientId,PIC_name:this.PIC_name,PIC_no:this.PIC_no,PIC_Email:this.PIC_Email,companyid:this.companyid,Title:this.Title,Location:this.Location,assign_to:this.assign_to,created_by:this.created_by,Company_Name:this.Company_Name,remarks:this.remarks,dealId:this.dealId,DealId:this.DealId};
    // this.Time = this.calculateTime('-4');

    console.log(this.Id)

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReschedulePage');
    console.log(this.ClientId,'clientid')
    console.log(this.Id,'Id')
    console.log(this.sched.Id,'sched.Id')
    console.log(this.aa,'Id aa')


  }
  calculateTime(offset: any) {
    // create Date object for current location
    let d = new Date();

    // create new Date object for different city
    // using supplied offset
    let nd = new Date(d.getTime() + (3600000 * offset));

    return nd.toISOString();
  }

  ngOnInit(){
    this.signupForm = new FormGroup({
      Title: new FormControl('', []),
      Date: new FormControl('', []),
      Time: new FormControl('', []),
      Location: new FormControl('', []),
      Remarks: new FormControl('', []),


    })

  }

  transform(time: any): any {
    // let hour = (time.split(':'))[0]
    // let minu = (time.split(':'))[1]
    // let min = minu.split(" ")[0]      
    // console.log(time) 
    // let part = hour > 12 ? 'PM' : 'AM';
    // min = (min+'').length == 1 ? `0${min}` : min;
    // hour = hour > 12 ? hour - 12 : hour;
    // hour = (hour+'').length == 1 ? `0${hour}` : hour;
    // return `${hour}:${min} ${part}`

    const date = new Date();
    const [hours, minutes] = time.split(':');
    date.setHours(+hours, +minutes);

    // Transform to 'hh:mm a' format
    return this.datePipe.transform(date, 'hh:mm a');
  }

  myTime(time){
    var t = new Date(time);
    var h = t.getHours();
    var m = t.getMinutes();
    var s = t.getSeconds();

    return h + ":" + m + ":" + s ;
  }

  getFormatedTime(dateString){
    var date = new Date(dateString);
    var hours = date.getHours();
    var am_pm = date.getHours() >= 12 ? "PM" : "AM";
    var minutes = date.getMinutes();
    // let time = hours + ":" + minutes + " " + am_pm;
    // return time;
    return hours + ":" + minutes + " " + am_pm;
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

  submit(){
    let loading = this.loadingCtrl.create({
      content: "Submitting reschedule application",
      spinner: 'crescent'
    });
  
    this.storage.get('token').then((val) => {
      loading.present();
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();
        Promise.all(defs).then((res) => {
          this.formData.append('scheduleid',this.Id);
          this.formData.append('clientid',this.ClientId);
          console.log(this.ClientId,'ClientId')
          this.formData.append('title', this.Title);
          console.log(JSON.stringify(this.Title))
          this.formData.append('appointment_date', this.myFunction(this.Date));
          this.formData.append('Time',this.transform(this.Time));
          this.formData.append('remarks', this.Remarks);
          this.formData.append('location', this.Location);
          console.log(JSON.stringify(res))
          console.log('all preparation done')
          // this.upload()
          console.log(this.Time)
          resolveReady();
        })
        
      });
      p.then(() => {
        return this.http.post(SERVER_URL + '/updateschedule?token=' + val.token, this.formData,
          {})
          .pipe(
            // catchError(this.handleError)
          )
          .finally(() => {
            loading.dismiss();
          })
        .subscribe(
          (res: any) =>{                      
            if (res == 1) {
              this.navCtrl.pop();
              let toast = this.toast.create({
                message: "Reschedule Submitted",
                position: "middle",
                closeButtonText: "Ok",
                showCloseButton: true,
                cssClass: "red",
              });

              toast.present();

            } else {
              var obj = res;
              console.log(obj);
              var errormessage ="";

              for (var item in obj) {
                errormessage = obj[item];
                console.log(errormessage);

              }

              let toast = this.toast.create({
                message: errormessage[0],
                position: "middle",
                closeButtonText: "Ok",
                showCloseButton: true,
                cssClass: "red",
              });

              toast.present();
            }
          
        })
      });
      // return this.http.post('/newleave?token=' + val.token, {
      //   Leave_Type: this.Leave_Type,
      //   Leave_Term: this.Leave_Term,
      //   Start_Date: this.myFunction(this.Start_Date),
      //   End_Date: this.myFunction(this.End_Date),
      //   Reason: this.Reason,
      //   ProjectId: this.Department,
      //   Cover_By: '',
      //   Approver: this.Approver},
      //   httpOptions)
      // .subscribe(
      //   (res: any) =>{
      //     this.navCtrl.pop();
      //   console.log(res)
      //   this.toast.show(`New Leave created`, '5000', 'center').subscribe(
      //     toast => {
      //       console.log(toast);
      //     }
      //   );
      // })
    });
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
  };

  cancel(){
    this.navCtrl.pop();
  }

}

