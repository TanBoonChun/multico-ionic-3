import { Component } from '@angular/core';
import { NavController, NavParams, App, Platform  } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { IonicImageLoader } from 'ionic-image-loader';
import { File } from '@ionic-native/file';
import { DocumentViewer } from '@ionic-native/document-viewer';
import { FileTransfer,  FileTransferObject } from '@ionic-native/file-transfer';
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

/**
 * Generated class for the GensethistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
  selector: 'page-logisticinventorybagdet',
  templateUrl: 'logisticinventorybagdet.html',
})

export class LogisticinventorybagdetPage {

  public items:any;
  barcode: any=[];



  constructor(
    public navCtrl: NavController, 
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
    this.loadData();
    this.barcode = this.navParams.get('barcode')
    console.log(this.barcode);

  }

  

  ionViewDidLoad() {
    console.log('ionViewDidLoad GensethistorydetailsPage');
  }

  loadData(){

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getrequisitionhistorytech?token=' + val.token );
      data.subscribe(result => {
        this.items = result;
        this.items = result.filter(items => items.barcode == this.barcode);
        
      })
    });

    
  }

}
