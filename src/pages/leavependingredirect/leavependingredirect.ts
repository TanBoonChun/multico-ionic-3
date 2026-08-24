import { Component } from '@angular/core';
import { NavController, App, LoadingController, IonicPage } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { NavParams } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
@IonicPage()
@Component({
  selector: 'page-leavependingredirect',
  templateUrl: 'leavependingredirect.html'
})

export class LeavePendingRedirectPage {

  private Id: any;
  public items:any;
  private token: string = '';
  Department: any='';
  Approver: any='';
  approverOptions: any;
  departs: any;
  leave: any;
  Project_Name: any;
  LeaveId: any;
  StatusIds: any;
  apps: any;
  
  constructor(
    public navCtrl: NavController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    private toast: Toast,
    public navParams: NavParams
  )
  {
    //this.loadData();
    this.Project_Name =this.navParams.get('Project_Name');
    this.Approver = this.navParams.get('Approver');
    this.Id = this.navParams.get('Id');
    this.LeaveId = this.navParams.get('LeaveId');
console.log(this.LeaveId);
  }

  ionViewWillEnter() {
    this.loadData();
  }



  loadData(){

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/getclaimsheet?token=' + val.token);
        data.subscribe(result => {
          this.items = result;
        })
    });

    // Department
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/getprojects?token=' + val.token);
        data.subscribe(result => {
          console.log(result);
          this.departs = result;
        })
    });

    // Approver
    this.storage.get('token').then((val) => {
        data = this.http.get(SERVER_URL + '/getapprover?token=' + val.token);
        data.subscribe(result => {
          console.log(result);
          this.apps = result;
          //filter array
          let arrApps = [];
          for (let app of this.apps) {
            if(app.Project_Name == this.Project_Name) {
                arrApps.push(app);
            }
          }
          console.log(arrApps);
          this.apps=arrApps;
        })
    });

  }

  redirectClaim() {

    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/redirect2?token=' + val.token, {
        ProjectId: this.Department,
        Approver: this.Approver,
      Id: this.LeaveId},
        httpOptions)
      .subscribe(
        (res: any) =>{
          this.navCtrl.pop();
        console.log(res)
        this.toast.show(`Redirect succesfull`, '5000', 'center').subscribe(
          toast => {
            console.log(toast);
          }
        );
      })
    });
  }

}
