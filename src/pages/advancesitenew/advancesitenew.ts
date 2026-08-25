import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Observable } from 'rxjs';

/**
 * One line of an advance request, which is one job.
 *
 * An advance is asked for per job, so a line says which job, what the money is
 * for and how much - nothing else. The job is a service ticket, and it carries
 * the customer, the site and the project code the request is filed under, so
 * none of those are asked for again.
 */
@IonicPage()
@Component({
  selector: 'page-advancesitenew',
  templateUrl: 'advancesitenew.html',
})
export class AdvancesitenewPage {

  public signupform: FormGroup;

  Service_Ticket: any;
  serviceTickets: any[] = [];
  Purpose: any = "";
  Amount: any = "";
  Need_Advance: any = true;

  constructor(public navCtrl: NavController,
    private toastCtrl: ToastController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    private viewCtrl: ViewController,
    public http: HttpClient,
    private storage: Storage,
    private toast: Toast,
    public loadingCtrl: LoadingController) {
      this.Service_Ticket = this.navParams.get('Service_Ticket');
      this.Purpose = this.navParams.get('Purpose') ? this.navParams.get('Purpose') : "";
      this.Amount = this.navParams.get('Amount');
      // The amount is asked for by default, only a caller that says otherwise
      // turns it off
      this.Need_Advance = this.navParams.get('Need_Advance') === false ? false : true;

      // The job already picked has to be on the list for the picker to show it
      // as selected, and the list only arrives from the server afterwards.
      if (this.Service_Ticket) {
        this.serviceTickets = [this.Service_Ticket];
      }
    }


  ngOnInit() {
    this.signupform = new FormGroup({
      Service_Ticket: new FormControl("", [Validators.required]),
      Purpose: new FormControl("", [Validators.required]),
      Amount: new FormControl("", this.Need_Advance ? [Validators.required, Validators.min(0)] : []),
    });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.loadServiceTickets();
  }

  /**
   * The jobs an advance can be raised against. The search is done on the server
   * so a job further down than the first page can still be reached by typing
   * its number.
   */
  loadServiceTickets(search?: string, component?: IonicSelectableComponent) {
    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      let url = SERVER_URL + "/getadvanceserviceticket?token=" + val.token;

      if (search) {
        url += "&search=" + encodeURIComponent(search);
      }

      data = this.http.get(url);
      data.subscribe((result) => {
        this.serviceTickets = result && result.serviceTickets ? result.serviceTickets : [];

        if (component) {
          component.items = this.serviceTickets;
          component.endSearch();
        }
      },
      (err) => {
        console.log(err);

        if (component) {
          component.endSearch();
        }
      });
    });
  }

  searchServiceTickets(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim();

    event.component.startSearch();
    this.loadServiceTickets(text, event.component);
  }

  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: 'Exit',
      message: 'Are you sure to exit the page? The items would not be saved',
      buttons: [
        {
          text: 'No',
          handler: () => {
        }
        },
        {
          text: 'Yes',
          handler: () => {
            this.viewCtrl.dismiss();
          }
        }
      ]
    });
    confirm.present();
  }

  newcalculateTotal() {
    if (!this.Need_Advance) {
      return "0";
    }

    var total = Number.parseFloat(this.Amount);

    if (isNaN(total)) {
      total = 0;
    }

    return total.toFixed(2);
  }

  presentToastOut() {
    let toast = this.toastCtrl.create({
      message: "No negative value (-)",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "red",
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
    toast.dismiss();
  }

  isObject(variable) {
    return typeof variable === "object";
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  submitClaim() {

    if (!this.Service_Ticket) {
      this.displayErrorAlert("Please select the job");
      return;
    }

    if (this.Purpose == "") {
      this.displayErrorAlert("Purpose cannot be blank");
      return;
    }

    if (this.Need_Advance && Number.parseFloat(this.newcalculateTotal()) <= 0) {
      this.displayErrorAlert("Amount cannot be 0");

      return;
    }

    let data = {
      ServiceTicketId: this.Service_Ticket.Id,
      // Kept alongside the Id so the list on the form can name the job without
      // asking the server for it again.
      Service_Ticket: this.Service_Ticket,
      Purpose: this.Purpose,
      Amount: this.Need_Advance ? this.newcalculateTotal() : "0",
      Total_Requested: this.newcalculateTotal(),
    };

    this.viewCtrl.dismiss(data);
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
