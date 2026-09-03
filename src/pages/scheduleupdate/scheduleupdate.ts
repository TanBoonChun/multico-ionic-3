import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Thumbnail, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the ScheduleupdatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-scheduleupdate',
  templateUrl: 'scheduleupdate.html',
})
export class ScheduleupdatePage {
    public signupform: FormGroup;

  Title: any='';
  Date: any='';
  Time: any='';
  Place: any='';
  Assign2: any='';
  Remarks: any='';
  Client: any=[];
  UplineId: any='';
  data:any;
  items:any;
  Leader: any='';
  upline:any;
  Company:any;
  company:any;
  client:any;
  clientOptions:any;
  assignOptions:any;
  Deal:any='';
  deal:any=[];
  Contact2:any='';
  contact:any=[];
  Reasons:any='';
  Assign:any;
  Contact:any;

  Deal_Name:any;
  DealId:string='';
  scId:any;
  Deal_Name2:any;

  tt:any=''

  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    public http: HttpClient,
    private toast: ToastController,    

    public navParams: NavParams) {
      this.Deal_Name2=this.navParams.get('Deal_Name')
      this.DealId=this.navParams.get('DealId')
      this.Title=this.navParams.get('Title')
      this.Contact2=this.navParams.get('Contact')
      this.Assign2=this.navParams.get('AssignToName')
      this.Assign=this.navParams.get('Assign')
      this.Date=this.navParams.get('Date')
      this.Time=this.navParams.get('Time')
      this.Place=this.navParams.get('Place')
      this.Reasons=this.navParams.get('Reasons')
      this.Remarks=this.navParams.get('Remarks')
      this.scId=this.navParams.get('scId')


      console.log('time',this.Time)




      console.log('dealname2',this.Deal_Name2);
      console.log('DealId',this.DealId)
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchedulenewPage');
    let data:Observable<any>;

    //downline
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getdownline?token=' + val.token);
      data.subscribe(result => {
            this.items = result;
        // this.setAssignOptions(this.upline[0].Id)

      })
    });

    //upline
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getupline?token=' + val.token,{
        params:{
          Leader:this.Leader
        }
      });
      data.subscribe(result => {
            this.upline = result;
            // this.UplineId.setValue(this.upline[0].Id)
      })
    });

    //company
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getCompany?token=' + val.token );
      data.subscribe(result => {
        this.company = result.company;
        // this.Company.setValue(this.company[0].Id)
      })
    });

    //client
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getClient?token=' + val.token );
      data.subscribe(result => {
        // this.client = result.client;
        // this.Client = {Id:result.client[0].Id,PIC_name:result.client[0].PIC_name}
        // this.setClientOptions(this.company[0].Id)
      })
    });

    //deal
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getdeal3/'+this.DealId+'?token=' + val.token );
      data.subscribe(result => {
        this.deal = result.deal;
        this.Deal = {Id:result.deal[0].DealId,Deal_Name:result.deal[0].Deal_Name}

        this.client = result.client;
        this.Client = {Id:result.deal[0].clientid,PIC_name:result.deal[0].PIC_name} ? {Id:result.deal[0].clientid,PIC_name:result.deal[0].PIC_name} : {Id:result.client[0].Id,PIC_name:result.client[0].PIC_name}
        // if(this.Deal_Name2 != 0){

        //   this.Deal == result.DealId
        //   console.log(this.Deal)
        // }
      })
    });

    // Contact Person
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getClient?token=' + val.token );
      data.subscribe(result => {
        this.contact = result.client;
      })
    });

  }

  ngOnInit() {
    this.Deal = this.DealId;

    this.signupform = new FormGroup({
      // Department: new FormControl('',[Validators.required]),
      // Assign: new FormControl('', [Validators.required]),
      Place: new FormControl('', []),
      Date: new FormControl('', []),
      Time: new FormControl('', [Validators.required]),
      Title: new FormControl('', []),

      Deal_Name: new FormControl('', [Validators.required]),
      Assign: new FormControl('', [Validators.required]),
      Client: new FormControl('', [Validators.required]),
    //   Company: new FormControl('', [Validators.required]),
      Reasons: new FormControl('', [Validators.required]),
      Remarks: new FormControl('', []),
    })
    console.log('Deal',this.Deal)
 }

  setClientOptions(value) {
    this.clientOptions = this.client.filter(c=>c.companyId == value);
  }

  setAssignOptions(value) {
    this.assignOptions = this.items.filter(a=>a.UplineId == value);
  }

  calculateTime(offset: any) {
    // create Date object for current location
    let d = new Date();

    // create new Date object for different city
    // using supplied offset
    let nd = new Date(d.getTime() + (3600000 * offset));

    return nd.toISOString();
  }

  transform(time: any): any {
    let hour = (time.split(':'))[0]
    let minu = (time.split(':'))[1]
    let min = minu.split(" ")[0]   
    let part = hour >= 12 ? 'PM' : 'AM';
    min = (min+'').length == 1 ? `0${min}` : min;
    hour = hour > 12 ? hour - 12 : hour;
    hour = (hour+'').length == 1 ? `0${hour}` : hour;
    return `${hour}:${min} ${part}`
  }

  myTime(time){
    var t = new Date(time);
    var h = t.getHours();
    var m = t.getMinutes();
    var s = t.getSeconds();

    return h + ":" + m + ":" + s ;
  }

  getFormatedTime(dateString){
    var date = new Date(dateString);
    var hours = date.getHours();
    var am_pm = date.getHours() >= 12 ? "PM" : "AM";
    var minutes = date.getMinutes();
    // let time = hours + ":" + minutes + " " + am_pm;
    // return time;
    return hours + ":" + minutes + " " + am_pm;
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

  submit() {
    // let loading = this.loadingCtrl.create({
    //   content: "Submitting schedule application",
    //   spinner: 'crescent'
    // });
  
    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/updateschedule?token=' + val.token, {
        dealid: this.Deal,
        title: this.Title,
        appointment_date: this.myFunction(this.Date),
        // Time: this.transform(this.Time),
        Time: this.transform(this.Time),
        location: this.Place, 
        assign_to: this.Assign,
        clientid: this.Client.Id,
        remarks: this.Remarks,
        uplineid: this.UplineId,
        uplineid2:this.UplineId,
        reasons: this.Reasons,
        oits: this.DealId,
        scheduleid:this.scId,
      },
      httpOptions)
      .subscribe(
        (res: any) =>{
          this.navCtrl.pop();
              let toast = this.toast.create({
                message: "Schedule Updated",
                position: "middle",
                closeButtonText: "Ok",
                showCloseButton: true,
                cssClass: "red",
              });

              toast.present();
      })
    });
  }

  setContactOptions(value) {
    // console.log(this.Company.Id)
    // let arrApps = new Array();
    // let companyName = '';
    // for (let c of this.company) {
    //   if (c.Id == value) {
    //     companyName = c.Company_Name;
    //     console.log(c.Id);
    //     break;
    //   }
    // }
    // for (let app of this.contact){
    //   if(app.Company_Name == companyName){
    //     arrApps.push(app);
    //   }
    // }
    // this.contactOptions=arrApps;
    // this.Contact = arrApps[0].Id;


    let data:Observable<any>;

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getClient/'+this.Deal.companyId+'?token=' + val.token );
      data.subscribe(result => {
        this.contact = result.client
      
      })
    });
  }

  cancel(){
    this.navCtrl.pop();
  }

}

