import { Component } from '@angular/core';
import { App, IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { AlertController } from 'ionic-angular';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';
/**
 * Generated class for the Leavedetail5Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-leavedetail5',
  templateUrl: 'leavedetail5.html',
})

export class Leavedetail5Page {

  myapprovalredirect = "MyApprovalRedirectPage";
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
  public id: any;
  public attachmentUrl: string = '';
  public attachmentIsImage: boolean = false;

  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public alertCtrl: AlertController,
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
    this.LeaveId = this.navParams.get('LeaveId');
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
        data = this.http.get(SERVER_URL + '/myApprover?token=' + val.token);
        data.subscribe(result => {
          this.items = result;
        })
        
    });
  }

  approveLeave() {

    const confirm = this.alertCtrl.create({
      title: 'Approve Leave',
      message: 'Are you sure want to approve this leave?',
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
              this.http.post(SERVER_URL + '/adminapproval?token=' + val.token, {
                LeaveId: this.LeaveId,
                Id: this.LeaveId
                },
                httpOptions)
              .subscribe(
                (res: any) =>{
                console.log(res)
                this.showDecision(res, 'Final Approved', 'Leave approved');
              })
              this.http.post(SERVER_URL + '/notifications/updateleavepending?token=' + val.token, {TargetId: this.LeaveId}).subscribe(result => {
                console.log(result)
              })
            });
          }
        }
      ]
    });
    confirm.present();
  }

  rejectLeave() {

    const confirm = this.alertCtrl.create({
      title: 'Reject Leave',
      message: 'Are you sure want to reject this leave?',
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
              this.http.post(SERVER_URL + '/adminrejected?token=' + val.token + '&Id=' + this.LeaveId , {
                Id: this.LeaveId
                },
                httpOptions)
              .subscribe(
                (res: any) =>{
                console.log(res)
                this.showDecision(res, 'Final Rejected', 'Leave rejected');
              })
              this.http.post(SERVER_URL + '/notifications/updateleavepending?token=' + val.token, {TargetId: this.LeaveId}).subscribe(result => {
                console.log(result)
              })
            });
          }
        }
      ]
    });
    confirm.present();
  }

  // The decision only sticks when the leave is still waiting on this approver,
  // so confirm the status the server sends back before reporting success.
  private showDecision(res: any, expected: string, message: string) {
    const rows = Array.isArray(res) ? res : [];
    const leave = rows.filter(row => String(row.LeaveId) === String(this.LeaveId))[0];

    if (leave && leave.Status !== expected) {
      this.alertCtrl.create({
        title: 'No Change',
        subTitle: 'This leave is no longer waiting for your approval. It is now ' + leave.Status + '.',
        buttons: ['OK']
      }).present();
      this.navCtrl.pop();
      return;
    }

    this.navCtrl.pop();
    this.toast.show(message, '5000', 'center').subscribe(
      toast => {
        console.log(toast);
      }
    );
  }

}
