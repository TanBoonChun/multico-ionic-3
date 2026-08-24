import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, ViewController } from 'ionic-angular';
import { ElementRef, ViewChild} from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

import { FormControl, FormGroup, Validators} from '@angular/forms';

/**
 * Generated class for the GoodreturnnoteformitemPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-goodreturnnoteformitem',
  templateUrl: 'goodreturnnoteformitem.html',
})
export class GoodreturnnoteformitemPage {
  public signupform: FormGroup;
  newMaterial:any='';
  newUnit:any='';
  newQuantity:any=''

  constructor(
    private toastCtrl: ToastController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    private viewCtrl: ViewController,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public loadingCtrl: LoadingController) {

      if(this.newMaterial == ""){
        this.newMaterial = '1'
      }
  
      if(this.newUnit == ""){
        this.newUnit = '1'
      }
  
      if(this.newQuantity == ""){
        this.newQuantity = '1'
      }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GoodreturnnoteformitemPage');
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Purpose: new FormControl("", []),

      newMaterial: new FormControl("",[Validators.required]),
      newUnit: new FormControl("", [Validators.required]),
      newQuantity: new FormControl("", [Validators.required]),
    });
  }

  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: 'Exit',
      message: 'Are you sure to exit the page? The items would not be saved',
      buttons: [
        {
          text: 'No',
          handler: () => {
        }
        },
        {
          text: 'Yes',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
      ]
    });
    confirm.present();
  }

  submit() {

    this.storage.get("token").then((val) => {
      let data = {
        newMaterial: this.newMaterial,
        newUnit: this.newUnit,
        newQuantity: this.newQuantity,
      };
      this.viewCtrl.dismiss(data);
    });
  }

}
