import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, ToastController, LoadingController } from 'ionic-angular';
// import { CallNumber } from '@ionic-native/call-number';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClientnewPage } from '../clientnew/clientnew';
import { CustomerupdatePage } from '../customerupdate/customerupdate';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the CustomerdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}


@IonicPage()
@Component({
  selector: 'page-customerdetails',
  templateUrl: 'customerdetails.html',
})
export class CustomerdetailsPage {

  Id:any;
  Company_Name:any;
  Company_Code:any;
  CO_No:any;
  Contact_No:any;
  Status:any;
  Address:any;
  Email:any;
  Office_No:any;
  Fax_No:any;
  Remarks:any;
  PIC_name:any;
  PIC_no:any;
  Country:any;
  StateRegion:any;
  Type:any;
  custom_type:any;
  lead_from:any;

  items:any='';

  showAgentModal: boolean = false;
  showRemoveAgentModal: boolean = false;
  agents: any[] = [];
  filteredAgents: any[] = [];
  searchTerm: string = '';

  department: any='';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public http: HttpClient,
    // private callNumber: CallNumber,
    public loadingCtrl: LoadingController,
    private toast: ToastController,
    public alertCtrl: AlertController,
    private storage: Storage,
    public app: App,
    

  ) {
    this.Id=this.navParams.get('Id');
    this.Company_Name=this.navParams.get('Company_Name');
    this.Company_Code=this.navParams.get('Company_Code');
    this.CO_No=this.navParams.get('CO_No');
    this.Contact_No=this.navParams.get('Contact_No');
    this.Country=this.navParams.get('Country');
    this.StateRegion=this.navParams.get('StateRegion');
    this.Type=this.navParams.get('Type');
    this.custom_type=this.navParams.get('custom_type');
    this.lead_from=this.navParams.get('Source');
    this.Status=this.navParams.get('Status');
    this.Address=this.navParams.get('Address');
    this.Email=this.navParams.get('Email');
    this.Office_No=this.navParams.get('Office_No');
    this.Fax_No=this.navParams.get('Fax_No');
    this.Remarks=this.navParams.get('Remarks');
    this.PIC_name=this.navParams.get('PIC_name');
    this.PIC_no=this.navParams.get('PIC_no');
    this.department=this.navParams.get('department');

    console.log('Id',this.Id);

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerdetailsPage');

    
  }

  ionViewWillEnter(){
    let data:Observable<any>;

    //Client
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getclientdetails2/'+this.Company_Name+'?token=' + val.token );
      data.subscribe(result => {
        this.items = result;
      })
    });
  }

  // callSupport(): void{
  //   this.callNumber.callNumber(this.Office_No,true);
  // }

  newclient() {
    this.navCtrl.push('ClientnewPage',{Company_Name:this.Company_Name,companyId:this.Id});
  }

  addAgent() {
      this.loadAgents();
      this.showAgentModal = true;
    }
  
    filterAgents() {
      if (!this.searchTerm.trim()) {
        this.filteredAgents = [...this.agents];
        return;
      }
  
      this.filteredAgents = this.agents.filter(agent => 
        agent.Name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  
    loadAgents() {
      let loading = this.loadingCtrl.create({
        content: "Loading agents..."
      });
      loading.present();
  
      this.storage.get('token').then((val) => {
        this.http.get(SERVER_URL + '/getAgents?token=' + val.token)
          .subscribe(
            (result: any) => {
              loading.dismiss();
              this.agents = result;
              this.filteredAgents = [...this.agents];
            },
            (error) => {
              loading.dismiss();
              this.showToast('Error loading agents');
            }
          );
      });
    }
  
    selectAgent(agent: any) {
      let loading = this.loadingCtrl.create({
        content: "Adding agent to deal..."
      });
      loading.present();
  
      this.storage.get('token').then((val) => {
        this.http.post(SERVER_URL + '/assignAgent?token=' + val.token, {
          companyId: this.Id,
          agentId: agent.Id,
          agentName: agent.Name
        }, httpOptions)
        .subscribe(
          (res: any) => {
            console.log(res);
            loading.dismiss();
            if (res.success || res == 1) {
              this.showToast(`${agent.Name} has been assigned to this deal`);
              this.closeAgentModal();
              // Optionally refresh deal details
              this.ionViewWillEnter();
            } else {
              this.showToast('Error assigning agent');
            }
          },
          (error) => {
            loading.dismiss();
            console.log(error)
            this.showToast('Error assigning agent');
          }
        );
      });
    }
  
    removeAgent() {
      this.loadAssignedAgent();
      this.showRemoveAgentModal = true;
    }
  
    loadAssignedAgent() {
      let loading = this.loadingCtrl.create({
        content: "Loading agents..."
      });
      loading.present();
  
      this.storage.get('token').then((val) => {
        this.http.get(SERVER_URL + '/getAssignedAgent?token=' + val.token + '&companyId=' + this.Id)
          .subscribe(
            (result: any) => {
              loading.dismiss();
              this.agents = result;
            },
            (error) => {
              loading.dismiss();
              this.showToast('Error loading agents');
            }
          );
      });
    }
  
    selectRemoveAgent(agent: any) {
      let loading = this.loadingCtrl.create({
        content: "Removing agent from deal..."
      });
      loading.present();
  
      this.storage.get('token').then((val) => {
        this.http.post(SERVER_URL + '/removeAgent?token=' + val.token, {
          companyId: this.Id,
          agentId: agent.Id,
          agentName: agent.Name
        }, httpOptions)
        .subscribe(
          (res: any) => {
            console.log(res);
            loading.dismiss();
            if (res.success || res == 1) {
              this.showToast(`${agent.Name} has been rmeoved from this deal`);
              this.closeRemoveAgentModal();
              // Optionally refresh deal details
              this.ionViewWillEnter();
            } else {
              this.showToast('Error removing agent');
            }
          },
          (error) => {
            loading.dismiss();
            console.log(error)
            this.showToast('Error removing agent');
          }
        );
      });
    }
  
    closeAgentModal() {
      this.showAgentModal = false;
      this.searchTerm = '';
      this.agents = [];
      this.filteredAgents = [];
    }
  
    closeRemoveAgentModal() {
      this.showRemoveAgentModal = false;
      this.searchTerm = '';
      this.agents = [];
    }
  
    private showToast(message: string) {
      let toast = this.toast.create({
        message: message,
        duration: 3000,
        position: 'middle'
      });
      toast.present();
    }

  gotoEdit(){
    const confirm = this.alertCtrl.create({
      title: 'Do you want to update?',
      message: '',
      buttons: [
        {
          text: 'Update',
          handler: () => {
            let nav = this.app.getRootNav();
            nav.push('CustomerupdatePage',{
              Id:this.Id,
              Company_Name:this.Company_Name,
              Company_Code:this.Company_Code,
              Contact_No:this.Contact_No,
              Country:this.Country,
              StateRegion:this.StateRegion,
              Type:this.Type,
              custom_type:this.custom_type,
              lead_from:this.lead_from,
              CO_No:this.CO_No,
              Status:this.Status,
              Address:this.Address,
              Email:this.Email,
              Office_No:this.Office_No,
              Fax_No:this.Fax_No,
              Remarks:this.Remarks,
              PIC_name:this.PIC_name,
              PIC_no:this.PIC_no
            })
          }
        },
        {
          text: 'Cancel',
          handler:() => {
            console.log('no clicked')
          }
        }
      ]
    });
    confirm.present();
  }
}

