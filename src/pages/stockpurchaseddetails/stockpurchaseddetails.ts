import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { StockpurchasedreceivePage } from '../stockpurchasedreceive/stockpurchasedreceive';

/**
 * Generated class for the StockpurchaseddetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-stockpurchaseddetails',
  templateUrl: 'stockpurchaseddetails.html',
})
export class StockpurchaseddetailsPage {

  StockpurchasedreceivePage = StockpurchasedreceivePage;

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

  constructor(public navCtrl: NavController, public navParams: NavParams) {
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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StockpurchaseddetailsPage');
  }

}
