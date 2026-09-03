import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
/**
 * Generated class for the CustomernewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dealform',
  templateUrl: 'dealform.html',
})
export class DealformPage {
  public signupform: FormGroup;

  Status:any = '';
  Deal_Name:any ='';
  CO_No:any ='';
  Business_Type:any ='';
  Priority:any = '';
  // Currency:any ='';
  Potential:any ='';
  Salesman:any ='';
  Company:any ='';
  Contact:any ='';
  Remarks:any ='';
  // Quo_No:any ='';
  // Quo_Date:any ='';
  // Quo_Amount:any ='';
  // Quo_Remarks:any ='';
  // PO_No:any='';
  // PO_Date:any='';
  // PO_Amount:any='';
  // PO_Remarks:any='';
  currency:any='';
  company:any=[];
  status:any=[];
  priority:any=[];
  contact:any=[];
  companyAgent:any=[];
  sales:any=[];
  apps: any;
  Project_Name:any='';
  next_deal_name: any="";
  co_no: any="";
  contactOptions: any;
  currentUserId: any;

  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    public http: HttpClient,
    private toast: ToastController,  
    public navParams: NavParams) {

    this.loadData();
  
  }

  loadData(){
    let data:Observable<any>;

    this.storage.get('user').then((val) => {
     this.currentUserId = val.UserId;
    });

    // Company
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getCompany?token=' + val.token );
      data.subscribe(result => {
        this.company = result;
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getStatus/?token=' + val.token );
      data.subscribe(result => {
        this.status = result.status
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getPriority/?token=' + val.token );
      data.subscribe(result => {
        this.priority = result.priority
      })
    });


    // Contact Person
    // this.storage.get('token').then((val) => {
    //   data = this.http.get('/getClient?token=' + val.token );
    //   data.subscribe(result => {
    //     this.contact = result.client
        
    //     // this.setContactOptions(this.company[0].Id)
    //   })
    // });

    // this.storage.get('token').then((val) => {
    //   data = this.http.get('/getClient/'+this.Company.Id+'?token=' + val.token );
    //   data.subscribe(result => {
    //     this.contact = result.client
      
    //     this.setContactOptions(this.company[0].Id)
    //   })
    // });
    

    // Currency
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getCurrency?token=' + val.token );
      data.subscribe(result => {
        this.currency = result.currency;
      })
    });

    // Salesman
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getdownline?token=' + val.token );
      data.subscribe(result => {
        this.sales = result;
      })
    });
  }


  setContactOptions(event: any) {
    let data:Observable<any>;

    const companyId = event.value.Id;
    this.Salesman = {}

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getClient/'+this.Company.Id+'?token=' + val.token );
      data.subscribe(result => {
        this.contact = result.client
      
      })

            this.http.post(SERVER_URL + '/getcompanyagent?token=' + val.token, { companyId: companyId })
                    .subscribe(
                      (data: any) => {
                        this.companyAgent = data.companyagent;

            if (this.currentUserId && this.companyAgent.length) {
              const matchedAgent = this.companyAgent.find(agent => agent.Id === this.currentUserId);
              if (matchedAgent) {
                this.Salesman = matchedAgent;
              }
            }
          },
          err => {
            console.error('Error getting company agent:', err);
            // this.Deal_Name = '';
          }
        )
      

        this.http.post(SERVER_URL + '/get-next-deal-name?token=' + val.token, { companyId: companyId })
                .subscribe(
                  (data: any) => {
                    this.Deal_Name = data.next_deal_name;
                    this.CO_No = data.co_no;
          },
          err => {
            console.error('Error getting deal name:', err);
            this.Deal_Name = '';
            this.CO_No = '';
          }
        );
    });
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      // Department: new FormControl('',[Validators.required]),
      // Assign: new FormControl('', [Validators.required]),
      // Reasons: new FormControl('', [Validators.required]),
      Status: new FormControl('', []),
      Deal_Name: new FormControl('', [Validators.required]),
      CO_No: new FormControl('', [Validators.required]),
      Remarks: new FormControl('', []),
      Project_Name: new FormControl('',[]),
      Business_Type: new FormControl('', [Validators.required]),
      Priority: new FormControl('',[]),
      Potential: new FormControl('', []),
      // Currency: new FormControl('', [Validators.required]),
      Salesman: new FormControl(''),
      Company: new FormControl('', [Validators.required]),
      Contact: new FormControl('', []),
      
      // Quo_Amount: new FormControl('', []),
      // Quo_Date: new FormControl('', []),
      // Quo_No: new FormControl('', []),
      // Quo_Remarks: new FormControl('', []),
      // PO_Amount: new FormControl('', []),
      // PO_Date: new FormControl('', []),
      // PO_No: new FormControl('', []),
      // PO_Remarks: new FormControl('', []),

    })
 }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DealformPage');
  }

  submit() {
    // let loading = this.loadingCtrl.create({
    //   content: "Submitting schedule application",
    //   spinner: 'crescent'
    // });

    if(this.Status==""){
      this.Status="New";
    }
  
    this.storage.get('token').then((val) => {
      return this.http.post(SERVER_URL + '/newDeal2?token=' + val.token, {
        Deal_Name:this.Deal_Name,
        CO_No:this.CO_No,
        Project_Name: this.Project_Name,
        status: this.Status,
        Business_Type: this.Status,
        Priority: this.Priority,
        Potential: this.Potential,
        // currency: this.Currency,
        // PO_No: this.PO_No,
        // PO_Date: this.PO_Date,
        // PO_Amount: this.PO_Amount,
        // PO_Remarks: this.PO_Remarks,
        // Quotation_No: this.Quo_No,
        // Quotation_Date: this.Quo_Date,
        // Quotation_Amount: this.Quo_Amount,
        // Quotation_Remarks: this.Quo_Remarks,
        companyId: this.Company.Id,
        clientid: this.Contact,
        Remarks: this.Remarks,
        UserId: this.Salesman.Id
      },
        httpOptions)
      .subscribe(
        (res: any) =>{
          this.navCtrl.popTo(this.navCtrl.getByIndex(this.navCtrl.length()-3));
          let toast = this.toast.create({
            message: "New Deal created",
            position: "middle",
            closeButtonText: "Ok",
            showCloseButton: true,
            cssClass: "red",
          });

          toast.present();
      })
    });
  }

  cancel(){
    this.navCtrl.pop();
  }

}

