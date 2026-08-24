import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ReplacementlistdetailsPage } from '../replacementlistdetails/replacementlistdetails';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}


@IonicPage()
@Component({
  selector: 'page-replacementlist',
  templateUrl: 'replacementlist.html',
})
export class ReplacementlistPage {

  items:any=''
  id:any=''

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    private storage: Storage) {
      this.id = this.navParams.get('Id')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReplacementlistPage');
  }

  page(item){
    this.navCtrl.push(ReplacementlistdetailsPage,item)
  }

  ionViewWillEnter(){
    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getReplacementList?token=' + val.token );
      data.subscribe(result => {
        console.log(result);

        // let items = new Array();
          // for (let res of result) {
          //   if(res.Date == this.formattedDate && res.Remarks.includes('Out of time in location area')) {
          //     items.push(res);
          //   } else if(res.Date == this.formattedDate && res.Remarks.includes('Not time in location area')) {
          //     items.push(res);
          //   }
          // }

        // this.items = items;
        // console.log(this.formattedDate)
        // console.log(items)
          this.items = result.rep;
      })
    });
  }

}
