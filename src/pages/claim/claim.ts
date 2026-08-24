import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-claim',
  templateUrl: 'claim.html',

})

export class ClaimPage {

  addclaim = 'AddclaimPage';
  tab1:any;
  tab2:any;
  tab3:any;
  tab4:any;
  tab5:any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams
  )
  {
    this.tab1 = 'ClaimpendingPage';
    this.tab2 = 'ClaimapprovedPage';
    this.tab3 = 'ClaimrecallPage';
    this.tab4 = 'ClaimrejectedPage';
    this.tab5 = 'ClaimcancelledPage';
  }


}
