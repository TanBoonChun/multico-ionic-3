import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the VehiclelistPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-vehiclelist',
  templateUrl: 'vehiclelist.html',
})
export class VehiclelistPage {
  public vehicles : any;
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: HttpClient,
    private storage: Storage,
    ) {
  }

  ionViewWillLoad() {
    this.loadData();
  }

  loadData(){
    this.storage.get('token').then((val) => {
      this.http.get(SERVER_URL + '/getVehicle??token=' + val.token)
      .subscribe( (result:any) => {
          this.vehicles = result;
      })
    });
  }

}
