import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular';
import { IonicImageLoader } from 'ionic-image-loader';
import { File } from '@ionic-native/file';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

@IonicPage()
@Component({
  selector: 'page-advancependingdetailsSite',
  templateUrl: 'advancependingdetailsSite.html',
})

export class AdvancependingdetailsSitePage {

  public serverUrl = SERVER_URL_WITHOUT_API;
  items: any;
  Leave_Type: any='';
  Leave_Term: any='';
  Start_Date: any='';
  End_Date: any='';
  Reason: any='';
  Department: any='';
  Date: any='';
  Approver: any='';
  image: string;
  myphoto: string;
  reason: string;
  apps: any;
  approverOptions: any;
  departs: any;
  types:any;
  terms: any;
  advancedetails: any = [];
  advance: any = {};
  advanceid: any;
  user: any = {};
  private token: string = '';
  allApprover:any=[];
  totalreq:any=[];
  partner:any=[];
  myattachment=[];
  imagesO=[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public ionicImageLoader: IonicImageLoader,
    private file: File,
    public loadingCtrl: LoadingController) {
      this.advanceid = this.navParams.get('Id');
      console.log("advanceid", this.advanceid)
      this.totalreq = this.navParams.get('Total_Requested');
  }


  ionViewWillEnter() {
    this.loadData();
  }


  setApproverOptions(value) {
    let arrApps = new Array();
    let projectName = '';
    for (let depart of this.departs) {
        if (depart.Id == value) {
          projectName = depart.Project_Name;
          break;
        }
    }
    for (let app of this.apps) {
      if(app.Project_Name == projectName) {
          arrApps.push(app);
      }
    }

    this.approverOptions = arrApps;
  }


  loadData(){

    let data:Observable<any>;
    let data2: Observable<any>;

    // Leave_Type
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/myadvancedetail2/'+ this.advanceid +'?token=' + val.token);
        data.subscribe(result => {
          console.log(result.myattachment);
          this.advance = result.advance[0];
          this.advancedetails = result.advancedetails;
          this.user = result.me;
          this.allApprover = result.allApprover;
          this.totalreq = result.totalreq;
          this.partner = result.partner;
          this.myattachment = result.myattachment;
          // this.myattachment.push("https://totg.foursons.my" + result.myattachment);

          console.log(this.myattachment);
        });
        // data2 = this.http.get(SERVER_URL + '/myadvancedetail2/'+ this.advanceid +'?token=' + val.token
        // );
        // data2.subscribe((result2) => {
        //   for (let item of result2) {
        //     console.log(item);
        //   this.imagesO = item.myattachment;

        //     this.imagesO.push("https://totg.foursons.my" + item.Web_Path);
        //   }
        //   console.log(this.imagesO);
        // });

    });

  }

}
