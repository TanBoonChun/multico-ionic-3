import { Component } from '@angular/core';
import { NavController, NavParams, App, IonicPage } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the Leavedetail2Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leavedetail2',
  templateUrl: 'leavedetail2.html',
})
export class Leavedetail2Page {

  private LeaveId:any;
  public items:any;
  private token: string = '';
  private Id: any;
  private Start_Date : string;
  private Status: string;
  private Leave_Type: string;
  private Leave_Term: string;
  private End_Date: string;
  private No_of_Days: string;
  private  Reason: string;
  private Approver: string;
  private Project_Name: string;
  private leave : any;
  public attachmentUrl: string = '';
  public attachmentIsImage: boolean = false;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public navParams: NavParams
  ) {
    this.loadData();
      this.Id = this.navParams.get('Id');
      this.Start_Date = this.navParams.get('Start_Date')
      this.Status = this.navParams.get('Status')
      this.Leave_Type = this.navParams.get('Leave_Type')
      this.Leave_Term = this.navParams.get('Leave_Term')
      this.End_Date = this.navParams.get('End_Date')
      this.No_of_Days = this.navParams.get('No_of_Days')
      this.Reason = this.navParams.get('Reason')
      this.Project_Name =this.navParams.get('Project_Name');
      this.Approver = this.navParams.get('Approver')

      this.LeaveId = this.navParams.get('Id');
      this.leave = {LeaveId:this.LeaveId,Project_Name:this.Project_Name};

      const webPath = this.navParams.get('Web_Path');
      if (webPath) {
        this.attachmentUrl = SERVER_URL_WITHOUT_API + webPath;
        this.attachmentIsImage = !!webPath.toUpperCase().match('JPG|JPEG|PNG');
      }
    }

  openAttachment() {
    window.open(this.attachmentUrl, '_system');
  }

  loadData(){

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getleavesapproved?token=' + val.token );
      data.subscribe(result => {
        this.items = result;
      })

      this.http.post(SERVER_URL + '/notifications/updateleaveapproved?token='    + val.token, {TargetId: this.LeaveId}).subscribe(result => {
        console.log(result)
      })
    });
  }

}
