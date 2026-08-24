import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { App, ViewController, Events } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { AddclaimPage } from '../addclaim/addclaim';
import { SERVER_URL } from '../../environment';


@IonicPage()
@Component({
  selector: "page-claimrecall",
  templateUrl: "claimrecall.html",
})
export class ClaimrecallPage {
  claimrecalldetails = 'ClaimrecalldetailsPage';
  public items: any = [];
  private token: string = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public popoverCtrl: PopoverController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private events: Events
  ) {
    this.events.subscribe("claim-submitted", () => {
      this.loadData();
    });
  }

  ionViewWillUnload() {
    this.events.unsubscribe("claim-submitted");
  }

  ionViewWillEnter() {
    this.loadData();

  }

  gotoPage(item) {
    let nav = this.app.getRootNav();
    nav.push(this.claimrecalldetails, item);
  }

  doRefresh(refresher) {
    this.loadData();
    setTimeout(() => {
      refresher.complete();
    }, 800);
  }

  loadData() {
    let data: Observable<any>;

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getclaimsheet?token=" + val.token
      );
      data.subscribe((result) => {
        this.items = [];

        for (let res of result) {
          if (res.Status.indexOf("Recalled") >= 0) {
            this.items.push(res);
          }
        }
      });
    });
  }
}
