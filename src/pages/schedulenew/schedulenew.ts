import { Component, ContentChildDecorator } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { SchedulePage } from '../schedule/schedule';
import { IonicSelectableComponent } from 'ionic-selectable';
import { DatePipe } from '@angular/common';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the SchedulenewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-schedulenew',
  templateUrl: 'schedulenew.html',
})
export class SchedulenewPage {

  Date: any='';
  Time: any='';
  Place: any='';
  Remarks: any='';
  
  DealId:string='';
  con:any;
  
  submitted: boolean = false;

  constructor(

    public navCtrl: NavController, 
    private storage: Storage,
    public http: HttpClient,
    private toast: ToastController,    
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private datePipe: DatePipe,
    public navParams: NavParams) {
    this.DealId=this.navParams.get('DealId')
  }

  isFieldValid(fieldName: string): boolean {
    if (!this.submitted) {
      return true;
    }
    
    switch(fieldName) {
      case 'Date':
        return !!this.Date;    
      default:
        return true;
    }
  }
  
  validateForm(): boolean {
    return this.isFieldValid('Date');
  }

  resetForm() {
    this.submitted = false;
    this.Date = '';
    this.Time = '';
    this.Place = '';
    this.Remarks = '';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchedulenewPage');
    let data:Observable<any>;
  }

  calculateTime(offset: any) {
    let d = new Date();

    let nd = new Date(d.getTime() + (3600000 * offset));

    return nd.toISOString();
  }

  transform(time: any): any {

    const date = new Date();
    const [hours, minutes] = time.split(':');
    date.setHours(+hours, +minutes);

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

  submit() {
    this.submitted = true;
    
    if (!this.validateForm()) {
      this.displayErrorAlert("Please fill in all required fields");
      return;
    }
    
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });
    loading.present();
    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/newschedule2?token=' + val.token, {
        dealid: this.DealId,
        appointment_date: this.myFunction(this.Date),
        time: this.Time ? this.transform(this.Time) : null,
        location: this.Place, 
        remarks: this.Remarks,
      },
        httpOptions)
      .subscribe(
        (res: any) =>{
          loading.dismiss();

          if(res==1){

            this.navCtrl.pop();
              let toast = this.toast.create({
                message: "New Appointment Created",
                position: "middle",
                closeButtonText: "Ok",
                showCloseButton: true,
                cssClass: "red",
              });

              toast.present();
          }else{
            var obj = res;
            console.log(obj);
            var errormessage = "";
            for (var item in obj) {
              errormessage = obj[item][0];
            }
            this.displayErrorAlert(errormessage);
                    
          }
      })
    });
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

  cancel(){
    this.resetForm();
    this.navCtrl.pop();
  }

}

