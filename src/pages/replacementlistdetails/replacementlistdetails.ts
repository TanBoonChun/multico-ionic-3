import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
import { ReplacementnosnPage } from '../replacementnosn/replacementnosn';
import { SERVER_URL } from '../../environment';



// @IonicPage()
@Component({
  selector: 'page-replacementlistdetails',
  templateUrl: 'replacementlistdetails.html',
})
export class ReplacementlistdetailsPage {

  b:any=[];
  a:any='';
  c:any=[];
  Id:any=''
  Type:any='';
  Receiving_No:any='';
  PO_No:any='';
  DO_No:any='';
  Vendor_Name:any='';
  Company:any='';
  location:any='';
  project_code:any='';
  site:any='';
  Ownership:any='';
  Segment:any='';
  created_at:any='';
  Date:any='';
  Time:any='';
  SiteName:any='';
  ProjectNo:any='';
  Remarks:any='';
  constructor(
    public navCtrl: NavController, 
    public http: HttpClient,
    private toast: Toast,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public storage: Storage) {
      this.Id=this.navParams.get('Id')
      this.Type=this.navParams.get('Type')
      this.Receiving_No=this.navParams.get('Receiving_No')
      this.PO_No=this.navParams.get('PO_No')
      this.DO_No=this.navParams.get('DO_No')
      this.Vendor_Name=this.navParams.get('Vendor_Name')
      this.Company=this.navParams.get('Company')
      this.location=this.navParams.get('location')
      this.project_code=this.navParams.get('project_code')
      this.site=this.navParams.get('site')
      this.Ownership=this.navParams.get('Ownership')
      this.Segment=this.navParams.get('Segment')
      this.created_at=this.navParams.get('created_at')
      this.Date=this.navParams.get('Date')
      this.Time=this.navParams.get('Time')
      this.SiteName=this.navParams.get('SiteName')
      this.ProjectNo=this.navParams.get('ProjectNo')
      this.Remarks=this.navParams.get('Remarks')
      console.log('rep',this.Id)
  }



  replacement(){
    this.navCtrl.push('ReplacementitemPage',{Id:this.Id})
    console.log(this.Id)
  }

  replacementnosn(){
    this.navCtrl.push(ReplacementnosnPage,{Id:this.Id})
  }

  ionViewDidEnter(){
    let data: Observable<any>;


    // Receiving
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getReplacementDetails/"+this.Id+"?token=" + val.token
      );
      data.subscribe((result) => {
        this.a = result.list;
        this.b = result.material;
        // this.c = [result.select == this.b.Inventory_Id]

        console.log(this.b.Inventory_Id)
        // this.c = [this.b.Inventory_Id == this.a.Inventory_Id];
      });
    });
  }

}
