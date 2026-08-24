import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { Camera,CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { HttpClient } from '@angular/common/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GensetreplacementPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-gensetreplacement',
  templateUrl: 'gensetreplacement.html',
})
export class GensetreplacementPage {

  private id: any;
  private gensetNo: any;
  private model: any;
  private capacity: any;
  public items:any;
  public disablebutton:boolean = false;
  
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private camera: Camera,
    private domSanitizer: DomSanitizer,
    private base64: Base64,
    private storage:Storage,
    private file:File,
    private zone:NgZone,
    public modalCtrl: ModalController,
    private http:HttpClient,
    private barcode: BarcodeScanner,
    private toast:Toast
  ) {
    this.id = this.navParams.get('id');
    this.gensetNo = this.navParams.get('gensetNo');
    console.log(this.gensetNo);
    this.loadData();
  }

  loadData(){
    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/serviceticket/getItemInv?token=' + val.token);
      data.subscribe(result => {
        this.items = result;
      })
    });
  }

  private data: any; //for genset no
  private genset_qr: any;
  private hide: boolean=true;
  private replaceQr: any;
  private newQr: any;
  x = 0;
  modalData = new Array();
  loader = this.loading.create({
    content: "Please wait...",
  });

  imgfile = new Array();
  viewImg = new Array();
  formData: FormData;

  getItemCode(data) {
    let arr = data.split(/\n/);
    let temp,val = '';
    for (let x = 0, i = arr.length; x < i; x++) {
      if (arr[x].indexOf('Item Code') !== -1) {
        temp = arr[x];
        temp = temp.split(':');
        val = temp[1];
      }
    }

    return val.trim();
  }

  addReplacement(){
    let modal=this.modalCtrl.create('GensetreplacementmodalPage',{x:this.x,genset:this.genset_qr,data:this.modalData});
    modal.present();
    modal.onDidDismiss(data => {
      if (data) {
        this.modalData.push(data);
        this.x++;
        console.log(this.modalData)
      }

   })
  }
  getCode() {
    this.barcode.scan().then(data => {
      let scanned = this.getItemCode(data.text);
      if (this.gensetNo == scanned) {
        this.genset_qr = scanned;
        this.hide = false;
      }else{
        const alert = this.alertCtrl.create({
          title: "Error",
          subTitle: "Wrong genset number...",
          buttons:['OK']

        });
        alert.present();
      }
    })
  }
  async takePic(type) {
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
  }
  submit() {
    this.disablebutton = true;
    if (this.modalData.length != 0) {
      this.storage.get('token').then(val => {
        return this.http.post(SERVER_URL + '/serviceticket/replacement?token=' + val.token, { data: this.modalData, id: this.id,type:'Replacement' }, {
        }).subscribe(result => {
          if (result > 0) {
            this.navCtrl.pop();
            this.toast.show('Success', '7000', 'center');
          }
          err => {
            this.disablebutton = false;
            const alert = this.alertCtrl.create({
              title: "Error",
              subTitle:"Something went wrong..",
              buttons:['OK']
            })
            alert.present();
          }
        })
      })
    } else {
      this.disablebutton = false;
      const alert = this.alertCtrl.create({
        title: "Error!",
        subTitle: "Please add replacement.",
        buttons: ['Dimiss']
      });
      alert.present();
    }
  }
  remove(row) {
    const confirm = this.alertCtrl.create({
      title: "Remove",
      message: "Are you sure you want to remove this?",
      buttons: [
        {
          text: "Cancel",
          role:'cancel'
        },
        {
          text: "Yes",
          handler: () => {
            let filter = this.modalData.filter(m => m.row != row);
            this.modalData = filter;
          }
        }
      ]
    })
    confirm.present();
  }

}