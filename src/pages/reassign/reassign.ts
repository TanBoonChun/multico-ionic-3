import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { FormControl, FormGroup, Validators} from '@angular/forms';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HomePage } from '../home/home';
import { SERVER_URL } from '../../environment';
const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
}
/**
 * Generated class for the ReassignPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-reassign',
  templateUrl: 'reassign.html',
})
export class ReassignPage {

  Assign: any='';
  Reasons: any='';
  Id:any='';
  public signupform: FormGroup;
  UplineId: any;
  items: any;
  ClientId:any='';
  PIC_name:any='';
  PIC_no:any='';
  PIC_Email:any='';
  companyid:any='';
  Title:any='';
  Location:any='';
//   assign_to:any='';
  created_by:any='';
  Company_Name:any='';
  remarks:any='';
  appointment_date: any='';
  Time: any='';

  constructor(
    public navCtrl: NavController,
    private storage: Storage,
    private toast: ToastController,
    public alertCtrl: AlertController,
    public http: HttpClient,
    public loadingCtrl: LoadingController,
    public navParams: NavParams) {
      this.loadData();

      this.appointment_date=this.navParams.get('appointment_date')
      this.Id=this.navParams.get('Id2')
      this.Time=this.navParams.get('Time')
      this.ClientId=this.navParams.get('ClientId')
      this.PIC_name=this.navParams.get('PIC_name')
      this.PIC_no=this.navParams.get('PIC_no')
      this.PIC_Email=this.navParams.get('PIC_Email')
      this.companyid=this.navParams.get('companyid')
      this.Title=this.navParams.get('Title')
      this.Location=this.navParams.get('Location')
      // this.assign_to=this.navParams.get('assign_to')
      this.created_by=this.navParams.get('created_by')
      this.Company_Name=this.navParams.get('Company_Name')
      this.remarks=this.navParams.get('remarks')
      this.UplineId=this.navParams.get('uplineId')
      console.log(this.Id,'Id')
      console.log(this.ClientId,'ClientId')
      console.log(this.appointment_date,'appointment_date')
  }

  loadData(){

    let data:Observable<any>;

   // Or to get a key/value pair
   this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getdownline?token=' + val.token,{
            params:{
               UplineId:this.UplineId
            }
      });
      data.subscribe(result => {
            this.items = result;
      })
   });


  }

   ngOnInit() {
      this.signupform = new FormGroup({
        // Department: new FormControl('',[Validators.required]),
        Assign: new FormControl('', [Validators.required]),
        Reasons: new FormControl('', [Validators.required]),

      })
   }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ReassignPage');
  }

  assignTo() {

    const confirm = this.alertCtrl.create({
       title: 'Assign to members ?',
       message: 'Are you sure want to assign this ?',
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
             console.log(this.Assign,'asdasdada')
             console.log(this.Id,'ididididid')
 
             this.storage.get('token').then((val) => {
                this.http.post(SERVER_URL + '/reassignschedule?token=' + val.token, {
                  assign_to: this.Assign,
                   reason: this.Reasons,
                   scheduleid: this.Id,
                },
                   httpOptions)
                .subscribe(
                   (res: any) =>{
                   this.navCtrl.pop();
                  let toast = this.toast.create({
                     message: "Assigned Successful",
                     position: "middle",
                     closeButtonText: "Ok",
                     showCloseButton: true,
                     cssClass: "red",
                  });

                  toast.present();
                })
                // this.http.post('/notifications/updateleavepending?token=' + val.token, {TargetId: this.LeaveId}).subscribe(result => {
                //    console.log(result)
                //    console.log(this.LeaveId)
                // })
             });
             }
          }
       ]
    });
    confirm.present();          

      
 }

 cancel(){
   this.navCtrl.pop();
 }

}

