import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { AlertController } from 'ionic-angular';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
}

import { LeavePendingRedirectPage } from '../leavependingredirect/leavependingredirect';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';
/**
 * Generated class for the LeavedetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-leavedetail',
  templateUrl: 'leavedetail.html',
})

export class LeavedetailPage {

  leavependingredirect = LeavePendingRedirectPage;
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
  public serverUrl: string = SERVER_URL_WITHOUT_API;
  // Every attachment on this leave, from /getleaveattachments. The Web_Path
  // that arrives via navParams is only ever the newest one (the getleaves query
  // joins files through Max(Id)), so it cannot show a leave's other photos.
  public myattachment: any[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    public alertCtrl: AlertController,
    private storage: Storage) 
    {
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
      console.log(this.Project_Name);
      this.LeaveId = this.navParams.get('Id');
      this.leave = {LeaveId:this.LeaveId,Project_Name:this.Project_Name};

      const webPath = this.navParams.get('Web_Path');
      if (webPath) {
        this.attachmentUrl = SERVER_URL_WITHOUT_API + webPath;
        this.attachmentIsImage = !!webPath.toUpperCase().match('JPG|JPEG|PNG');
      }
  }

  openAttachment(url?: string) {
    window.open(url || this.attachmentUrl, '_system');
  }

  isImage(path: string): boolean {
    return !!(path && path.toUpperCase().match('JPG|JPEG|PNG'));
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeavedetailPage');
  }

  ionViewDidEnter() {
    this.loadData();
    this.loadAttachments();
  }

  loadAttachments() {
    if (!this.LeaveId) {
      return;
    }

    this.storage.get('token').then((val) => {
      this.http.get<{myattachment: any[]}>(SERVER_URL + '/getleaveattachments/' + this.LeaveId + '?token=' + val.token)
        .subscribe(
          (result) => {
            this.myattachment = (result && result.myattachment) ? result.myattachment : [];
          },
          (err) => {
            // Fall back to the single navParams Web_Path already rendered.
            console.log('Could not load leave attachments', err);
          }
        );
    });
  }

  statusIcon() {
    switch ((this.Status || '').toLowerCase()) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'cancelled': return 'remove-circle';
      default: return 'time';
    }
  }

  loadData(){

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/getleaves?token=' + val.token );
        data.subscribe(result => {
          this.items = result;
        })
    });
  }

  cancelLeave() {

    const confirm = this.alertCtrl.create({
      title: 'Cancel leave submitted?',
      message: 'Are you sure want to cancel leave submitted?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('No clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            this.storage.get('token').then((val) => {
              this.http.post(SERVER_URL + '/cancelleave?token=' + val.token + '&Id='+ this.LeaveId, {
                },
                httpOptions)
              .subscribe(
                (res: any) =>{
                  this.navCtrl.pop();
                console.log(res)
              })
              this.http.post(SERVER_URL + '/notifications/updateleavecancelled?token=' + val.token, {TargetId: this.LeaveId}).subscribe(result => {
                console.log(result)
              })
            });
          }
        }
      ]
    });
    confirm.present();

  }

}
