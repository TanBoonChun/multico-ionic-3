import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, IonicPage } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from './../../providers/auth/auth';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Platform} from 'ionic-angular';
import { AppPreferences } from '@ionic-native/app-preferences';
import { Toast } from '@ionic-native/toast';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

@IonicPage()

@Component({
  selector: 'page-logoutadminpermission',
  templateUrl: 'logoutadminpermission.html',
})

export class LogoutadminpermissionPage {

  public credentials: FormGroup;
  StaffId : any;
  Password : any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private storage: Storage,
    public http: HttpClient,
    private appPreferences: AppPreferences,
    private toast: Toast,
  ) {
      this.credentials = this.formBuilder.group({
        StaffId: ['', [Validators.required]],
        Password: ['', Validators.required]
      })

    }

    login() {
        let loading = this.loadingCtrl.create({
            content: "Logging out...",
            spinner: 'crescent'
        });

        this.storage.get('token').then((val) => {
            return this.http.post(SERVER_URL + '/getadmin?token=' + val.token, {
                StaffID: this.StaffId,
                Password: this.Password,
            },
            httpOptions)
            .subscribe(
            (res: any) =>{
                if (res == 1){
                    this.appPreferences.fetch('os','id').then((playerid) => {
                        loading.present();

                        this.http.post(SERVER_URL + '/clearplayerid?token=' + val.token, {Player_Id: playerid}).finally(()=>{
                          loading.dismiss();

                          Promise.resolve('done');
                        }).subscribe(result => {
                          this.navCtrl.setRoot('LoginPage');

                        }, err => {
                          console.log(JSON.parse(err))
                        })
                      }).then(() => {
                        this.storage.clear();
                      })

                    this.navCtrl.setRoot('LoginPage');
                }
                else{
                    this.toast.show(`Wrong Admin Id and Password`, '5000', 'center').subscribe(
                        toast => {
                        }
                      );
                }
            })
        });
    }
}
