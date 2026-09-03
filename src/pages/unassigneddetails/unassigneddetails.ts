import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, App, LoadingController, ToastController, Platform } from 'ionic-angular';
// import { CallNumber } from '@ionic-native/call-number';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClientnewPage } from '../clientnew/clientnew';
import { CustomerupdatePage } from '../customerupdate/customerupdate';
import { SERVER_URL } from '../../environment';
import { FileOpener } from '@ionic-native/file-opener';
import { DomSanitizer } from '@angular/platform-browser';
import { File } from '@ionic-native/file';
import { DealupdatePage } from '../dealupdate/dealupdate';

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
  selector: 'page-unassigneddetails',
  templateUrl: 'unassigneddetails.html',
})
export class UnassigneddetailsPage {

  Id:any;
  Company_Name:any;
  Customer_Name:any;
  Contact_No:any;
  Status:any;
  Address:any;
  Email:any;
  Remarks:any;
  Country:any;
  StateRegion:any;
  Type:any;
  custom_type:any;
  Source:any;
  Priority:any;
  Created_at:any;
  items:any='';
  cold_call:any;
  // has_schedule:any;
  showAgentModal: boolean = false;
  agents: any[] = [];
  filteredAgents: any[] = [];
  searchTerm: string = '';
  fileBlobs: Blob[] = [];

  existingFiles: any[] = [];

  leadFiles: any[] = [];
  dealId: any;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public http: HttpClient,
    // private callNumber: CallNumber,
    public loadingCtrl: LoadingController,
    private toast: ToastController,
    public platform: Platform,
    public alertCtrl: AlertController,
    private storage: Storage,
    public app: App,
    private fileOpener: FileOpener,
    private file: File,
    public domSanitizer: DomSanitizer,

  ) {
    this.Id=this.navParams.get('Id');
    this.Company_Name=this.navParams.get('Company_Name');
    this.Customer_Name=this.navParams.get('Customer_Name');
    this.Contact_No=this.navParams.get('Contact_No');
    this.Country=this.navParams.get('Country');
    this.StateRegion=this.navParams.get('StateRegion');
    this.Type=this.navParams.get('Type');
    this.custom_type=this.navParams.get('custom_type');
    this.Source=this.navParams.get('Source');
    this.Status=this.navParams.get('Status');
    this.Address=this.navParams.get('Address');
    this.Email=this.navParams.get('Email');
    this.cold_call=this.navParams.get('cold_call');
    this.dealId=this.navParams.get('dealId');
    this.Remarks=this.navParams.get('Remarks');
    this.Created_at=this.navParams.get('Created_at');

    console.log('dealId',this.dealId);

    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomerdetailsPage');

    this.loadExistingFiles();
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
    
      closeAgentModal() {
        this.showAgentModal = false;
        this.searchTerm = '';
        this.agents = [];
        this.filteredAgents = [];
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
  
      let nav = this.app.getRootNav();
      nav.push('DealupdatePage',{
        Id:this.Id,
        DealId: this.dealId
      })
    }

  loadExistingFiles() {
    this.storage.get('token').then((val) => {
      const data = this.http.get<any>(SERVER_URL + '/getLeadFiles/' + this.Id + '?token=' + val.token);
      data.subscribe(result => {
        this.existingFiles = result.leadFiles || [];
        console.log('Existing files loaded:', this.existingFiles);
      }, error => {
        console.error('Error loading existing files:', error);
      });
    });
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

