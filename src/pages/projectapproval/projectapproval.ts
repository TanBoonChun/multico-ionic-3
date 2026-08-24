import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController,LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Toast } from '@ionic-native/toast';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

@IonicPage()
@Component({
  selector: 'page-projectapproval',
  templateUrl: 'projectapproval.html',
})
export class ProjectapprovalPage {

  items:any=[]

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    public app: App,
    public loadingCtrl: LoadingController,
    private toast: Toast,
    public http: HttpClient,
    private storage: Storage) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProjectapprovalPage');

    let data:Observable<any>;

    // Or to get a key/value pair
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getsitecodeapproval?token=' + val.token );
      data.subscribe(result => {
        console.log(result);
          this.items = result;
      })
    });
  }

  gotoEdit(item){
    console.log(item)
    const confirm = this.alertCtrl.create({
      title: 'Approve / Reject Site Code',
      message: 'Click for button you want to pick',
      buttons: [
        {
          text: 'Approve',
          handler: () => {
            // let nav = this.app.getRootNav();
            // nav.push(this.listtarget, item)
            console.log(item.latest_status.ProjectId)

            console.log("Yes clicked");
            let loading = this.loadingCtrl.create({
              content: "Submitting ...",
            });

            loading.present();

            // setTimeout(() => {
            //   loading.dismiss();
            // }, 2000);

            this.storage.get("token").then((val) => {
              this.http
                .post(
                  SERVER_URL + "/sitecodeapprove?token=" + val.token,
                  {
                    id:item.latest_status.ProjectId,
                    comment: "",
                    level: 3,
                    approvalType: "Approved"
                  },
                  httpOptions
                )
                .subscribe((res: any) => {
                  loading.dismiss()
                  console.log(res);
                  if (res == 1) {
                    console.log('accept');
                    this.navCtrl.pop();
                    this.toast
                    .show(`Site Code Approved`, "5000", "center")
                    .subscribe((toast) => {
                      console.log(toast);
                    });
                  }
                }),
                (err) => {
                  this.displayErrorAlert(
                    err.error
                  );
                  loading.dismiss();
                }
            });
          }
        },
        {
          text: 'Reject',
          handler: () => {
    
            let loading = this.loadingCtrl.create({
              content: "Submitting ...",
            });

            loading.present();


            this.storage.get("token").then((val) => {
              this.http
                .post(
                  SERVER_URL + "/sitecodeapprove?token=" + val.token,
                  {
                    id:item.latest_status.ProjectId,
                    comment: "",
                    level: 3,
                    approvalType: "Reject"
                  },
                  httpOptions
                )
                .subscribe((res: any) => {
                  loading.dismiss()
                  console.log(res);
                  if (res == 1) {
                    console.log('reject');
                    this.navCtrl.pop();
                    this.toast
                    .show(`Site Code Rejected`, "5000", "center")
                    .subscribe((toast) => {
                      console.log(toast);
                    });
                  }
                }),
                (err) => {
                  this.displayErrorAlert(
                    err.error
                  );
                  loading.dismiss();
                }
            });
          }
        },
        {
          text: 'Cancel',
          handler:() => {
            console.log('no clicked')
          }
        }
      ]
    });
    confirm.present();
  }

  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }

}
