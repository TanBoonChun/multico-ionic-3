import { Component } from "@angular/core";
import { NavController, NavParams, App, Platform } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { IonicImageLoader } from "ionic-image-loader";
import { File } from "@ionic-native/file";
import { DocumentViewer } from "@ionic-native/document-viewer";
import { FileTransfer, FileTransferObject } from "@ionic-native/file-transfer";
import { FileOpener } from "@ionic-native/file-opener";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera } from "@ionic-native/camera";
import { AlertController } from "ionic-angular";
import { LogisticinventorybagdetPage } from "../logisticinventorybagdet/logisticinventorybagdet";
import { SERVER_URL } from "../../environment";
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};

// import { GensethistorydetailsPage } from '../gensethistorydetails/gensethistorydetails';

/**
 * Generated class for the GensethistoryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-logisticinventorybag",
  templateUrl: "logisticinventorybag.html",
})
export class LogisticinventorybagPage {
  LogisticinventorybagdetPage = LogisticinventorybagdetPage;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public ionicImageLoader: IonicImageLoader,
    private document: DocumentViewer,
    private file: File,
    private transfer: FileTransfer,
    private platform: Platform,
    private alertCtrl: AlertController,
    private fileOpener: FileOpener
  ) {
    this.loadData();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad GensethistoryPage");
  }

  loadData() {
    let data: Observable<any>;

    // Or to get a key/value pair
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/serviceticket/getItemInv?token=" +
          val.token
      );
      data.subscribe((result) => {
        this.items = result;
      });
    });
  }

  items: any[] = [
    {
      Balance: 9,
      InvId: 1223,
      model: "CA6DL2-30D",
      capacity: "250KVA",
      Id: 1223,
      name: "SC834",
      barcode: "SC834",
    },
    {
      Balance: 2,
      InvId: 2639,
      model: "F1L",
      capacity: "",
      Id: 2639,
      name: "DC ALTERNATOR",
      barcode: "F1L0118",
    },
    {
      Balance: 2,
      InvId: 2137,
      model: "4DX23 , CA6DF2 , CA6DL2 , BF4M , BF6M",
      capacity: "",
      Id: 2137,
      name: "ANLY AHC4N 24VDC RELAY",
      barcode: "EH0001",
    },
    {
      Balance: 5,
      InvId: 1233,
      model: "CA6DF2",
      capacity: "",
      Id: 1233,
      name: "CA6DF2 CAMSHAFT GEAR",
      barcode: "CA6DF20004",
    },
    {
      Balance: 3,
      InvId: 1234,
      model: "CA6DF2",
      capacity: "",
      Id: 1234,
      name: "CA6DF2 THRUST WASHER",
      barcode: "CA6DF20005",
    },
    {
      Balance: 1,
      InvId: 2743,
      model: "ALL MODEL",
      capacity: "",
      Id: 2743,
      name: "ATS CONNECTED SOCKET",
      barcode: "ATS002",
    },
    {
      Balance: 1,
      InvId: 2703,
      model: "HARDWARE",
      capacity: "",
      Id: 2703,
      name: "1.5MM GASKET PAPER",
      barcode: "GST00352",
    },
    {
      Balance: 1,
      InvId: 2254,
      model: "F1L , F2L , F3L , 4JB1 , 4DW91 , 4DX23 , KM385B",
      capacity: "",
      Id: 2254,
      name: "DIODE B SMALL (DOWN-RED)",
      barcode: "EH0118",
    },
    {
      Balance: 4,
      InvId: 1230,
      model: "CA6DF2",
      capacity: "",
      Id: 1230,
      name: "CA6DF2 WATER PUMP",
      barcode: "CA6DF20001",
    },
    {
      Balance: 1,
      InvId: 1960,
      model: "F2L",
      capacity: "",
      Id: 1960,
      name: "Breathe Box",
      barcode: "F2L0074",
    },
    {
      Balance: 3,
      InvId: 1279,
      model: "CA6DF2",
      capacity: "",
      Id: 1279,
      name: "CA6DF2 ENGINE OIL FILTER ADAPTER",
      barcode: "CA6DF20050",
    },
    {
      Balance: 1,
      InvId: 1969,
      model: "F2L",
      capacity: "",
      Id: 1969,
      name: "OIL FILTER FO-1630",
      barcode: "9551680000000",
    },
    {
      Balance: 1,
      InvId: 1929,
      model: "F2L",
      capacity: "",
      Id: 1929,
      name: "Main Bearing 0.00",
      barcode: "F2L0043",
    },
    {
      Balance: 1,
      InvId: 1278,
      model: "CA6DF2",
      capacity: "",
      Id: 1278,
      name: "CA6DF2 THERMOSTAT",
      barcode: "CA6DF20049",
    },
    {
      Balance: 1,
      InvId: 1426,
      model: "4DW91",
      capacity: "",
      Id: 1426,
      name: "Oil Cap",
      barcode: "4DW910036",
    },
    {
      Balance: 1,
      InvId: 1896,
      model: "F2L",
      capacity: "",
      Id: 1896,
      name: "Inlet Valve (1 line)",
      barcode: "F2L0010",
    },
  ];
}
