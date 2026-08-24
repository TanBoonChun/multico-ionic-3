import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, IonicPage } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from './../../providers/auth/auth';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { OneSignal } from '@ionic-native/onesignal';
import { SERVER_URL } from '../../environment';

@IonicPage()

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})

export class LoginPage {

  public credentials: FormGroup;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private auth: AuthProvider,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private storage: Storage,
    private oneSignal: OneSignal,
    public http: HttpClient

  ) {
      this.credentials = this.formBuilder.group({
        StaffId: ['', [Validators.required]],
        Password: ['', Validators.required]
      })
    }


  login() {
    let loading = this.loadingCtrl.create({
      content: "Logging in...",
      spinner: 'crescent'
    });

    loading.present();
    this.auth.authUsingCredentials(this.credentials.value)
    .delay(2000)
    .finally(() => loading.dismiss())
    .subscribe(
      (res: any) =>{
      console.log(res)
      if (res.error) {
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: 'Invalid username or password! Please try again',
          buttons: [{
            text: 'Ok',
            handler: () => {
              console.log('Disagree clicked');
            }
          }]
        });
        alert.present();
        alert.onDidDismiss(() => {
          console.log('dismissed')
        })

        return;
      }
     this.storage.set('token', res);

     this.http.get(SERVER_URL + '/getuser?token=' + res.token)
     .subscribe(result => {
       this.storage.set('user', result);
       this.navCtrl.setRoot('HomePage').then(()=> {
        this.oneSignal.getIds().then(user => {
          this.storage.set('playerid', user.userId);
          this.http.post(SERVER_URL + '/postplayerid?token=' + res.token, { Player_Id: user.userId })
            .subscribe(result => {
              console.log('player id set')
            }, err => {
              console.log(err)
            });
        }).catch(err => console.log(err))
       });
     });


      },
      err => {
        let alert = this.alertCtrl.create({
          title: 'Error!',
          subTitle: 'Invalid username or password! Please try again',
          buttons: [{
            text: 'Ok',
            handler: () => {
              console.log('Disagree clicked');
            }
          }]
        });
        alert.present();
        alert.onDidDismiss(() => {
          console.log('dismissed')
        })
        console.log(err)
      }
    )
  }
}
