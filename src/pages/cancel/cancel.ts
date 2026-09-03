import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Thumbnail, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the CancelPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-cancel',
  templateUrl: 'cancel.html',
})
export class CancelPage {
  public signupform: FormGroup;

  Reasons:any='';
  scheduleId:any='';

  constructor(public navCtrl: NavController, 
    private storage: Storage,
    public http: HttpClient,
    private toast: ToastController,    
    public navParams: NavParams) {
    this.scheduleId=this.navParams.get('scheduleId');

    console.log(this.scheduleId)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CancelPage');
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      
      Reasons: new FormControl('', [Validators.required]),
    })
  }

 submitCancel() {
  // let loading = this.loadingCtrl.create({
  //   content: "Submitting schedule application",
  //   spinner: 'crescent'
  // });

  this.storage.get('token').then((val) => {
    return this.http.post(SERVER_URL + '/cancelschedule?token=' + val.token, {
      reasons: this.Reasons,
      scheduleId:this.scheduleId
    },
      httpOptions)
    .subscribe(
      (res: any) =>{
        this.navCtrl.pop();
        let toast = this.toast.create({
          message: "Schedule Cancel",
          position: "middle",
          closeButtonText: "Ok",
          showCloseButton: true,
          cssClass: "red",
        });

        toast.present();
    })
  });
}

cancel(){
  this.navCtrl.pop();
}

}

