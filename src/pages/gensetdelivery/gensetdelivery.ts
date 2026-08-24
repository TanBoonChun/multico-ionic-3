import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { ImagePicker } from '@ionic-native/image-picker';
import { Base64 } from '@ionic-native/base64';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera,CameraOptions } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GensetdeliveryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-gensetdelivery',
  templateUrl: 'gensetdelivery.html',
})

export class GensetdeliveryPage {

  private serId: any;
  private serNo: any;
  private imgfile=[];
  private viewImg=[];
  private hide: boolean = false;
  private status: any;
  private type: any;
  private genset: any;
  private id: any;
  private isUser: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams, private action: ActionSheetController, private imagePicker: ImagePicker,
  private base64:Base64,private domSanitizer:DomSanitizer,private camera:Camera,private alert:AlertController,
  private storage:Storage,private http:HttpClient,private toast:Toast) {

  }
  ionViewWillEnter() {
    this.load();
  }
  load() {
    this.id = this.navParams.get('Id');
    this.serNo = this.navParams.get('service_id');
    this.status = this.navParams.get('Status');
    console.log(this.status)
    this.type = this.navParams.get('service_type');
    this.genset = this.navParams.get('genset_no');
    this.serId=this.navParams.get('serviceId');
    if (this.status == 'Repair' || this.status == "Verified" || this.status == "Completed")
      this.hide = true;
    this.isUser = this.navParams.get('user');
  }
  takeCamera(type) {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    this.camera.getPicture(options).then((imageData) => {
      this.imgfile[type] = imageData;
      this.base64.encodeFile(imageData).then((base64File: string) => {
        this.viewImg[type]=this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',') + 1))
      }, (err) => {
        console.log(err);
      });
    }, (err) => {

    });
    console.log(this.viewImg);
  }

  clearImage(type){
    this.viewImg[type] = 0
    this.imgfile[type] = 0
  }
  gallery(type) {
    this.imagePicker.getPictures({maximumImagesCount:1}).then(result => {
      for (let y = 0, i = result.length; y < i; y++){
        this.imgfile[type]= result[y];
        this.base64.encodeFile(result[y]).then((base64File: string) => {
          this.viewImg[type]=this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',') + 1))
        }, (err) => {
          console.log(err);
        });
      }
    })
    console.log(this.imgfile[type]);
  }
  select(type) {
    const act = this.action.create({
      buttons: [
        {
          text: "Gallery",
          handler: () => {
            this.gallery(type);
          }
        },
        {
          text: 'Camera',
          handler: () => {
            this.takeCamera(type);
          }
        }
      ]
    });
    act.present();
  }
  verify(type) {
    if (this.status) {
      this.storage.get('token').then(data => {
        this.http.post(SERVER_URL + '/serviceticket/updateService?token=' + data.token, {
          // token: data.token,
          status: type == "verify" ? 'verify':'repair',
          serId: this.serId,
          id: this.id,
        }).subscribe(result => {
          if (result > 0) {
            if(type == 'complete')
            {
              this.http.post(SERVER_URL + '/serviceticket/replacement?token=' + data.token, {
                data: [
                  {
                    replace: {
                      file: this.imgfile['replace'],
                      view:this.viewImg['replace']
                    },
                    new: {
                      file: this.imgfile['new'],
                      view:this.viewImg['new']
                    }
                  }
                ],
                type: 'Repair',
                id:this.id
              })
              .subscribe(result => {
                console.log(result)
              })
            }
            this.toast.show('Verified', '7000', 'center').subscribe();
            this.navCtrl.pop();
          }
        })
      })
    } else {

    }
  }
  repair(){
    const alert=this.alert.create({
      title:"Cofirmation",
      message:"Are you sure you want to repair this genset?",
      buttons:[
        {
          text:"Cancel",
          role:'cancel'
        },
        {
          text:"Confirm",
          handler:()=>{
            this.storage.get('token').then(val => {

              this.http.post(SERVER_URL + '/serviceticket/updateService?token=' + val.token, {
                id: this.id,
                serId:this.serId,
                status:'repair',
                type: this.type
              },
              {})
                .finally(() => {
                  // loader.dismiss();
                })
              .subscribe(
                (res: any) => {
                  if (res > 0) {
                    this.load();
                    this.toast.show('Success', '5000', 'center').subscribe();
                  } else {
                    this.toast.show('Fail', '5000', 'center').subscribe();
                  }

              })
            })
          }
        }
      ]
    });
    alert.present();
  }
}
