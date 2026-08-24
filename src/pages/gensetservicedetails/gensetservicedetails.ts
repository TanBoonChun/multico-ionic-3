import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { Geolocation } from '@ionic-native/geolocation';
import { CallNumber } from '@ionic-native/call-number';
import { Observable } from 'rxjs/Observable';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
}


@IonicPage()
@Component({
  selector: 'page-gensetservicedetails',
  templateUrl: 'gensetservicedetails.html',
})
export class GensetserviceDetailsPage {
  private data: any;
  private id:any;
  private type:string;
  private serviceId:any;
  private serId: any;
  private siteName: string;
  private latitude: any;
  private longitude: any;
  private genset: any;
  private atraveltask: any = [];
  private startTask:boolean=false;
  private timeIn: any;
  private req: any;
  private hideConfirm: boolean = false;
  private remarks: any;
  public items:any='';
  private UserId:any='';
  private startNav: string;
  private options:any;
  Latitude_In: any;
  Longitude_In: any;
  destination: string;
  model: string;
  capacity:string;
  hideRequest=false;
  reqStatus:string;
  leader_id: any = '';

  atask:any=''
  isenabled: boolean;
  constructor(
    private storage: Storage,
    private http:HttpClient,
    private navParam:NavParams,
    private nav: NavController,
    private loading:LoadingController,
    private toast: Toast,
    public callNumber: CallNumber,
    private alertCtrl:AlertController,
    private launchNavigator: LaunchNavigator,
    public navCtrl: NavController,
    public geo: Geolocation,

  ){
    this.id=this.navParam.get('Id');
    this.type=this.navParam.get('service_type');
    this.serviceId=this.navParam.get('service_id');
    this.serId = this.navParam.get('serviceId');
    this.siteName=this.navParam.get('Loc_Name');
    this.latitude = this.navParam.get('Lat');
    this.longitude = this.navParam.get('Long');
    this.genset = this.navParam.get('genset_no');
    this.timeIn = this.navParam.get('timeIn');
    this.req = this.navParam.get('reqId');
    this.UserId = this.navParam.get('UserId');
    this.model= this.navParam.get('model');
    this.capacity = this.navParam.get('capacity');
    this.leader_id = this.navParam.get('leader_id');
    
    if(this.timeIn) this.startTask=true;

    this.startNav = "";
    this.destination = this.latitude + "," + this.longitude;

    this.geo
        .getCurrentPosition()
        .then(pos => {
          this.Latitude_In = pos.coords.latitude;
          this.Longitude_In = pos.coords.longitude;
     
          alert("Location Refreshed");
        })
        .catch(err => console.log(err));
  }
  
  ionViewWillEnter(){
    this.reqStatus=this.navParam.get('reqStatus');
    if(this.reqStatus && this.reqStatus != 'Confirmed'){
      this.hideRequest=true;
    }
    if (!this.req) this.hideConfirm = true; 

    this.load();
  }

  load() {
    let data:Observable<any>;
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getcall?token=' + val.token,{
        params:{
          UserId:this.UserId
        }
      } );
      data.subscribe(result => {
        this.items = result;
      })
    })

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getstartendtask/" + this.serId + "?token=" + val.token
      );
      data.subscribe((result) => {
        this.atask = result;
      });

      this.http.get(
        SERVER_URL + "/gettravellog/" + this.id + "?token=" + val.token
      ).subscribe((result) => {
        this.atraveltask = result;
      });

      this.http.get(
        SERVER_URL + "/RepairOption?token=" + val.token
      ).subscribe((result) => {
        this.options = result;
      });

    });

  }
  replacement(){

    this.nav.push('GensetreplacementPage',{id:this.id,gensetNo:this.genset});
    
  }

  sparepart(){
    this.nav.push('GensetsparepartPage', {serId:this.serId,reqId:this.req});
  }

  notes(){
    this.nav.push('GensetnotePage', {serviceId:this.id});
  }

  // Formats a MySQL "YYYY-MM-DD HH:MM:SS" string as "DD-Mon-YYYY h:mm AM/PM",
  // matching the Start/End Task display format. Done here (not stored this way
  // in the DB) because the column is a real DATETIME and only accepts that format.
  formatDate(value: string): string {
    if (!value) {
      return '';
    }

    const parts = value.split(' ');
    if (parts.length < 2) {
      return value;
    }

    const [datePart, timePart] = parts;
    const dateBits = datePart.split('-');
    const timeBits = timePart.split(':');
    if (dateBits.length < 3 || timeBits.length < 2) {
      return value;
    }

    const [year, month, day] = dateBits;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;

    let hour = parseInt(timeBits[0], 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) {
      hour = 12;
    }

    return day + '-' + monthName + '-' + year + ' ' + hour + ':' + timeBits[1] + ' ' + ampm;
  }

  confirmItem(){
    this.nav.push('GensetrequestconfirmationPage',{
      serId:this.serId,
      reqId:this.req
    })
  }

  endTask(){

    const confirm = this.alertCtrl.create({
      title: "Confirmation",
      subTitle: "Want to end task?",
      buttons: [
        {
          role:'cancel',
          text:"Cancel"
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.get('token').then(val => {
              this.http.post(SERVER_URL + '/serviceticket/endTask?token=' + val.token, {id:this.serId}, {})
                .subscribe(result => {
                  if (result > 0) {
                    this.toast.show('Success', '5000', 'center').subscribe();
                    this.load();
                  }
                  else this.toast.show('Fail to end the task', '5000', 'center').subscribe();
                 }) ;
            })
          }
        }
      ]
    })
    confirm.present();

  }
  request() {
    this.nav.push('GensetrequestPage', {serId:this.serId,reqId:this.req});
  }
  complete() {
    const alert=this.alertCtrl.create({
      title:"Error",
      subTitle:"Please input remarks before complete.",
      buttons:[
        'OK'
      ]
    });

    if(!this.remarks)
      return alert.present();

    if(this.atask.length === 0 && this.atraveltask.length === 0){
      const confirm = this.alertCtrl.create({
        title: "Confirmation",
        subTitle: "Are you sure want to complete the task without start/end the travel or task?",
        buttons: [
          {
            role: 'cancel',
            text: "No"
          },
          {
            text: 'Yes',
            handler: () => {
              this.submitComplete();
            }
          }
        ]
      });
      return confirm.present();
    }

    this.submitComplete();
  }

  submitComplete() {
    const loader= this.loading.create({
      content: "Please wait...",
      duration: 3000
    });
    loader.present();
    this.storage.get('token').then(val => {

        this.http.post(SERVER_URL + '/serviceticket/updateService?token=' + val.token, {
          id: this.id,
          serId:this.serId,
          status: 'completed',
          remarks:this.remarks ? this.remarks : '',
          type:this.type
        },
        {})
          .finally(() => {
            loader.dismiss();
          })
        .subscribe(
          (res: any) => {
            if (res > 0) {
              this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
              this.toast.show(`Completed`, '5000', 'center').subscribe(
                toast => {}
              );
            } else {
              this.toast.show('Fail', '5000', 'center').subscribe();
            }

        })
    })
  }
  start() {
    const confirm = this.alertCtrl.create({
      title: "Confirmation",
      subTitle: "Start task before replacing",
      buttons: [
        {
          role:'cancel',
          text:"Cancel"
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.get('token').then(val => {
              this.http.post(SERVER_URL + '/serviceticket/startTask2?token=' + val.token, {id:this.serId}, {})
                .subscribe(result => {
                  if (result > 0) {
                    this.toast.show('Success', '5000', 'center').subscribe();
                    this.load();
                  }
                  else this.toast.show('Fail to start the task', '5000', 'center').subscribe();
                 }) ;
            })
            // this.nav.push('GensetreplacementPage',{id:this.id,gensetNo:this.genset});

          }
        }
      ]
    })
    confirm.present();
  }

  Call(){
    this.callNumber.callNumber(this.items.Contact_No_1, true)
    .then(() => console.log('Launched dialer!'))
    .catch(() => console.log('Error launching dialer'));
    console.log(this.items.Contact_No_1)
  }

  navme(){
    let options: LaunchNavigatorOptions = {
      start : this.startNav
    };
  
   
    this.launchNavigator.navigate(this.destination, options).then(
      success => alert('Launched'),
      error => alert('Error' + error)
      
    )
  console.log(this.startNav)

  }

  confirmRelease(){
    this.storage.get('token').then(val => {
      this.http.post(SERVER_URL + '/serviceticket/releaseTicket?token=' + val.token,
      {
        serviceticket_id:this.id,
        leader_id: this.leader_id,
        note: 'Released',
        service_id : this.serviceId
      }
      ,{})
      .subscribe(
        (result: any) =>{
          this.nav.pop();
          this.toast.show('Success', '5000', 'center').subscribe();
        }, (error) => {
          this.toast.show('Error! Please try again.', '5000', 'center').subscribe();
        }
      )
    })
  }

  release(){
    const confirm = this.alertCtrl.create({
      title: "Release",
      message: "Are you sure you want to release this?",
      buttons: [
        {
          text: "Cancel",
          role:'cancel'
        },
        {
          text: "Yes",
          handler: () => {
            this.confirmRelease();
          }
        }
      ]
    })
    confirm.present();
  }

  starttravel() {
    const confirm = this.alertCtrl.create({
      title: "Confirmation",
      subTitle: "Start to travel?",
      buttons: [
        {
          role:'cancel',
          text:"Cancel"
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.get('token').then(val => {
              this.http.post(SERVER_URL + '/serviceticket/starttravel?token=' + val.token, {
                id:this.id,
                Latitude: this.Latitude_In,
              Longitude: this.Longitude_In},httpOptions)
                .subscribe(result => {
                  if (result > 0)
                  {
                    this.toast.show('Success', '5000', 'center').subscribe();
                    this.isenabled=true;
                    this.load();
                  }

                  else this.toast.show('Fail to start travel!', '5000', 'center').subscribe();
                 }) ;
            })
            // this.nav.push('GensetreplacementPage',{id:this.id,gensetNo:this.genset});

          }
        }
      ]
    })
    confirm.present();
  }

  endtravel() {
    const confirm = this.alertCtrl.create({
      title: "Confirmation",
      subTitle: "Arrived?",
      buttons: [
        {
          role:'cancel',
          text:"Cancel"
        },
        {
          text: 'Yes',
          handler: () => {
            this.storage.get('token').then(val => {
              this.http.post(SERVER_URL + '/serviceticket/endtravel?token=' + val.token, {
                id:this.id,
                Latitude: this.Latitude_In,
                Longitude: this.Longitude_In},httpOptions)
                .subscribe(result => {
                  if (result > 0)
                  {
                    this.toast.show('Success', '5000', 'center').subscribe();
                    this.isenabled=false;
                    this.load();
                  }

                  else this.toast.show('Fail to end travel!', '5000', 'center').subscribe();
                 }) ;
            })
            // this.nav.push('GensetreplacementPage',{id:this.id,gensetNo:this.genset});

          }
        }
      ]
    })
    confirm.present();
  }

}
