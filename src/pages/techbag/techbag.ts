import { Component } from '@angular/core';
import { NavController, NavParams, App, Platform, IonicPage  } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { IonicImageLoader } from 'ionic-image-loader';
import { File } from '@ionic-native/file';
import { DocumentViewer } from '@ionic-native/document-viewer';
import { FileTransfer } from '@ionic-native/file-transfer';
import { FileOpener } from '@ionic-native/file-opener';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular';
import { SERVER_URL } from '../../environment';
const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
}
@IonicPage()
@Component({
  selector: 'page-techbag',
  templateUrl: 'techbag.html',
})
export class TechbagPage {
  public items:any;
  public items2:any;


  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public ionicImageLoader: IonicImageLoader,
    private document: DocumentViewer,
    private file: File,
    private transfer: FileTransfer,
    private platform: Platform,
    private alertCtrl: AlertController,
    private fileOpener: FileOpener
    ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TechbagPage');
  }

  ionViewDidEnter(){
    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/techbag?token=' + val.token );
      data.subscribe(result => {
        this.items = result;
      })
    });

    // Or to get a key/value pair
    // this.storage.get('token').then((val) => {
    //   data = this.http.get(SERVER_URL + '/techbag2?token=' + val.token );
    //   data.subscribe(result => {
    //     this.items2 = result;
    //   })
    // });
  }

  getList0(ev: any) {
    // this.loadData();
    console.log(ev.target.value);
    // this.gen();

    let serVal = ev.target.value;

    if (serVal && serVal.trim() != '') {
      this.items = this.items.filter((item) => {
        return ((item.status && item.status.toLowerCase().indexOf(serVal.toLowerCase()) > -1 )
        // || item.acceptedName.toLowerCase().indexOf(serVal.toLowerCase()) > -1
        // || item.payment_terms.toLowerCase().indexOf(serVal.toLowerCase()) > -1
        || (item.Item_Code && item.Item_Code.toLowerCase().indexOf(serVal.toLowerCase()) > -1 )
        || (item.Part_Name && item.Part_Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1)
        || (item.Serial_No && item.Serial_No.toLowerCase().indexOf(serVal.toLowerCase()) > -1)
        );
      })
    }else {
      this.onCancel(ev);
    }
  }

  onCancel(ev) {
    // Reset the field
    console.log('reset')
    ev.target.value = '';
    this.ionViewDidEnter();
  }

}
