import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  LoadingController,
  IonicPage,
} from "ionic-angular";
import { App } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
  }),
};
import { Toast } from "@ionic-native/toast";
import { SERVER_URL, SERVER_URL_WITHOUT_API } from "../../environment";

@IonicPage()
@Component({
  selector: "page-claimapproveddetails",
  templateUrl: "claimapproveddetails.html",
})
export class ClaimapproveddetailsPage {
  private ClaimSheetId: any;
  public items: any;
  private token: string = "";
  private id: any;
  public barangs: any;
  public Claim_Sheet_Name: string;
  public Status: string;
  public Total_Amount: any = "0";
  public Total_Advance: any = "0";
  public Total_Payable: any = "0";
  public Claim_Object: any;
  public Total_Expenses: number = 0;
  imagesO = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    public http: HttpClient,
    private toast: Toast,
    public loadingCtrl: LoadingController,
    private storage: Storage
  ) {
    this.id = this.navParams.get("Id");

    this.Claim_Object = { Id: this.id };
    this.ClaimSheetId = this.navParams.get("ClaimSheetId");
    this.Claim_Sheet_Name = this.navParams.get("Claim_Sheet_Name");
    this.Status = this.navParams.get("Status");
  }

  ionViewDidEnter() {
    this.loadData();
  }

  loadData() {
    this.Total_Advance = 0;
    this.Total_Amount = 0;
    this.Total_Payable = 0;
    this.imagesO = [];

    let data: Observable<any>;
    let data2: Observable<any>;

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getclaims2?token=" +
          val.token +
          "&id=" +
          this.id
      );
      data.subscribe((result) => {
        this.Total_Advance = result.totalAdvanceRequest;

        this.items = result.myclaimdetail;
        for (let item of this.items) {
          this.Total_Amount = Number(
            Number(this.Total_Amount) + Number(item.Total_Expenses)
          ).toFixed(2);

        }
        this.Total_Payable = Number(
          Number(this.Total_Amount) - Number(this.Total_Advance)
        ).toFixed(2);
      });
      data2 = this.http.get(
        SERVER_URL + "/claimreceipts?token=" +
          val.token +
          "&id=" +
          this.id
      );
      data2.subscribe((result2) => {
        for (let item of result2) {
          this.imagesO.push(SERVER_URL_WITHOUT_API + item.Web_Path);
        }
      });
    });
  }

  Recall() {
    let loading = this.loadingCtrl.create({
      content: "Logging in...",
      spinner: "crescent",
    });
    var arrid = [];
    this.items.forEach(function (value) {
      arrid.push(value.Id);
    });
    this.storage.get("token").then((val) => {
      return this.http
        .post(
          SERVER_URL + "/recall?token=" + val.token,
          {
            Id: this.id,
          },
          httpOptions
        )
        .subscribe((res: any) => {
          this.navCtrl.pop();
          this.toast
            .show(`Claim Recalled`, "5000", "center")
            .subscribe((toast) => {});
        });
    });
  }
}
