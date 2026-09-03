import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { NavController } from 'ionic-angular/navigation/nav-controller';
import { IonicPage, NavParams,LoadingController } from 'ionic-angular';
import { ScheduledetailsPage} from '../scheduledetails/scheduledetails';
import { SERVER_URL } from '../../environment';
@IonicPage()
@Component({
  selector: 'page-scheduledet',
  templateUrl: 'scheduledet.html',
})
export class ScheduledetPage {
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private storage:Storage,
    private http:HttpClient) {
  }
  private temp:any;
  private data=[];
  private num=0;
  items:any;
  cuslist:any;
  public status:string = 'All';
  allitems:any;
  
  ionViewWillEnter() {
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: 'crescent'
    });
    loading.present();
    let date = this.navParams.data;
    console.log(date)
    this.num = 0;
    this.data = [];
    console.log(date)
    this.storage.get('token').then(data=>{
      this.http.get(SERVER_URL + '/getAllSchedule2?token='+data.token, {
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
        
          this.items = result;
          this.allitems = result;
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
        if(temp.Deal_Name && temp.Company_Name && temp.Title && temp.Name){

          console.log(this.temp)
          return (temp.Deal_Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1 || temp.Company_Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1 
          || temp.Title.toLowerCase().indexOf(serVal.toLowerCase()) > -1 
          || temp.Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1
          || temp.Project_Name.toLowerCase().indexOf(serVal.toLowerCase()) > -1)
        }
      })
    }else{
      this.onCancel(ev);
    }
  }

  onChange($event){
    //console.log($event.target.value);
    var status = $event
    this.status = status
    if (status == 'All')
    this.items = this.allitems;
    else{
      this.items = this.allitems.filter((item) => {
        return item.status == status;
      });
    }
  
  }
}

