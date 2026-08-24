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
import { GoodreturnnoteformitemPage } from '../goodreturnnoteformitem/goodreturnnoteformitem';
import { SERVER_URL } from '../../environment';
/**
 * Generated class for the GoodreturnnoteformPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-goodreturnnoteform',
  templateUrl: 'goodreturnnoteform.html',
})
export class GoodreturnnoteformPage {

  private token: string = '';
  public signupform: FormGroup;
  
  Type:any='';
  ReceivingDate:any='';
  ReceivingTime:any='';
  Bay:any='';
  Project:any='';
  SiteCode:any='';
  SiteName:any='';
  Company:any='';
  Ownership:any='';
  Segment:any='';
  newMaterial:any='';
  newUnit:any='';
  newQuantity:any='';
  Department: any;

  item:any='';
  itemarray:any=[];
  items:any;
  bay:any=[];
  test:any;
  apps:any=[];
  company:any=[];


  constructor(
    public navCtrl: NavController,
    private toastCtrl: ToastController,
    private viewCtrl:ViewController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private modal: ModalController,
    private toast: Toast,
    public loadingCtrl: LoadingController,
    private modalController: ModalController) {

        this.loadData();
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Type: new FormControl('', [Validators.required]),
      ReceivingDate: new FormControl('', [Validators.required]),
      ReceivingTime: new FormControl('', [Validators.required]),
      Bay: new FormControl('', [Validators.required]),
      Project: new FormControl('', [Validators.required]),
      SiteCode: new FormControl('', [Validators.required]),
      SiteName: new FormControl('', [Validators.required]),
      Company: new FormControl('', [Validators.required]),
      Ownership: new FormControl('', [Validators.required]),
      Segment: new FormControl('', [Validators.required]),
      newMaterial: new FormControl('', []),
      newUnit: new FormControl('', []),
      newQuantity: new FormControl('', []),

    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad GoodreturnnoteformPage');
  }

  loadData(){
    let data:Observable<any>;

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getpic?token=' + val.token );
      data.subscribe(result => {
        this.item = result;
      })
    });

    // Department
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojects?token=" + val.token + "&type=good_return"
      );
      data.subscribe((result) => {
        console.log(result);
        // this.departs = result;
        this.items = result;

      });
    });

    // Bay
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getBay?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        // this.departs = result;
        this.bay = result;

      });
    });

    // Company
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getCompany?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        // this.departs = result;
        this.company = result;

      });
    });
  }
  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
  
    var day = ('0'+ d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + '-' + monthNames[monthIndex] + '-' + year;
  }

  siteCode(){
    let selectedProjectCode= this.Department;
    if(!selectedProjectCode) return ;
    if(typeof selectedProjectCode['Site_Code'] !== 'undefined'){
      let options=selectedProjectCode['Site_Code'].map(function(item){
        let siteCode= "";
        switch(item.Level){
          case 1 :siteCode= item.Department;break;
          case 2 :siteCode= item.Segment;break;
          case 3 :siteCode= item.Contract_No;break;
          case 4 :siteCode= item.PO_No;break;
          case 5 :siteCode= item.Site_ID;break;
        }
        let obj={Id:item['Id'],siteCode:siteCode};
        return obj;
      });
      this.apps =options;
    }else{
      // this.apps=[{Id:selectedProjectCode.Id,siteCode:selectedProjectCode.Project_Code}];
    }
  }

  projectCode(id) {
    let data: Observable<any>;
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojectcodes/" +
          id +
          "?token=" +
          val.token
      );
      data.subscribe((result) => {
        console.log(result);
        let apps = new Array();
        for (let res of result) {
          res.SiteCode =
            res.SiteCode +
            " - " +
            res["Site Id"] +
            " - " +
            res["Site LRD"] +
            " - " +
            res["Site Name"];

          apps.push(res);
        }
        this.apps = apps;
      });
    });
  }

  addrow(){
    let modal = this.modalController.create(GoodreturnnoteformitemPage,{})

    modal.present();

    modal.onDidDismiss(data => {
      if (data) {
        this.itemarray.push(data);
        console.log(data,this.itemarray);
      }
    });
  }

  edit(index){
    let modal = this.modal.create(GoodreturnnoteformitemPage,this.itemarray[index]);
      modal.present();
      modal.onDidDismiss(data => {
        if (data) {
          this.itemarray[index] = data;
        }
      });
  }

  remove(ele){
    this.itemarray.splice(ele,1);
  }

  submit() {
    let loading = this.loadingCtrl.create({
      content: 'Submitting ...'
    });
  
    loading.present();

    this.storage.get('token').then((val) => {
        return this.http.post(SERVER_URL + '/todolistCreate?token=' + val.token, {
          // PIC: this.PIC,
          // AssignDate: this.myFunction(this.AssignDate),
          // DueDate: this.myFunction(this.DueDate),
          // Task: this.Task,
          // Reminder: this.Reminder,
          // Repeat: this.Repeat
          newAdvance: JSON.stringify(this.itemarray),

        },
        httpOptions)
      .subscribe(
        (res: any) =>{
          loading.dismiss();
          this.navCtrl.pop();
          console.log(res)
          this.toast.show(`New Good Return Note created`, '5000', 'center').subscribe(
            toast => {
              console.log(toast);
            }
          );
        }
      )
    });

  }

  goto(item){

    console.log(item)
    const confirm = this.alertCtrl.create({
      title: 'Edit / Remove Material Code',
      message: 'Click for button you want to pick',
      buttons: [
        {
          text: 'Edit',
          handler: () => {

            console.log('Edit clicked');
         

              let modal = this.modal.create(GoodreturnnoteformitemPage,this.itemarray[item]);
                modal.present();
                modal.onDidDismiss(data => {
                  if (data) {
                    this.itemarray[item] = data;
                  }
                });
            

          }
        },
        {
          text: 'Remove',
          handler: () => {
            this.itemarray.splice(item,1);

          }
        },
        {
          text: 'Cancel',
          handler:() => {
            console.log('no clicked')
          }
        }
      ]
    });
    confirm.present();
  }

}