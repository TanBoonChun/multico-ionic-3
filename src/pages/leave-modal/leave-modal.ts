import { Component } from '@angular/core';
import { ViewController, NavParams, IonicPage } from 'ionic-angular';

/**
 * Generated class for the LeaveModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-leave-modal',
  templateUrl: 'leave-modal.html',
})
export class LeaveModalPage {
  public leavelist = [];
  public Leave_Period = [];
  public Leave_Type: string;

  constructor(public viewCtrl: ViewController, params: NavParams) {
     this.leavelist = params.get('leavelist');
     this.Leave_Type = params.get('leavetype');
     this.Leave_Period = params.get('Leave_Period');
     if (this.Leave_Period.length == 0) {
      if (this.Leave_Type == 'Maternity Leave' || this.Leave_Type == 'Hospitalization Leave') {
        this.leavelist.forEach((l, index) => {
          this.Leave_Period[index] = "Full";  
        });
      } else {
         if (this.Leave_Type != '1 Hour Time Off' && this.Leave_Type != '2 Hours Time Off') {
             this.leavelist.forEach((l, index) => {
                 if (l.Day_Type == 0 || l.Day_Type == 2 || l.Day_Type == -1) {
                   this.Leave_Period[index] = l.Period;  
                 } else {
                   this.Leave_Period[index] = "Full";  
                 }
             });          
         } else {
           this.leavelist.forEach((l, index) => {
             if (l.Day_Type == 0 || l.Day_Type == 2 || l.Day_Type == -1) {
               this.Leave_Period[index] = l.Period;  
             } else {
               this.Leave_Period[index] = this.Leave_Type == '1 Hour Time Off' ? '1 Hour' : '2 Hours';
             }
           }); 
         }
      }
     }    

     
     console.log(this.Leave_Type);
     console.log(this.leavelist);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LeavePeriodModalPage');
  }

  dismiss() {
    let data = { 'foo': 'bar', 'Leave_Period': this.Leave_Period };
    this.viewCtrl.dismiss(this.Leave_Period);
  }
}
