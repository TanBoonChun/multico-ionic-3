import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController, IonicPage } from 'ionic-angular';
import { App, Events } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
import { Toast } from '@ionic-native/toast';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';
@IonicPage()
@Component({
  selector: 'page-claimrejecteddetails',
  templateUrl: 'claimrejecteddetails.html',
})

export class ClaimrejecteddetailsPage {

  claimsubmission = 'ClaimsubmissionPage';
  private ClaimSheetId: any;
  public items:any;
  private token: string = '';
  private id: any;
  public barangs:any;
  public Claim_Sheet_Name: string;
  public Status: string;
  public Total_Amount: any = '0';
  public Total_Advance: any = '0';
  public Total_Payable: any = '0';
  public Claim_Object: any;
  public Total_Expenses: number = 0;
  imagesO = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private toast: Toast,
    public alertCtrl: AlertController,
    private events: Events,
    public loadingCtrl: LoadingController,
    private storage: Storage)
    {
    this.id = this.navParams.get('Id');

    this.Claim_Object = {Id: this.id};
    this.ClaimSheetId = this.navParams.get('ClaimSheetId');
    this.Claim_Sheet_Name =this.navParams.get('Claim_Sheet_Name');
    this.Status = this.navParams.get('Status');
    // this.loadData();
    // this.events.subscribe("new-claim", () => {
    //   this.loadData();
    // });
  }
  ionViewDidEnter() {
    this.loadData();
    console.log("enterrrrrrrrrrr");
  }

  loadData() {

    this.Total_Advance = 0;
    this.Total_Amount = 0;
    this.Total_Payable = 0;
    this.imagesO = [];

    let data:Observable<any>;
    let data2:Observable<any>;


    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getclaims2?token="+val.token+"&id="+this.id
      );
      data.subscribe((result) => {
        this.Total_Advance = result.totalAdvanceRequest;

        this.items = result.myclaimdetail;
        for (let item of this.items) {
          this.Total_Amount = Number(
            Number(this.Total_Amount) + Number(item.Total_Expenses)
          ).toFixed(2);
          
        }
        this.Total_Payable = Number(
          Number(this.Total_Amount) - Number(this.Total_Advance)
        ).toFixed(2);

      });
      console.log(SERVER_URL + '/claimreceipts?token='+ val.token + '&id='+ this.id)
      data2 = this.http.get(SERVER_URL + '/claimreceipts?token=' + val.token + '&id='+ this.id);
      data2.subscribe(result2 => {
        for(let item of result2) {
          console.log(item)
          this.imagesO.push(SERVER_URL_WITHOUT_API + item.Web_Path)

        }
        console.log(this.imagesO);
      })

    });
  }

  Recall(){
    let loading = this.loadingCtrl.create({
      content: "Logging in...",
      spinner: 'crescent'
    });
    var arrid = [];
    this.items.forEach(function(value){
      arrid.push(value.Id)
    })
    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/recall?token=' + val.token, {
      // ClaimIds : arrid.join(','),
      Id : this.id
      },
      httpOptions)
      .subscribe(
        (res: any) =>{
          this.navCtrl.pop();
        console.log(res)
        this.toast.show(`Claim Recalled`, '5000', 'center').subscribe(
          toast => {
            console.log(toast);
          }
        );
      })
    });
  }

  gotoEdit(index, item) {
    this.storage.get("token").then((val) => {
      const confirm = this.alertCtrl.create({
        title: "Claim",
        message: "Click for button you want to pick",
        buttons: [
          {
            text: "Edit",
            handler: ()=>{
              this.navCtrl.push('ClaimeditPage',item)
              console.log(item)
            },

          },
          {
            text: "Delete",
            handler: () => {
              this.http
                .post(
                  SERVER_URL + "/deleteclaim?token=" + val.token,
                  {
                    ClaimId: item.Id,
                  },
                  httpOptions
                )
                .subscribe((res) => {
                  if (res == 1) {
                    // this.loadData();
                    this.items.splice(index, 1);

                    this.toast
                      .show(`Claim deleted`, "3000", "center")
                      .subscribe((toast) => {
                        // console.log(toast);
                      });
                  } else {
                    this.displayErrorAlert("Delete operation failed!");
                  }
                });
            },
          },
          {
            text: "Cancel",
            handler: () => {
              // console.log("no clicked");
            },
          },
        ],
      });
      confirm.present();
    });
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

  Submit() {
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
      spinner: "crescent",
    });
    var arrid = [];
    this.items.forEach(function (value) {
      arrid.push(value.Id);
    });
    this.storage.get("token").then((val) => {
      loading.present();
      return this.http
        .post(
          SERVER_URL + "/submitforapproval?token=" + val.token,
          {
            ClaimIds: arrid.join(","),
            Id: this.id,
          },
          httpOptions
        )
        .subscribe((res: any) => {
          loading.dismiss();

          if (res == 1) {
            this.events.publish("claim-submitted", []);
            this.navCtrl.pop();
            // this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
            this.toast
              .show("Claim Submitted", "5000", "center")
              .subscribe((toast) => {
                console.log(toast);
              });
          } else {
            this.displayErrorAlert("Error on submitting claims.");
          }

        },
        (err)=>{
          this.displayErrorAlert(err.error);
        }
        );
    });
  }

}
