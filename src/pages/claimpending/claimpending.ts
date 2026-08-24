import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Events, IonicPage } from 'ionic-angular';
import { App, ViewController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';


@IonicPage()
@Component({
  selector: "page-claimpending",
  templateUrl: "claimpending.html",
})
export class ClaimpendingPage {
  claimpendingdetails = 'ClaimpendingdetailsPage';
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
    nav.push(this.claimpendingdetails, item);
  }
  doRefresh(refresher) {
    this.loadData();
    setTimeout(() => {
      refresher.complete();
    }, 800);
  }

  loadData() {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getclaimsheet?token=" + val.token
      );
      data.subscribe((result) => {
        this.items = [];
        for (let res of result) {
          if (res.Status.indexOf("Pending Submission") >= 0) {
            this.items.push(res);
          }
        }
      });
    });
  }
}
