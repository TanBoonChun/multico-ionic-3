import { Component, ChangeDetectorRef } from "@angular/core";
import {
  NavController,
  NavParams,
  ToastController,
  ViewController,
  IonicPage,
} from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { DomSanitizer } from "@angular/platform-browser";
import { AlertController } from "ionic-angular";

import { FormControl, FormGroup, Validators } from "@angular/forms";
import { SERVER_URL } from "../../environment";

@IonicPage()
@Component({
  selector: "page-stoformnew",
  templateUrl: "stoformnew.html",
})
export class StoformnewPage {
  public signupform: FormGroup;
  public Site_Name: any = "";

  newStartDate: any;
  newEndDate: any;
  newAccomodation: any;
  newTolls: any = "";
  newTransportation: any = "";
  newOther: any = "";
  PartnerName: any;
  TotalDate: any = "";
  NoPartner: any;
  Purpose: any;
  Project_Code: any;
  SiteId: any;
  Remarks: any = "";
  radio: any;

  Material: any;
  Unit: any;
  Quantity: any;
  Condition: any;
  SerialNo: any;

  newMaterial: any = "";
  newUnit: any = "";
  newQuantity: any = "";
  newCondition: any = "";
  newSerialNo: any = "";

  inventories: any;
  inventories2: any;
  apps: any;
  asd: any;
  condition: any;
  inputRowValues = [{ SerialNo: "" }];
  // serialnos:any;

  public anArray: any = [];
  data: any;

  Ownership: any = "";
  Segment: any = "";
  bom_no: any = "";
  mm_no: any = "";
  Available: any = "";

  convert: any = "";
  total: any = "";
  available: any = "";
  Warehouse: any = "";

  d: any = "";

  constructor(
    public navCtrl: NavController,
    private toastCtrl: ToastController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    private viewCtrl: ViewController,
    public http: HttpClient,
    private storage: Storage,
    private cdr: ChangeDetectorRef,
    public loadingCtrl: LoadingController
  ) {
    this.Material = this.navParams.get("newMaterial");
    this.Quantity = this.navParams.get("newQuantity");
    this.Unit = this.navParams.get("newUnit");
    this.Condition = this.navParams.get("newCondition");
    this.SerialNo = this.navParams.get("newAnArray");

    this.Ownership = this.navParams.get("ownership");
    this.Segment = this.navParams.get("segment");
    this.Warehouse = this.navParams.get("warehouse");

    let data: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/receiving?token=" + val.token
      );
      data.subscribe((result) => {
        this.condition = result.conditions;
      });
    });

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getMaterial?token=" +
          val.token +
          "&ownership=" +
          this.Ownership +
          "&segment=" +
          this.Segment +
          "&warehouse=" +
          this.Warehouse
      );
      data.subscribe((result) => {
        this.inventories = result.zati;
        this.inventories2 = result.zati;
      });
    });
  }

  changeConvert() {
    if (this.Quantity > 0 && this.Unit.id.indexOf("[Unit]") !== -1) {
      this.convert = 1;

      this.total = this.Quantity * this.convert;

      return this.total;
    }

    if (this.Quantity > 0 && this.Unit.id.indexOf("[Unit ]") !== -1) {
      this.convert = 1;

      this.total = this.Quantity * this.convert;

      return this.total;
    }

    if (this.Quantity > 0 && this.Unit.id.indexOf("[BundleUnit]") !== -1) {
      this.total = this.Quantity * (this.convert || 1);

      return this.total;
    }

    if (this.Unit != null && this.Quantity == null) {
      this.displayErrorAlert("Must insert quantity first");
      return (this.Unit = null);
    }

  }

  goTo() {
    this.data = true;
  }
  Add() {
    this.anArray.push({ value: "" });
  }

  changeUnit($event) {
    if (!$event) {
      return;
    }

    this.bom_no = $event.bom_no;
    this.mm_no = $event.mm_no;
    this.available = $event.Quantity;
    this.convert = $event.convert;

    for (let item of this.inventories2) {
      if (item.Id == $event.Id) {
        var b = item.buncon.split(",");
        var c = [];
        b.forEach(function (ele) {
          if (ele) {
            c.push({ id: ele, unit: item.Unit });
          }
        });
        this.asd = c;
        break;
      }
    }
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Material: new FormControl("", [Validators.required]),
      Unit: new FormControl("", [Validators.required]),
      Quantity: new FormControl("", [Validators.required]),
    });
  }

  noSpace(string) {
    this.Site_Name = string.split(" ").join("");
    return string.split(" ").join("");
  }

  setRemarks(event) {
    let remarksControl = this.signupform.get("Remarks");

    if (Number.parseFloat(event) > 0) {
      remarksControl.setValidators([Validators.required]);
      remarksControl.updateValueAndValidity();
    }

    remarksControl.setValidators(null);
    remarksControl.updateValueAndValidity();
  }

  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    var day = ("0" + d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + "-" + monthNames[monthIndex] + "-" + year;
  }

  clickme() {
    this.inputRowValues.push({ SerialNo: "" });
    this.cdr.detectChanges();
  }

  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: "Exit",
      message: "Are you sure to exit the page? The items would not be saved",
      buttons: [
        {
          text: "No",
          handler: () => {},
        },
        {
          text: "Yes",
          handler: () => {
            this.viewCtrl.dismiss();
          },
        },
      ],
    });
    confirm.present();
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
    });

    toast.present();
    toast.dismiss();
  }

  setPurpose(event) {
    let purposeControl = this.signupform.get("Purpose");

    if (Number.parseFloat(event) > 0) {
      purposeControl.setValidators([Validators.required]);
      purposeControl.updateValueAndValidity();
    }

    purposeControl.setValidators(null);
    purposeControl.updateValueAndValidity();
  }

  isObject(variable) {
    return typeof variable === "object";
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  submit() {
    if (parseFloat(this.Quantity) > parseFloat(this.available)) {
      this.displayErrorAlert("Insufficient balance");
      return;
    }

    if (!this.Quantity) {
      this.displayErrorAlert("Must insert quantity");
      return;
    }

    if (this.Unit.id == "[BundleUnit]") {
      var d = " ";

      this.d = d;
    } else {
      var c = "Unit";

      this.d = c;
    }

    this.storage.get("token").then((val) => {
      let data = {
        newMaterial: this.Material,
        newBoomNo: this.Material.bom_no,
        newMMNo: this.Material.mm_no,
        newUnit: this.d,
        newQuantity: this.Quantity,
        newAvailable: this.available,
        newTotal: this.total,
      };
      this.viewCtrl.dismiss(data);
    });
  }

  displayErrorAlert(err) {
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }

  assign(a, b) {
  }
}
