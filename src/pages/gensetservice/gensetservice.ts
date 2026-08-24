import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { SERVER_URL } from '../../environment';

@IonicPage()
@Component({
  selector: 'page-gensetservice',
  templateUrl: 'gensetservice.html',
})
export class GensetservicePage {

  private data=[];
  constructor(
    private storage: Storage,
    private http:HttpClient,
    private navCtr:NavController,private navParam:NavParams
  ){}
  ionViewWillEnter() {
    this.load();
  }
  load() {
    let date = this.navParam.data;
    this.storage.get("token").then((val) => {
      this.http.get(SERVER_URL + '/serviceticket/getService?token=' + val.token, {
        params: {
        date:date
      }})
        .subscribe(result=>{
          this.data = result['service'];
      });
    })

  }
  page(detail) {
    if (detail.service_type == 'Delivery' && (detail.Status == "In-Progress" || detail.Status == "Completed"))
      this.navCtr.push('GensetdeliveryPage', detail);
    else
    this.navCtr.push('GensetserviceDetailsPage', detail);
  }

}
