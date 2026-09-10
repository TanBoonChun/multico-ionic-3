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
import { File, FileEntry } from '@ionic-native/file';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AppAvailability } from '@ionic-native/app-availability';
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
  action_plan:any;
  Country:any;
  State:any;
  Area:any;
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

  coldCallActivities: any[] = [];
  showActivityModal: boolean = false;
  selectedActivity: any = null;
  activityRemarks: string = '';

  // Attachments already on the open entry, and the ones picked in this sitting
  // but not yet sent. Pending files carry their blob so the upload does not
  // have to go back to the filesystem for them.
  activityFiles: any[] = [];
  pendingFiles: any[] = [];

  // Set when the user taps the contact number, cleared once the call has been
  // logged. The log is written on resume rather than on the tap so that what
  // is recorded is a call the user came back from, not a link they touched.
  pendingColdCall: boolean = false;
  resumeSubscription: any = null;

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
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    public modalCtrl: ModalController,
    public platform: Platform,
    private appAvailability: AppAvailability,
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
      this.State=this.navParams.get('State')
      this.Area=this.navParams.get('Area')
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
        this.action_plan=this.details[0].action_plan
        this.Progress_Log=this.details[0].Progress_Log
        this.Support_Required=this.details[0].Support_Required
        this.cold_call=this.details[0].cold_call
        this.has_schedule=this.details[0].has_schedule
        this.has_agent=this.details[0].has_agent
        this.lead_from=this.details[0].Source
        this.Country=this.details[0].Country
        this.State=this.details[0].State
        this.Area=this.details[0].Area
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
    this.loadColdCallActivity();
  }

  ionViewDidLoad() {
    // The dialler puts the app in the background; coming back is the signal
    // that a call was actually placed.
    this.resumeSubscription = this.platform.resume.subscribe(() => {
      if (this.pendingColdCall) {
        this.pendingColdCall = false;
        this.logColdCall();
      }
    });
  }

  ionViewWillUnload() {
    if (this.resumeSubscription) {
      this.resumeSubscription.unsubscribe();
      this.resumeSubscription = null;
    }
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

  loadColdCallActivity() {
    this.storage.get('token').then((val) => {
      this.http.get<any>(SERVER_URL + '/getColdCallActivity/' + this.Id2 + '?token=' + val.token)
        .subscribe(result => {
          this.coldCallActivities = result || [];
        }, error => {
          console.error('Error loading cold call activity:', error);
        });
    });
  }

  /**
   * Tapping the contact number tries WhatsApp first (checked with
   * AppAvailability rather than just firing the deep link blind, since a
   * whatsapp:// link that goes nowhere leaves the user on a blank screen
   * with no error) and falls back to the dialler when WhatsApp is not on
   * the device. Either way, the intent to log the call is set so it is
   * recorded once the user comes back.
   */
  onCallContact(event: any) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.Contact_No) {
      return;
    }

    if (!this.platform.is('cordova')) {
      // In the browser there is no dialler/WhatsApp and no resume event, so
      // there is nothing to wait for - just log and dial like before.
      this.logColdCall();
      window.location.href = 'tel:' + this.Contact_No;
      return;
    }

    const whatsappId = this.platform.is('ios') ? 'whatsapp://' : 'com.whatsapp';

    this.appAvailability.check(whatsappId).then(
      () => {
        this.pendingColdCall = true;
        window.open('https://wa.me/' + this.toWhatsAppNumber(this.Contact_No), '_system');
      },
      () => {
        this.pendingColdCall = true;
        window.location.href = 'tel:' + this.Contact_No;
      }
    );
  }

  // Converts a local Malaysian number ("012-3456789") or one already in
  // international format ("+60123456789") into the digits-only format
  // wa.me expects ("60123456789").
  private toWhatsAppNumber(raw: string): string {
    const cleaned = (raw || '').replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) {
      return cleaned.substring(1);
    }
    if (cleaned.startsWith('0')) {
      return '60' + cleaned.substring(1);
    }
    return cleaned;
  }

  logColdCall() {
    this.storage.get('token').then((val) => {
      this.http.post(SERVER_URL + '/log_cold_call?token=' + val.token, {
        dealid: this.Id2,
      }, httpOptions)
        .subscribe((res: any) => {
          if (res && res.result == 1) {
            this.cold_call = 1;
            this.loadColdCallActivity();
            this.showToast("Cold call recorded");
          } else {
            console.log(res);
          }
        }, error => {
          console.error('Error logging cold call:', error);
          this.showToast("Failed to record cold call");
        });
    });
  }

  openActivityModal(activity: any) {
    this.selectedActivity = activity;
    this.activityRemarks = activity.remarks || '';
    this.activityFiles = activity.files || [];
    this.pendingFiles = [];
    this.showActivityModal = true;
  }

  closeActivityModal() {
    this.showActivityModal = false;
    this.selectedActivity = null;
    this.activityRemarks = '';
    this.activityFiles = [];
    this.pendingFiles = [];
  }

  takeActivityPhoto() {
    this.pickActivityPhoto(this.camera.PictureSourceType.CAMERA);
  }

  chooseActivityPhoto() {
    this.pickActivityPhoto(this.camera.PictureSourceType.PHOTOLIBRARY);
  }

  private pickActivityPhoto(sourceType: number) {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: sourceType,
      saveToPhotoAlbum: false,
      correctOrientation: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    };

    this.camera.getPicture(options).then((imageData) => {
      // The camera hands back a URI; the blob is read now so that submitting
      // is a plain upload and the list can show a thumbnail straight away.
      this.uriToBlob(imageData).then((blob: Blob) => {
        const fileName = 'photo_' + Date.now() + '.jpg';
        this.addPendingFile(fileName, blob);
      }).catch((err) => {
        console.error('Error reading photo:', err);
        this.displayErrorAlert('Unable to read the selected photo');
      });
    }, (err) => {
      // Cancelling the camera comes back as an error too, and is not one.
      console.log('Camera cancelled or failed:', err);
    });
  }

  async chooseActivityFile() {
    try {
      let fileUri;

      if (this.platform.is('ios')) {
        fileUri = 'file://' + (await this.filePicker.pickFile());
      } else {
        fileUri = await this.fileChooser.open();
      }

      const blob = await this.uriToBlob(fileUri);
      let fileName = await this.resolveFileName(fileUri, blob);

      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
      const fileExtension = fileName.toLowerCase().split('.').pop();

      if (allowedExtensions.indexOf(fileExtension) === -1) {
        this.displayErrorAlert(
          'File type not supported. Supported types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF'
        );
        return;
      }

      this.addPendingFile(fileName, blob);
    } catch (err) {
      console.error('Error choosing file:', err);
      if (err !== 'cancelled') {
        this.displayErrorAlert('Error selecting file');
      }
    }
  }

  /**
   * Read any of the URI shapes the pickers produce - file://, content://, an
   * iOS temp path - into a Blob.
   */
  private uriToBlob(fileUri: string): Promise<Blob> {
    return this.file.resolveLocalFilesystemUrl(fileUri)
      .then((entry: FileEntry) => {
        return new Promise<Blob>((resolve, reject) => {
          entry.file((f: any) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(new Blob([reader.result], { type: f.type || this.getMimeTypeFromExtension(f.name || '') }));
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(f);
          }, reject);
        });
      })
      .catch(() => {
        // Some Android providers refuse resolveLocalFilesystemUrl but will
        // still serve the URI over XHR.
        return new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', fileUri, true);
          xhr.responseType = 'blob';
          xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0) {
              resolve(xhr.response);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          xhr.onerror = () => reject(new Error('Failed to read file'));
          xhr.send();
        });
      });
  }

  /**
   * Work out a filename with an extension - a content:// URI often has neither.
   */
  private resolveFileName(fileUri: string, blob: Blob): Promise<string> {
    return this.file.resolveLocalFilesystemUrl(fileUri)
      .then((entry: any) => entry.name as string)
      .catch(() => {
        if (this.platform.is('ios')) {
          return Promise.resolve(fileUri);
        }
        return this.filePath.resolveNativePath(fileUri).catch(() => fileUri);
      })
      .then((path: string) => {
        let name = (path || '').split('/').pop() || ('file_' + Date.now());
        name = name.split('?')[0];

        if (name.indexOf('.') === -1) {
          name = name + '.' + this.getExtensionFromMimeType(blob.type);
        }

        return name;
      });
  }

  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
    };
    return mimeToExt[mimeType] || 'dat';
  }

  private addPendingFile(fileName: string, blob: Blob) {
    const fileObj: any = {
      name: fileName,
      size: blob.size,
      type: blob.type || this.getMimeTypeFromExtension(fileName),
      blob: blob,
      preview: null,
    };

    this.pendingFiles.push(fileObj);

    if (this.isImageByName(fileName)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // bypassSecurityTrustUrl, not ...ResourceUrl - an img src is a URL
        // context, and a SafeResourceUrl there is rejected by the sanitizer.
        fileObj.preview = this.domSanitizer.bypassSecurityTrustUrl(reader.result as string);
      };
      reader.readAsDataURL(blob);
    }
  }

  removePendingFile(index: number) {
    this.pendingFiles.splice(index, 1);
  }

  previewActivityFile(file: any) {
    if (this.isImageByName(file.File_Name)) {
      this.previewExistingImage(file, 'coldcall');
    } else {
      this.openExistingFileExternally(file, 'coldcall');
    }
  }

  deleteActivityFile(file: any, event: any) {
    event.stopPropagation();

    let confirm = this.alertCtrl.create({
      title: 'Delete Attachment',
      message: 'Delete "' + file.File_Name + '"?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.storage.get('token').then((val) => {
              this.http.post(SERVER_URL + '/deleteColdCallActivityFile/' + file.Id + '?token=' + val.token, {},
                httpOptions)
                .subscribe((res: any) => {
                  if (res && res.result == 1) {
                    const index = this.activityFiles.indexOf(file);
                    if (index !== -1) {
                      this.activityFiles.splice(index, 1);
                    }
                    this.loadColdCallActivity();
                    this.showToast("Attachment deleted");
                  } else {
                    console.log(res);
                    this.showToast("Failed to delete attachment");
                  }
                }, error => {
                  console.error('Error deleting attachment:', error);
                  this.showToast("Failed to delete attachment");
                });
            });
          }
        }
      ]
    });
    confirm.present();
  }

  submitActivityRemarks() {
    if (!this.selectedActivity) {
      return;
    }

    const hasRemarks = !!this.activityRemarks;
    const hasFiles = this.pendingFiles.length > 0;

    if (!hasRemarks && !hasFiles) {
      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });
    loading.present();

    const activityId = this.selectedActivity.Id;

    this.storage.get('token').then((val) => {
      const steps = [];

      if (hasRemarks) {
        steps.push(this.saveActivityRemarks(activityId, val.token));
      }

      if (hasFiles) {
        steps.push(this.uploadPendingFiles(activityId, val.token));
      }

      Promise.all(steps).then(() => {
        loading.dismiss();
        this.closeActivityModal();
        this.loadColdCallActivity();
        this.showToast("Cold call activity saved");
      }).catch((err) => {
        loading.dismiss();
        console.error('Error saving cold call activity:', err);
        // Whatever did land is on the server, so refresh rather than leave the
        // list showing the pre-submit state.
        this.loadColdCallActivity();
        this.showToast("Failed to save cold call activity");
      });
    });
  }

  private saveActivityRemarks(activityId: any, token: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post(SERVER_URL + '/updateColdCallActivity?token=' + token, {
        id: activityId,
        remarks: this.activityRemarks,
      }, httpOptions)
        .subscribe((res: any) => {
          if (res && res.result == 1) {
            resolve(res);
          } else {
            reject(res);
          }
        }, error => reject(error));
    });
  }

  private uploadPendingFiles(activityId: any, token: string): Promise<any> {
    const formData = new FormData();
    formData.append('id', activityId);

    for (let i = 0; i < this.pendingFiles.length; i++) {
      formData.append('ColdCall[]', this.pendingFiles[i].blob, this.pendingFiles[i].name);
    }

    return new Promise((resolve, reject) => {
      // No httpOptions here on purpose - the browser has to set the multipart
      // boundary itself.
      this.http.post(SERVER_URL + '/uploadColdCallActivityFile?token=' + token, formData, {})
        .subscribe((res: any) => {
          if (res && res.result == 1) {
            resolve(res);
          } else {
            reject(res);
          }
        }, error => reject(error));
    });
  }

  deleteActivity(activity: any, event: any) {
    // The row itself opens the modal - a tap on the bin must not do both.
    event.stopPropagation();

    let confirm = this.alertCtrl.create({
      title: 'Delete Cold Call Activity',
      message: 'Delete this cold call record?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.storage.get('token').then((val) => {
              this.http.post(SERVER_URL + '/deleteColdCallActivity?token=' + val.token, {
                id: activity.Id,
              }, httpOptions)
                .subscribe((res: any) => {
                  if (res && res.result == 1) {
                    this.loadColdCallActivity();
                    if (this.coldCallActivities.length <= 1) {
                      // Server clears the flag once the last one is gone.
                      this.cold_call = 0;
                    }
                    this.showToast("Cold call activity deleted");
                  } else {
                    console.log(res);
                    this.showToast("Failed to delete cold call activity");
                  }
                }, error => {
                  console.error('Error deleting cold call activity:', error);
                  this.showToast("Failed to delete cold call activity");
                });
            });
          }
        }
      ]
    });
    confirm.present();
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

  previewExistingImage(file: any, type: string) {
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

  openExistingFileExternally(file: any, type: string) {
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

