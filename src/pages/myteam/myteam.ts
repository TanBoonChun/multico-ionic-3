import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { MyteamschedulePage } from '../myteamschedule/myteamschedule';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';
/**
 * Generated class for the MyteamPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-myteam',
  templateUrl: 'myteam.html',
})
export class MyteamPage {
  public serverUrl: string = SERVER_URL_WITHOUT_API;
  items: any='';
  userImage:any='';
  item:any;
  UserId:any;
  Id:any;
  s:any='';

  // myteamschedule = MyteamschedulePage;

  searchTerm: string ;
  filterItems:any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: HttpClient,
    public loadingCtrl: LoadingController,
    private storage: Storage,) {
      this.s={
        lalaId:this.items.Id
      }
      console.log(this.s)

  }

  myteamschedule(s) {
    this.navCtrl.push('MyteamschedulePage',s);
    console.log(s)
  }

  ionViewWillEnter(){
    this.loadData();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MyteamPage');
  }

  loadData(){
    let data:Observable<any>;
    let loading = this.loadingCtrl.create({
      content: "Loading content",
      spinner: 'crescent'
    });
    // this.storage.get('user').then((val) => {
    //   this.userImage = val.Web_Path;
     
    // });
    loading.present();

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getMyTeam?token=' + val.token );
      data.subscribe(result => {
        loading.dismiss();

        this.items = result;      
        // this.filterItems= this.items;
        this.userImage = result.Web_Path;

      })
    });
    console.log(this.items);
  }

}

