import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, LoadingController, AlertController, ActionSheetController } from 'ionic-angular';
import { Camera,CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Platform } from 'ionic-angular/platform/platform';
import { ImagePicker } from '@ionic-native/image-picker';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Observable } from 'rxjs/Observable';
import { empty } from 'rxjs/Observer';
import { File, FileEntry } from '@ionic-native/file';
import { SERVER_URL } from '../../environment';

@IonicPage()
@Component({
  selector: 'page-replacementitemmodal',
  templateUrl: 'replacementitemmodal.html',
})
export class ReplacementitemmodalPage {

  OldCondition:any=''
  NewCondition:any=''
  a:any=''
  NoSN:any=''
  ItemCodeN:any=''

  type:any=''
  items:any=''

  public form = [
    { val: 'n/a', isChecked: false }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private camera: Camera,
    private domSanitizer: DomSanitizer,
    private base64: Base64,
    private alertCtrl: AlertController,
    private storage: Storage,
    private file:File,
    private http: HttpClient,
    private actionsheet:ActionSheetController,
    private imagePicker: ImagePicker,
    private platform:Platform,
    private barcode:BarcodeScanner) {
    this.count = this.navParams.get('x');
    let data:Observable<any>;
      this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/techbag?token=' + val.token );
        data.subscribe(result => {
          this.items = result;
        })
      });


  }
  private replaceQr: any;
  private newQr: any;
  private replace_num = 0;
  private new_num: any = 0;
  private count:any;
  viewImg = [];
  details;
  imgfile = [];


  closeModal() {
    this.viewCtrl.dismiss(this.details);
  }

  onChange($event){
    var status = $event
    this.type = status  
  }

  test(){
    console.log(this.form[0].val)
  }

  submit() {
    const alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Out of Balance",
      buttons:['Ok']
    });

    const alert2 = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Unable to find in technician inventory bag",
      buttons:['Ok']
    });

    const alert3 = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Must insert condition",
      buttons:['Ok']
    });

    const alert4 = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Must insert picture",
      buttons:['Ok']
    });
    if(this.type == 1 || this.type == 2){

      this.storage.get('token').then(val => {
        this.http.get(SERVER_URL + '/techbag2/'+this.newQr
        +'?token=' + val.token).subscribe(result => {
        console.log('condition',this.NewCondition);
        console.log('result',result);
        
        this.a = result
          if(!this.a[0]){
            return alert2.present();
          }
          if (parseFloat(this.new_num).toFixed(2) > this.a[0].Qty) {
            alert.present();
            return;
          }
          if(!this.NewCondition){
            return alert3.present();
          }

          if(this.replace_num && !this.imgfile['replace']){
            return alert4.present();
          }

          if(this.new_num && !this.imgfile['new']){
            return alert4.present();
          }

          if(this.replaceQr){
            this.details = {
              row:this.count,
              replace: {
                item: this.replaceQr,
                qty: this.replace_num,
                view: this.viewImg['replace'],
                file:this.imgfile['replace'],
                condition:this.OldCondition,
                remarks:'Old Item From Site'
              },
              new: {
                item: this.newQr,
                id:this.a[0].SnId,
                qty:this.new_num,
                view: this.viewImg['new'],
                file:this.imgfile['new'],
                model:this.a[0].Item_Code,
                capacity:result['capacity'],
                name:this.a[0].Part_Name,
                condition:this.NewCondition,
                SnId:this.a[0].SnId,
                remarks:'New Item To Site',
                InvId:this.a[0].InvId
    
              }
            };
          }

          if(!this.replaceQr){
            this.details = {
              row:this.count,
              replace: {
                item: this.form[0].val,
                qty: this.replace_num,
                view: this.viewImg['replace'],
                file:this.imgfile['replace'],
                condition:this.OldCondition,
                remarks:'Old Item From Site'
              },
              new: {
                item: this.newQr,
                id:this.a[0].SnId,
                qty:this.new_num,
                view: this.viewImg['new'],
                file:this.imgfile['new'],
                model:this.a[0].Item_Code,
                capacity:result['capacity'],
                name:this.a[0].Part_Name,
                condition:this.NewCondition,
                SnId:this.a[0].SnId,
                remarks:'New Item To Site',
                InvId:this.a[0].InvId
              }
            };
          }
          
          this.viewCtrl.dismiss(this.details);
        })
      })
    }
    
    if(this.type == 3){
      this.storage.get('token').then(val => {
        this.http.get(SERVER_URL + '/techbag2nosn/'+this.ItemCodeN
        +'?token=' + val.token).subscribe(result => {
        console.log('condition',this.NewCondition);
        console.log('result',result);
        
        this.a = result
        console.log('pn',this.a);
          if(!this.a[0]){
            return alert2.present();
          }
          if (parseFloat(this.new_num).toFixed(2) > this.a.Qty) {
            alert.present();
            return;
          }
          if(!this.NewCondition){
            return alert3.present();
          }

          
          
          this.details = {
            row:this.count,
            replace: {
              item: this.ItemCodeN,
              qty: this.replace_num,
              view: this.viewImg['replace'],
              file:this.imgfile['replace'],
              condition:this.OldCondition,
              remarks:'Old Item From Site'
            },
            new: {
              item: this.a[0].Serial_No,
              id:this.a[0].Id,
              qty:this.new_num,
              view: this.viewImg['new'],
              file:this.imgfile['new'],
              model:this.a[0].Item_Code,
              capacity:result['capacity'],
              name:this.a[0].Part_Name,
              condition:this.NewCondition,
              SnId:this.a[0].SnId,
              remarks:'New Item To Site',
              InvId:this.a[0].InvId
              
            }
          };
          this.viewCtrl.dismiss(this.details);
        })
      })
    }

  }

  scanSub: any;
  getItemCode(arr) {
    let temp;
    for (let x = 0, i = arr.length; x < i; x++) {
      // if (arr[x].indexOf('Item Code') !== -1) {
        temp = arr[x];
        // temp = temp.split(':');
        return temp;

      // }
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
      mediaType: this.camera.MediaType.PICTURE
    } 
    this.camera.getPicture(options).then((imageData) => {
      this.imgfile[type] = imageData;
      console.log(imageData);
      let filePath = imageData;
      let fileName = filePath.split("/").pop();
      let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
      console.log(path);
      this.file.readAsDataURL(path,fileName).then((base64File)=>{
        this.viewImg[type]= this.domSanitizer.bypassSecurityTrustResourceUrl(base64File);
      }).catch(()=>{

      });
      // this.base64.encodeFile(imageData).then((base64File: string) => {
      //   this.viewImg[type]=this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',') + 1))
      // }, (err) => {
      //   console.log(err);
      // });
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
    this.imagePicker.getPictures({maximumImagesCount:1}).then(result => {
      for (let y = 0, i = result.length; y < i; y++){
        if(this.platform.is('ios')){
          result[y]="file:///"+result[y];
        }
        this.imgfile[type] = result[y];
        let filePath = result[y];
        let fileName = filePath.split("/").pop();
        let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        console.log(path);
        this.file.readAsDataURL(path,fileName).then((base64File)=>{
          this.viewImg[type]= this.domSanitizer.bypassSecurityTrustResourceUrl(base64File);
        }).catch(()=>{
        });
        // this.base64.encodeFile(result[y]).then((base64File: string) => {
        //   this.viewImg[type]=this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg/jpg;base64,' + base64File.substring(base64File.indexOf(',') + 1))
        // }, (err) => {
        //   console.log(err);
        // });
      }
    })
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
        }, 
        {
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