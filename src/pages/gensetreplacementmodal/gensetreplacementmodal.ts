import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController, ActionSheetController, Platform } from 'ionic-angular';
import { Camera,CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';
import { HttpClient } from '@angular/common/http';
import { ImagePicker } from '@ionic-native/image-picker';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GensetreplacementmodalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gensetreplacementmodal',
  templateUrl: 'gensetreplacementmodal.html',
})
export class GensetreplacementmodalPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private camera: Camera,
    private domSanitizer: DomSanitizer,
    private base64: Base64,
    private file: File,
    private alertCtrl: AlertController,
    public platform: Platform,
    private storage: Storage,
    private http: HttpClient,
    private actionsheet:ActionSheetController,
    private imagePicker: ImagePicker,
    private barcode:BarcodeScanner) {
    this.count = this.navParams.get('x');
    this.gensetqr = this.navParams.get('genset')
    this.data = this.navParams.get('data')
    console.log(this.count)
    console.log('genset',this.gensetqr)
    console.log('data',this.data)


  }
  private replaceQr: any;
  private newQr: any;
  private replace_num = 0;
  private new_num: any = 0;
  private count:any;
  viewImg = [];
  details;
  imgfile = [];

  gensetqr:any=''
  data:any=''

  closeModal() {
    console.log(this.details);
    this.viewCtrl.dismiss(this.details);
  }

  submit() {
    const alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Out of Balance",
      buttons:['Ok']
    });

    const alert2 = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Unable to find technician inventory bag",
      buttons:['Ok']
    });

    const alert3 = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Duplicate Item",
      buttons:['Ok']
    });
    this.storage.get('token').then(val => {
      this.http.get(SERVER_URL + '/serviceticket/getItem?token=' + val.token + '&code=' + this.newQr.split(' ')[1]).subscribe(result => {
        if(!result){
          return alert2.present();
        }
        if (parseFloat(this.new_num).toFixed(2) > result['Balance']) {
          alert.present();
          return;
        }

        // let camp;
        // for(let x=0,i=this.data.length;x<i;x++){
        //   if (this.data[x][new].indexOf('new') !== -1) {
        //     camp = this.data[x];
        //     camp = camp.split('id:');
        //     return camp[x];
        //   }
        // }
        // if(camp == this.newQr){

        // }

        
        this.details = {
          row:this.count,
          replace: {
            item: this.replaceQr,
            qty: this.replace_num,
            view: this.viewImg['replace'],
            file:this.imgfile['replace']
          },
          new: {
            item: this.newQr,
            id:result['InvId'],
            qty:this.new_num,
            view: this.viewImg['new'],
            file:this.imgfile['new'],
            model:result['model'],
            capacity:result['capacity'],
            name:result['name']
          }
        };
        this.viewCtrl.dismiss(this.details);
      })
    })

  }

  scanSub: any;
  getItemCode(arr) {
    let temp;
    for (let x = 0, i = arr.length; x < i; x++) {
      if (arr[x].indexOf('Item Code') !== -1) {
        temp = arr[x];
        temp = temp.split(':');
        return temp[1];

      }
    }
  }
  getCode(type) {
    this.barcode.scan().then(data => {
      let temp = data.text.split(/\n/);
      if (type == 'replace')
        this.replaceQr = this.getItemCode(temp);
      else this.newQr=this.getItemCode(temp);
    })
  }
  async takePic(type) {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      // saveToPhotoAlbum: true,
      // sourceType: this.camera.PictureSourceType.CAMERA

    }
    this.camera.getPicture(options).then((imageData) => {
      if(this.platform.is('ios')){
        console.log('AA')
        let filePath = imageData
        console.log('filepath',filePath)
        let fileName = filePath.split('/').pop();
        let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        this.file.readAsDataURL(path, fileName)
        .then(base64File => {
          // console.log("here is encoded image ", base64File)
          path = this.viewImg.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
          console.log('path',path)
        })
        .catch(() => {
          console.log('Error reading file');
        })
      }else{

        this.imgfile[type] = imageData;
        console.log(this.imgfile[type])
        this.base64.encodeFile(imageData).then((base64File: string) => {
          this.viewImg[type]=this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',') + 1))
        }, (err) => {
          console.log(err);
        });
      }
      }, (err) => {

    });
  }

  add(type) {
    if (type == 'replace') {
      this.replace_num += 1;
    } else {
      this.new_num += 1;
    }
  }
  minus(type) {
    if (type == 'replace') {
      if(this.replace_num != 0)
        this.replace_num -= 1;
    } else {
      if(this.new_num != 0)
        this.new_num -= 1;
    }
  }
  gallery(type) {
    // this.imagePicker.getPictures({maximumImagesCount:1}).then(result => {
    //   for (let y = 0, i = result.length; y < i; y++){
    //     this.imgfile[type] = result[y];
    //     this.base64.encodeFile(result[y]).then((base64File: string) => {
    //       this.viewImg[type]=this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',') + 1))
    //     }, (err) => {
    //       console.log(err);
    //     });
    //   }
    // })

    if(this.platform.is('ios')){
      this.imagePicker.hasReadPermission().then(res => {
        if (res) {
          console.log('res',res)
          this.imagePicker.getPictures({}).then((results) => {
            console.log('Result!!',results)
            for (var i = 0; i < results.length; i++) {
              console.log('Image URI: ' + results[i]);          
              // this.images.push(results[i])
              this.base64.encodeFile(results[i]).then((base64File: string) => {
                this.viewImg[type].push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
              }, (err) => {
                console.log(err);
              });

              this.imgfile[type].push('file://'+results[i])
              let filePath = 'file://'+results[i]
              // let filePath = results[i].replace('/private/','');
              // this.toast.show(filePath,'5000','center');

              let fileName = filePath.split('/').pop();
              let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

              // let alert = this.alertCtrl.create({
              //   title: 'file path',
              //   subTitle: filePath,
              //   buttons: ['OK']
              // });
              // alert.present();

              this.file.readAsDataURL(path, fileName)
              .then(base64File => {
                  // console.log("here is encoded image ", base64File)
                  this.viewImg[type].push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
              })
              .catch(() => {
                console.log('Error reading file');
              });
            }
          }, (err) => { console.log('err',err)});
        }else{}
      }
      )} else {
        this.imagePicker.getPictures({}).then(results => {
          for (var i = 0; i < results.length; i++){
            this.imgfile[type] = results[i];
            this.base64.encodeFile(results[i]).then((base64File: string) => {
              this.viewImg[type]=this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',') + 1))
            }, (err) => {
              console.log(err);
            });
          }
        })
      }
  }
  select(type) {
    const action = this.actionsheet.create({
      title: "Select",
      buttons: [
        {
          text: "Gallery",
          handler: () => {
            this.gallery(type);
          }
        }, {
          text: "Take Picture",
          handler: () => {
            this.takePic(type);
          }
        }
      ]
    });
    action.present();
  }
  removeImg(type) {
    this.viewImg[type] = '';
    this.imgfile[type] = '';
  }
}