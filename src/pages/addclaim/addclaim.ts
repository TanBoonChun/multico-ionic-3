import { Component } from '@angular/core';
import { ElementRef, ViewChild} from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { NavController, App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
}

import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';


@IonicPage()
@Component({
  selector: 'page-addclaim',
  templateUrl: 'addclaim.html',
})
export class AddclaimPage {

  public items:any;
  private token: string = '';
  public Payment_Month: any = '';
  public Remarks: any = '';
  public signupform: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public loadingCtrl: LoadingController) {
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Payment_Month: new FormControl('', [Validators.required]),
      Remarks: new FormControl('', [Validators.required]),
    })
  }

  ionViewWillEnter() {
    this.loadData();
   }

  loadData(){
    let loading = this.loadingCtrl.create({
      content: "Logging in...",
      spinner: 'crescent'
    });

    var currentYear = (new Date).getFullYear();
    var currentMonth = this.GetMonthName((new Date).getMonth());
    var currentDay = (new Date).getDate();

    var previous = new Date();
    previous.setDate(0);

    var prevMonthYear = previous.getFullYear();
    var prevMonth = this.GetMonthName(previous.getMonth());

    var prev2MonthYear = previous.getFullYear();
    var prev2Month = this.GetMonthName(previous.getMonth()-1);

    if(currentDay < 9){
      this.items = [currentMonth + ' ' + currentYear, prevMonth + ' ' + prevMonthYear, prev2Month + ' ' + prev2MonthYear];
    } else {
      this.items = [currentMonth + ' ' + currentYear, prevMonth + ' ' + prevMonthYear ];
    }

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
        // data = this.http.get(SERVER_URL + '/cutoff?token=' + val.token);
        // data.subscribe(result => {
        //   console.log(result);
        //   this.items = result;
        // })
    });
  }

  GetMonthName(monthNumber) {
    monthNumber = monthNumber < 0 ? 11 : monthNumber;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber];
  }

  submitClaim() {
    let loading = this.loadingCtrl.create({
      content: 'Submitting ...'
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/newclaimsheet?token=' + val.token, { Claim_Sheet_Name: this.Payment_Month, Remarks:this.Remarks}, httpOptions)
      .subscribe(
        (res: any) =>{
          this.navCtrl.pop();

          if (res != 0) {
            this.toast.show(`New Claim created`, '5000', 'center').subscribe(
              toast => {
              }
            );
          } else {
            this.toast.show(`Duplicate date`, '5000', 'center').subscribe(
              toast => {
              }
            );
          }

      })
    });
  }

}
