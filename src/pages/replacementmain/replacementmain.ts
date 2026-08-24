import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";


@IonicPage()
@Component({
  selector: "page-replacementmain",
  templateUrl: "replacementmain.html",
})
export class ReplacementmainPage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ReplacementList() {
    this.navCtrl.push('ReplacementlistPage');
  }

  TechBag() {
    this.navCtrl.push('TechbagPage');
  }
}
