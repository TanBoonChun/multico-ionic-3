import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { IonicPage, NavParams,LoadingController } from 'ionic-angular';
import { ScheduledetailsPage} from '../scheduledetails/scheduledetails';
import { SERVER_URL } from '../../environment';
@IonicPage()
@Component({
  selector: 'page-myteamscheduledet',
  templateUrl: 'myteamscheduledet.html',
})
/**
 * Generated class for the MyteamscheduledetPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


export class MyteamscheduledetPage {
 test:any="";

  constructor(
    public navCtrl: NavController, 
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    private storage:Storage,
    private http:HttpClient) {
      this.test=this.navParams.get("lalaId")
      console.log(this.test)
  }
  private temp:any;
  private data=[];
  private num=0;
  items:any;
  cuslist:any;
  
  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: 'crescent'
    });
    loading.present();
    let date = this.navParams.data.dateFormat;
    console.log(date)
    this.num = 0;
    this.data = [];
    console.log(date)
    this.storage.get('token').then(data=>{
      this.http.get(SERVER_URL + '/getAllSchedule3/'+this.test+"/"+date+'?token='+data.token, {
        params: {
        date: date
      }}).subscribe(result=>{
        loading.dismiss();

        this.temp = result;
          for (var i = 0, y = 6; i < y; i++){
            if (!this.temp[i])
              break;
            else
              this.data.push(this.temp[i]);
          }
          console.log(this.data)
          this.num=this.temp.length
      });
    });
  }
  page(d){
    console.log(d)
    this.navCtrl.push('ScheduledetailsPage',d);
  }

  gen(){
    this.cuslist = this.items;
  }

  onCancel(ev) {
    // Reset the field
    console.log('reset')
    ev.target.value = '';
    this.ionViewWillEnter();
  }

  getList(ev: any) {
    console.log(ev.target.value);
    this.gen();

    let serVal = ev.target.value;
    if (serVal && serVal.trim() != '') {
      this.temp = this.temp.filter((temp) => {
        return (temp.Deal_Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1 || temp.Company_Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1 
        || temp.Title.toLowerCase().indexOf(serVal.toLowerCase()) > -1 
        || temp.Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1)
      })
    }else{
      this.onCancel(ev);
    }
  }
}


