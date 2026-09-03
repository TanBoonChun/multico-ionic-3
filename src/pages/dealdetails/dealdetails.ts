import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, AlertController, LoadingController, ToastController, ModalController, Platform } from 'ionic-angular';
import { ScheduledetailsPage } from '../scheduledetails/scheduledetails';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { CallNumber } from '@ionic-native/call-number';
import { SchedulenewPage } from '../schedulenew/schedulenew';
import { DealupdatePage } from '../dealupdate/dealupdate';
import { AttachmentPage } from '../attachment/attachment';
import { SERVER_URL } from '../../environment';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { FileChooser } from '@ionic-native/file-chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FilePath } from '@ionic-native/file-path';
import { DomSanitizer } from '@angular/platform-browser';
import { File } from '@ionic-native/file';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

/**
 * Generated class for the DealdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-dealdetails',
  templateUrl: 'dealdetails.html',
})
export class DealdetailsPage {

  Id:any;
  Status:any;
  Lost_Cause:any;
  Lost_Remarks:any;
  Status_Details:any;
  Company_Name:any;
  Customer_Name:any;
  Contact_No:any;
  Email:any;
  Address:any;

   //added by Hau 20240328
   Created_at:any;
   Remarks:any;
   Priority:any;
   Potential:any;
   Award_Date:any;
   Delivery_Period:any;
   Forecast_Amount:any;
   Currency:any;
   Business_Type:any;
   Stage:any;
   Progress_Log:any;
   Support_Required:any;
   //added by Hau 20240328

  PO_No:any;
  PO_Date:any;
  PO_Amount:any;
  PO_Remarks:any;
  Quotation_No:any;
  Quotation_Date:any;
  Quotation_Amount:any;
  Quotation_Remarks:any;
  scheduleid:any;
  Deal_Name:any='';
  Id2:any='';
  data:any='';
  items:any='';
  s:any;
  details:any=[];
  scheduledetails = 'ScheduledetailsPage'

  UserId:any;
  ClientId:any;
  CompanyId:any;

  PIC_name:any;
  PIC_no:any;
  DealId:any;
  DealName:any;
  currency:any;
  Name:any;
  scheduleId:any;
  Project_Name:any;
  cold_call:any;
  has_schedule:any;
  has_agent:any;
  lead_from:any;
  Country:any;
  StateRegion:any;
  custom_type:any;

  showAgentModal: boolean = false;
  showRemoveAgentModal: boolean = false;
  agents: any[] = [];
  filteredAgents: any[] = [];
  searchTerm: string = '';
  Void_Remarks: any;
  department: any='';

  selectedFiles: any[] = []; // Store file objects with metadata
  fileBlobs: Blob[] = [];

  existingFiles: any[] = [];

  leadFiles: any[] = [];

  lostcauses: any[] = [];
  filteredCauses: any[] = [];
  showLostModal: boolean = false;

  selectedCause: string = '';
  lostRemarks: string = '';
  showVoidModal: boolean = false;
  voidRemarks: string = '';

  constructor(
    public navCtrl: NavController,
    public storage: Storage,
    public http: HttpClient, 
    public loadingCtrl: LoadingController,
    private toast: ToastController,    
    private app: App,
    private alertCtrl: AlertController,
    private filePicker: IOSFilePicker,
    private fileChooser: FileChooser,
    private fileOpener: FileOpener,
    private file: File,
    private filePath: FilePath,
    public domSanitizer: DomSanitizer,
    public modalCtrl: ModalController,
    public platform: Platform,
    public navParams: NavParams) {

      this.Id=this.navParams.get('DealId');
      console.log(this.navParams)
      this.Name=this.navParams.get('Name')
      this.Status=this.navParams.get('status');
      this.Lost_Cause=this.navParams.get('Lost_Cause');
      this.Lost_Remarks=this.navParams.get('Lost_Remarks');
      this.Status_Details=this.navParams.get('Status_Details');
      this.Company_Name=this.navParams.get('Company_Name');
      this.department=this.navParams.get('department');

      //added by Hau 20240328
      this.Created_at=this.navParams.get('Created_at')
      this.Remarks=this.navParams.get('Remarks')
      this.Priority=this.navParams.get('Priority')
      this.Potential=this.navParams.get('Potential')
      this.Award_Date=this.navParams.get('Award_Date')
      this.Delivery_Period=this.navParams.get('Delivery_Period')
      this.Forecast_Amount=this.navParams.get('Forecast_Amount')
      this.Business_Type=this.navParams.get('Type')
      this.Stage=this.navParams.get('Stage')
      this.Progress_Log=this.navParams.get('Progress_Log')
      this.Support_Required=this.navParams.get('Support_Required')
      this.cold_call=this.navParams.get('cold_call')
      this.has_schedule=this.navParams.get('has_schedule')
      this.has_agent=this.navParams.get('has_agent')
      this.lead_from=this.navParams.get('Source')
      this.Country=this.navParams.get('Country')
      this.StateRegion=this.navParams.get('StateRegion')
      this.custom_type=this.navParams.get('custom_type')
      //added by Hau 20240328

      this.PO_No=this.navParams.get('PO_No');
      this.PO_Date=this.navParams.get('PO_Date');
      this.PO_Amount=this.navParams.get('PO_Amount');
      this.PO_Remarks=this.navParams.get('PO_Remarks')
      this.Quotation_No=this.navParams.get('Quotation_No');
      this.Quotation_Date=this.navParams.get('Quotation_Date');
      this.Quotation_Amount=this.navParams.get('Quotation_Amount');
      this.Quotation_Remarks=this.navParams.get('Quotation_Remarks')

      this.scheduleid=this.navParams.get('scheduleid');
      this.Deal_Name=this.navParams.get('Deal_Name');
      this.Id2=this.navParams.get('DealId');
      this.PIC_name=this.navParams.get('PIC_name');
      this.PIC_no=this.navParams.get('PIC_no');
      this.currency=this.navParams.get('currency')
      this.scheduleId=this.navParams.get('scheduleId')
      this.Project_Name=this.navParams.get('Project_Name')
      this.s={
        Id:this.Id,
        Status:this.Status,
        Priority:this.Priority,
        Lost_Cause:this.Lost_Cause,
        Lost_Remarks:this.Lost_Remarks,
        Status_Details:this.Status_Details,
        Company_Name:this.Company_Name,
        PO_No:this.PO_No,
        PO_Date:this.PO_Date,
        PO_Amount:this.PO_Amount,
        PO_Remarks:this.PO_Remarks,
        Quotation_No:this.Quotation_No,
        Quotation_Date:this.Quotation_Date,
        Quotation_Amount:this.Quotation_Amount,
        Project_Name:this.Project_Name,
        scId:this.scheduleId,
        Id2:this.scheduleId
      }

    console.log(this.navParams)
      
  }

  doRefresh(refresher) {
    this.ionViewWillEnter();

    setTimeout(() => {
      refresher.complete();
    }, 3000);
  }

  ionViewWillEnter(){
    let data:Observable<any>;
    // Schedule
    // this.storage.get('token').then((val) => {
    //   data=this.http.get('/getSchedule/'+this.Id+'?token=' + val.token)
    //   data.subscribe(result => {
    //     this.items = result;
    //     // this.Id = this.scheduleid;
    //     console.log(result);
    //     console.log(this.items.Id)
    //   })
    // });

    // Schedule2
    this.storage.get('token').then((val) => {
      data=this.http.get(SERVER_URL + '/getSchedule/'+this.Id2+'?token=' + val.token)
      data.subscribe(result => {
        this.items = result;
        // this.Id = this.scheduleid;
        // console.log(result);
        // console.log('Id',this.items.Id)
      })
    });

    // Dealdetails
    // this.storage.get('token').then((val) => {
    //   data = this.http.get('/getdealdetail/'+this.Id+'?token=' + val.token );
    //   data.subscribe(result => {
    //     this.details = result;
    //   })
    // });

    // Dealdetails
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getdealdetail/'+this.Id2+'?token=' + val.token );
      data.subscribe(result => {
        this.details = result;
        
        this.Status={"Option": this.details[0].Status}
        this.Created_at=this.details[0].created_at
        this.Remarks=this.details[0].Remarks
        this.Priority={"Option": this.details[0].Priority}
        this.Potential=this.details[0].Potential
        this.Award_Date=this.details[0].Award_Date
        this.Delivery_Period=this.details[0].Delivery_Period
        this.Forecast_Amount=this.details[0].Forecast_Amount
        this.Currency=this.details[0].Currency
        this.Business_Type=this.details[0].Type
        this.custom_type=this.details[0].custom_type
        this.Stage=this.details[0].Stage
        this.Progress_Log=this.details[0].Progress_Log
        this.Support_Required=this.details[0].Support_Required
        this.cold_call=this.details[0].cold_call
        this.has_schedule=this.details[0].has_schedule
        this.has_agent=this.details[0].has_agent
        this.lead_from=this.details[0].Source
        this.Country=this.details[0].Country
        this.StateRegion=this.details[0].StateRegion
        this.Customer_Name=this.details[0].Customer_Name
        this.Contact_No=this.details[0].Contact_No
        this.Email=this.details[0].Email
        this.Address=this.details[0].Address
        this.Remarks=this.details[0].Remarks
        //added by Hau 20240328
  
        this.PO_No=this.details[0].PO_No
        this.PO_Date=this.details[0].PO_Date
        this.PO_Amount=this.details[0].PO_Amount
        this.PO_Remarks=this.details[0].PO_Remarks
        this.Quotation_No=this.details[0].Quotation_No
        this.Quotation_Date=this.details[0].Quotation_Date
        this.Quotation_Amount=this.details[0].Quotation_Amount
        this.Quotation_Remarks=this.details[0].Quotation_Remarks


        // console.log('details[0].PO_No',this.details[0].PO_No)
        // console.log('details[0].currency',this.details[0].currency)
      })
    });

    this.loadExistingFiles();
  }

  // ionViewDidLoad() {
  //   // console.log('ionViewDidLoad DealdetailsPage');
    
  // }

  // callSupport(): void{
  //   this.callNumber.callNumber(this.PIC_no,true);
  // }

  newschedule() {
    this.navCtrl.push('SchedulenewPage',{
      DealId:this.Id,
    });

  }

  loadExistingFiles() {
    this.storage.get('token').then((val) => {
      const data = this.http.get<any>(SERVER_URL + '/getCompanyFiles/' + this.Id + '?token=' + val.token);
      data.subscribe(result => {
        this.existingFiles = result.leadFiles || [];
        console.log('Existing files loaded:', this.existingFiles);
      }, error => {
        console.error('Error loading existing files:', error);
      });
    });
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


  filterCauses() {
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.filteredCauses = [...this.lostcauses];
      return;
    }

    this.filteredCauses = this.lostcauses.filter(cause => 
      cause.Option.toLowerCase().includes(this.searchTerm.toLowerCase())
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

  loadCauses() {
    let loading = this.loadingCtrl.create({
      content: "Loading..."
    });
    loading.present();

    this.storage.get('token').then((val) => {
      this.http.get(SERVER_URL + '/getLostCauses?token=' + val.token)
        .subscribe(
          (result: any) => {
            loading.dismiss();
            this.lostcauses = result;
            this.filteredCauses = [...this.lostcauses];
          },
          (error) => {
            loading.dismiss();
            this.showToast('Error loading lost causes');
          }
        );
    });
  }

  lostDeal(){
    this.loadCauses();
    this.showLostModal = true;
  }

  voidDeal(){
    this.showVoidModal = true;
  }

  submitLostCause() {
    if (!this.selectedCause) {
      this.showToast('Please select a lost cause');
      return;
    }

    // Validate remarks if Others is selected
    if (this.selectedCause === 'Others' && !this.lostRemarks.trim()) {
      this.showToast('Remarks are required when lost cause is "Others"');
      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Updating deal..."
    });
    loading.present();

    this.storage.get('token').then((val) => {
      this.http.post(SERVER_URL + '/updateLostDeal?token=' + val.token, {
        dealId: this.Id,
        Lost_Cause: this.selectedCause,
        Lost_Remarks: this.lostRemarks || ''
      }, httpOptions)
      .subscribe(
        (res: any) => {
          loading.dismiss();
          if (res.success || res == 1) {
            this.Lost_Cause = this.selectedCause;
            this.Lost_Remarks = this.lostRemarks;
            this.showToast(`Deal marked as lost: ${this.selectedCause}`);
            this.closeLostModal();
            // Refresh deal details
            this.ionViewWillEnter();
          } else {
            this.showToast('Error updating lost cause');
          }
        },
        (error) => {
          loading.dismiss();
          console.log(error);
          this.showToast('Error updating lost cause');
        }
      );
    });
  }

  submitVoidDeal() {
    if (!this.voidRemarks) {
      this.showToast('Please enter remarks');
      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Updating deal..."
    });
    loading.present();

    this.storage.get('token').then((val) => {
      this.http.post(SERVER_URL + '/updateVoidDeal?token=' + val.token, {
        dealId: this.Id,
        Void_Remarks: this.voidRemarks || ''
      }, httpOptions)
      .subscribe(
        (res: any) => {
          loading.dismiss();
          if (res.success || res == 1) {
            this.Void_Remarks = this.voidRemarks;
            this.showToast(`Deal marked as void`);
            this.closeVoidModal();
            // Refresh deal details
            this.ionViewWillEnter();
          } else {
            this.showToast('Error updating deal');
          }
        },
        (error) => {
          loading.dismiss();
          console.log(error);
          this.showToast('Error updating lost cause');
        }
      );
    });
  }

  closeLostModal() {
    this.showLostModal = false;
    this.selectedCause = '';
    this.lostRemarks = '';
  }
  
  closeVoidModal() {
    this.showVoidModal = false;
    this.voidRemarks = '';
  }

  selectAgent(agent: any) {
    let loading = this.loadingCtrl.create({
      content: "Adding agent to deal..."
    });
    loading.present();

    this.storage.get('token').then((val) => {
      this.http.post(SERVER_URL + '/assignAgent?token=' + val.token, {
        dealId: this.Id,
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
      this.http.get(SERVER_URL + '/getAssignedAgent?token=' + val.token + '&dealId=' + this.Id)
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
        dealId: this.Id,
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

  coldCall() {
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });
    loading.present();
      this.storage.get('token').then((val) => {
        return this.http.post(SERVER_URL + '/cold_call?token=' + val.token, {
          dealid: this.Id,
        },
          httpOptions)
        .subscribe(
          (res: any) =>{
            loading.dismiss();
  
            if(res==1){
  
              this.navCtrl.pop();
                let toast = this.toast.create({
                  message: "Done Cold Call",
                  position: "middle",
                  closeButtonText: "Ok",
                  showCloseButton: true,
                  cssClass: "red",
                });
  
                toast.present();
            }else{
              var obj = res;
              console.log(obj);
              var errormessage = "";
              for (var item in obj) {
                errormessage = obj[item][0];
              }
              // this.displayErrorAlert(errormessage);
                      
            }
        })

      });

  }

  removeColdCall() {
    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });
    loading.present();
      this.storage.get('token').then((val) => {
        return this.http.post(SERVER_URL + '/remove_cold_call?token=' + val.token, {
          dealid: this.Id,
        },
          httpOptions)
        .subscribe(
          (res: any) =>{
            loading.dismiss();
  
            if(res==1){
  
              this.navCtrl.pop();
                let toast = this.toast.create({
                  message: "Done Remove Cold Call",
                  position: "middle",
                  closeButtonText: "Ok",
                  showCloseButton: true,
                  cssClass: "red",
                });
  
                toast.present();
            }else{
              var obj = res;
              console.log(obj);
              var errormessage = "";
              for (var item in obj) {
                errormessage = obj[item][0];
              }
              // this.displayErrorAlert(errormessage);
                      
            }
        })

      });

  }

  gotoEdit(){

    let nav = this.app.getRootNav();
    nav.push('DealupdatePage',{
      Id:this.Id,
      Deal_Name:this.details[0].Deal_Name,
      Project_Name:this.details[0].Project_Name,
      Name:this.Name,
      Company_Name:this.Company_Name,
      Remarks:this.details[0].Remarks,
      PIC_name:this.PIC_name,
      PIC_no:this.details[0].PIC_no,
      Status:this.Status,

      Lost_Cause:this.details[0].Lost_Cause,
      Lost_Remarks:this.details[0].Lost_Remarks,

      Priority:this.Priority,
      Potential:this.details[0].Potential,
      Award_Date:this.details[0].Award_Date,
      Delivery_Period:this.details[0].Delivery_Period,
      Forecast_Amount:this.details[0].Forecast_Amount,
    
      Business_Type:this.details[0].Type,
      Stage:this.details[0].Stage,
      Progress_Log:this.details[0].Progress_Log,
      Support_Required:this.details[0].Support_Required,

      Quotation_No:this.details[0].Quotation_No,
      Quotation_Date:this.details[0].Quotation_Date,
      Quotation_Amount:this.details[0].Quotation_Amount,
      Quotation_Remarks:this.details[0].Quotation_Remarks,
      PO_No:this.details[0].PO_No,
      PO_Date:this.details[0].PO_Date,
      PO_Amount:this.details[0].PO_Amount,
      PO_Remarks:this.details[0].PO_Remarks,
      DealId:this.Id2,

      UserId:this.details[0].UserId,
      CompanyId:this.details[0].companyId,
      ClientId:this.details[0].clientId,
    })
  }
       

  attachment(type: string) {
    this.navCtrl.push('AttachmentPage',{
      dealId:this.Id,
      DealId:this.Id,
      Title:this.Deal_Name,
      Company_Name:this.Company_Name,
      Id:this.scheduleid,
      PO_Amount:this.PO_Amount,
      PO_Date:this.PO_Date,
      PO_No:this.PO_No,
      PO_Remarks:this.PO_Remarks,
      Quotation_Amount:this.Quotation_Amount,
      Quotation_Date:this.Quotation_Date,
      Quotation_No:this.Quotation_No,
      Quotation_Remarks:this.Quotation_Remarks,
      type: type

    });
    console.log(this.Id, type)
  }

  displayErrorAlert(err){
    console.log(err);
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: err,
      buttons: ['OK']
    });
    alert.present();
  }
  

  getMimeTypeFromExtension(fileName: string): string {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  previewExistingFile(index: number) {
    const file = this.existingFiles[index];
    
    if (this.isImageByName(file.File_Name)) {
      this.previewExistingImage(file, 'lead');
    } else {
      this.openExistingFileExternally(file, 'lead');
    }
  }

  previewExistingImage(file: any, type: 'lead') {
    let loading = this.loadingCtrl.create({
      content: 'Opening image...',
      spinner: 'crescent'
    });

    loading.present();

    this.storage.get('token').then((val) => {
      const imageUrl = `${SERVER_URL}/getFile/${file.Id}/${encodeURIComponent(file.File_Name)}?token=${val.token}&type=${type}`;

      this.http.get(imageUrl, { responseType: 'blob' }).subscribe(
        (blob: Blob) => {
          const fileName = file.File_Name;
          
          // Use platform-specific directory
          const targetDir = this.file.dataDirectory;

          this.file.writeFile(targetDir, fileName, blob, { replace: true })
            .then((entry) => {
              loading.dismiss();
              
              // iOS requires special handling - use file:// URL
              if (this.platform.is('ios')) {
                // Get the native path and convert to proper file:// URL
                const nativePath = entry.toURL();
                console.log('iOS file path:', nativePath);
                this.fileOpener.open(nativePath, 'image/jpeg');
              } else {
                const filePath = targetDir + fileName;
                console.log('Android file path:', filePath);
                this.fileOpener.open(filePath, 'image/*');
              }
            })
            .catch(err => {
              loading.dismiss();
              console.error('Error writing image file:', err);
              this.displayErrorAlert('Unable to save image');
            });
        },
        error => {
          loading.dismiss();
          console.error('Error downloading image:', error);
          this.displayErrorAlert('Unable to download image');
        }
      );
    });
  }

  openExistingFileExternally(file: any, type: 'lead') {
    let loading = this.loadingCtrl.create({
      content: 'Loading file...',
      spinner: 'crescent'
    });
    
    loading.present();

    this.storage.get('token').then((val) => {
      const fileUrl = `${SERVER_URL}/downloadFile/${file.Id}/${encodeURIComponent(file.File_Name)}?token=${val.token}&type=${type}`;
      
      this.http.get(fileUrl, { responseType: 'blob' }).subscribe(
        (blob: Blob) => {
          loading.dismiss();
          
          const fileName = file.File_Name;
          const filePath = this.file.dataDirectory + fileName;
          const mimeType = this.getMimeTypeFromExtension(fileName);

          const reader = new FileReader();
          reader.onloadend = () => {
            const buffer = reader.result as ArrayBuffer;

            this.file.writeFile(this.file.dataDirectory, fileName, buffer, { replace: true })
              .then(() => {
                this.fileOpener.open(filePath, mimeType)
                  .then(() => console.log('File opened successfully'))
                  .catch(err => {
                    console.error('Error opening file:', err);
                    this.displayErrorAlert('Unable to open file externally');
                  });
              })
              .catch(err => {
                console.error('Error writing file:', err);
                this.displayErrorAlert('Unable to save file');
              });
          };
          reader.readAsArrayBuffer(blob);
        },
        error => {
          loading.dismiss();
          console.error('Error downloading file:', error);
          this.displayErrorAlert('Unable to download file');
        }
      );
    });
  }

  isImageByName(fileName: string): boolean {
    if (!fileName) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return imageExtensions.indexOf(extension) !== -1;
  }

}

