import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

@IonicPage()
@Component({
  selector: "page-sto",
  templateUrl: "sto.html",
})
export class StoPage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  stoForm() {
    this.navCtrl.push('StoformPage');
  }

  stoStatus() {
    this.navCtrl.push('StostatusPage');
  }
}
