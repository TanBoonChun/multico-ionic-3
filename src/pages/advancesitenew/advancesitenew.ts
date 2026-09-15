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
 * One line of an advance request, which is one trip.
 *
 * A line says which jobs the trip is made for, what the money is for and how
 * much - nothing else. A job is a service ticket, and it carries the customer,
 * the site and the project code the request is filed under, so none of those
 * are asked for again.
 *
 * A trip is often made for several jobs at once, so the line takes as many as
 * it is made for, and none at all when the money is not for a job (buying parts
 * off the shelf, say) - what the money is for is said in the purpose instead.
 *
 * The money is asked for split by kind rather than as one figure, so the
 * approver can see what he is paying for, and the line is paid on what the
 * parts add up to.
 */
@IonicPage()
@Component({
  selector: 'page-advancesitenew',
  templateUrl: 'advancesitenew.html',
})
export class AdvancesitenewPage {

  public signupform: FormGroup;

  Service_Tickets: any[] = [];
  serviceTickets: any[] = [];
  Purpose: any = "";
  Need_Advance: any = true;

  /**
   * Whether this line is for a job.
   *
   * A job line names the service tickets the trip covers and splits the money
   * by kind, so the approver can see what he is paying for. A line that is not
   * for a job - buying parts off the shelf, say - has neither: it says what it
   * is for in the purpose and asks for one figure.
   *
   * Ticked by default, because that is what a line was before the tick box
   * existed and what most of them are.
   */
  Job_Related: boolean = true;

  /**
   * The single figure a line that is not for a job asks for. It is stored as
   * Others, which is the column the server already puts an unsplit amount in.
   */
  Unsplit_Amount: any = "";

  /**
   * What the money is split into, in the order it is asked for. The keys are
   * the columns the server stores the amounts in, so the line goes up as it is.
   */
  breakdownFields: any[] = [
    { key: "Allowance", label: "Meal Allowance" },
    { key: "Accomodation", label: "Accomodation / Hotel" },
    { key: "Transportation", label: "Transportation (Mileage / Petrol / Fare)" },
    { key: "Toll", label: "Toll / Parking" },
    { key: "Other", label: "Others" },
  ];

  amounts: any = {};

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
      this.Service_Tickets = this.navParams.get('Service_Tickets') ? this.navParams.get('Service_Tickets') : [];
      this.Purpose = this.navParams.get('Purpose') ? this.navParams.get('Purpose') : "";
      // The amount is asked for by default, only a caller that says otherwise
      // turns it off
      this.Need_Advance = this.navParams.get('Need_Advance') === false ? false : true;

      // A line raised before the tick box existed carries no flag and is a job
      // line, which is what it was.
      this.Job_Related = this.navParams.get('Job_Related') === false ? false : true;

      let amounts = this.navParams.get('Amounts');

      this.breakdownFields.forEach((field) => {
        this.amounts[field.key] = amounts && amounts[field.key] ? amounts[field.key] : "";
      });

      // An unsplit line stored its figure as Others, so that is where it is
      // read back from.
      if (!this.Job_Related) {
        this.Unsplit_Amount = amounts && amounts["Other"] ? amounts["Other"] : "";
      }

      // The jobs already picked have to be on the list for the picker to show
      // them as selected, and the list only arrives from the server afterwards.
      if (this.Service_Tickets.length) {
        this.serviceTickets = this.Service_Tickets.slice();
      }
    }


  ngOnInit() {
    // The job is not asked for - an advance is often raised for something that
    // is not a job at all, and the purpose says what it is for.
    this.signupform = new FormGroup({
      Service_Tickets: new FormControl(""),
      Purpose: new FormControl("", [Validators.required]),
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

        // A job already picked has to stay on the list, or the picker drops it
        // off the selection the moment the list is replaced.
        this.Service_Tickets.forEach((picked) => {
          let onList = this.serviceTickets.some((ticket) => ticket.Id === picked.Id);

          if (!onList) {
            this.serviceTickets.unshift(picked);
          }
        });

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

  /**
   * What the line adds up to, which is what it is requested and paid on. A
   * negative counts as nothing - the total can never come out below the parts.
   */
  newcalculateTotal() {
    if (!this.Need_Advance) {
      return "0";
    }

    // A line that is not for a job asks for one figure rather than a split, so
    // there is nothing to add up.
    if (!this.Job_Related) {
      let amount = Number.parseFloat(this.Unsplit_Amount);

      return !isNaN(amount) && amount > 0 ? amount.toFixed(2) : "0.00";
    }

    let total = 0;

    this.breakdownFields.forEach((field) => {
      let amount = Number.parseFloat(this.amounts[field.key]);

      if (!isNaN(amount) && amount > 0) {
        total += amount;
      }
    });

    return total.toFixed(2);
  }

  /** The total is shown as the split is keyed in. */
  recalculateTotal() {
    return this.newcalculateTotal();
  }

  /** The split as the server stores it, every kind present and never negative. */
  breakdownAmounts() {
    let amounts = {};

    this.breakdownFields.forEach((field) => {
      amounts[field.key] = 0;
    });

    if (!this.Need_Advance) {
      return amounts;
    }

    // Not for a job: one figure, stored as Others. That is the column the
    // server already puts an unsplit amount in (AdvanceService::breakdownFrom),
    // so the total it works out from the parts still comes to what was asked
    // for - a line whose parts were all zero would be paid nothing.
    if (!this.Job_Related) {
      let amount = Number.parseFloat(this.Unsplit_Amount);

      amounts["Other"] = !isNaN(amount) && amount > 0 ? Number(amount.toFixed(2)) : 0;

      return amounts;
    }

    this.breakdownFields.forEach((field) => {
      let amount = Number.parseFloat(this.amounts[field.key]);

      amounts[field.key] = !isNaN(amount) && amount > 0 ? Number(amount.toFixed(2)) : 0;
    });

    return amounts;
  }

  /**
   * Turning the tick box off drops the jobs and the split, so a line cannot
   * keep naming jobs it is no longer for, or carry a split nobody can see.
   * Turning it back on drops the single figure for the same reason.
   */
  onJobRelatedChange() {
    if (this.Job_Related) {
      this.Unsplit_Amount = "";

      return;
    }

    this.Service_Tickets = [];

    this.breakdownFields.forEach((field) => {
      this.amounts[field.key] = "";
    });
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

    if (this.Purpose == "") {
      this.displayErrorAlert("Purpose cannot be blank");
      return;
    }

    if (this.Need_Advance && Number.parseFloat(this.newcalculateTotal()) <= 0) {
      this.displayErrorAlert("Amount cannot be 0");

      return;
    }

    // A line that is not for a job names none, whatever was picked before the
    // tick box was turned off.
    let tickets = this.Job_Related && this.Service_Tickets ? this.Service_Tickets : [];

    let data = Object.assign(this.breakdownAmounts(), {
      ServiceTicketIds: tickets.map((ticket) => ticket.Id),
      // Kept alongside the Ids so the list on the form can name the jobs
      // without asking the server for them again.
      Service_Tickets: tickets,
      Purpose: this.Purpose,
      // Kept on the line so reopening it to edit shows the form it was raised
      // on rather than the default.
      Job_Related: this.Job_Related,
      Amount: this.Need_Advance ? this.newcalculateTotal() : "0",
      Total_Requested: this.newcalculateTotal(),
    });

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
