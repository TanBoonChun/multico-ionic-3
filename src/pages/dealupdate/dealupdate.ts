import { Component } from '@angular/core';
import { AlertController, IonicPage, LoadingController, ModalController, NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';
import { File } from '@ionic-native/file';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { FileChooser } from '@ionic-native/file-chooser';
import { FileOpener } from '@ionic-native/file-opener';
import { FilePath } from '@ionic-native/file-path';
import { DomSanitizer } from '@angular/platform-browser';
import { catchError } from 'rxjs/operators';
import { COUNTRY_CODES } from '../../data/country-codes';

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
  selector: 'page-dealupdate',
  templateUrl: 'dealupdate.html',
})
export class DealupdatePage {
  public signupform: FormGroup;
  formData: FormData;
  Company_Name:any='';
  Customer_Name:any='';
  Contact_No:any='';
  PhoneCode: any='';
  phoneCodes: any[] = COUNTRY_CODES;
  Email:any='';
  Address:any='';
  Country: any='';
  country: any=[];
  State: any='';
  state: any=[];
  Area:any='';
  area:any=[];

  // Set by the prefill so the area saved on the record survives the reload
  // that filling in the state triggers; cleared once it has been applied.
  pendingArea: any='';
  Source: any='';
  source: any=[];
  Type: any='';
  type: any=[];
  Approach_Since: any='';
  Custom_Type: any='';
  Company_Type: any='';
  companyType: any=[];
  Custom_Company_Type: any='';
  Remarks:any ='';
  Priority:any ='';
  priority:any=[];


  Status:any ='';
  Lost_Cause:any ='';
  Lost_Remarks:any ='';
  Deal_Name:any ='';
  Project_Name:any ='';
  Currency:any ='';
  Salesman:any ='';
  Company:any = '';
  Contact:any ='';
  

     //added by Hau 20240328
     
     Potential:any;
     Award_Date:any;
     Delivery_Period:any;
     Forecast_Amount:any;
     Business_Type:any;
     Stage:any;
     Progress_Log:any;
     Support_Required:any;

     UserId:any;
     ClientId:any;
     CompanyId:any;
     //added by Hau 20240328


  currency:any='';
  company:any;

  lost_causes:any;
  delivery_periods:any;
  stages:any;

  // The next step planned for this lead, from Option Control (deal /
  // Action_Plan).
  Action_Plan:any='';
  action_plans:any=[];

  contact:any='';
  sales:any='';
  Id:any;
  Status_Details:any;
  // Quotation_No:any;
  // Quotation_Date:any;
  // Quotation_Amount:any;
  // Quotation_Remarks:any;
  scheduleid:any;
  Id2:any='';
  data:any='';
  items:any='';
  s:any;
  details:any='';

  PIC_name:any;
  PIC_no:any;
  DealId:any;
  DealName:any;
  Name:any;
  Salesman2:any;
  status:any;

  selectedFiles: any[] = []; // Store file objects with metadata
  fileBlobs: Blob[] = [];

  existingFiles: any[] = [];

  leadFiles: any[] = [];


  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    public http: HttpClient,
    public alertCtrl: AlertController,
    private toast: ToastController, 
    private filePicker: IOSFilePicker,
    private fileChooser: FileChooser,
    private fileOpener: FileOpener,
    private file: File,
    private filePath: FilePath,
    public domSanitizer: DomSanitizer,
    public modalCtrl: ModalController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    public navParams: NavParams) {

      this.Id=this.navParams.get('Id');
      this.UserId=this.navParams.get('UserId')
      this.CompanyId=this.navParams.get('CompanyId')
      this.ClientId=this.navParams.get('ClientId')

      console.log(this.UserId)
      console.log(this.CompanyId)
      console.log(this.ClientId)

      this.scheduleid=this.navParams.get('scheduleid');
  
      this.Id2=this.navParams.get('DealId');
       
    let data:Observable<any>;


   this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getCountry?token=' + val.token );
      data.subscribe(result => {
        this.country = result;
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getState?token=' + val.token );
      data.subscribe(result => {
        this.state = result;
      })
    });


    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getPriority/?token=' + val.token );
      data.subscribe(result => {
        this.priority = result.priority;
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getSource/?token=' + val.token );
      data.subscribe(result => {
        this.source = result.source;
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getType/?token=' + val.token );
      data.subscribe(result => {
        this.type = result.type
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getActionPlan?token=' + val.token );
      data.subscribe(result => {
        this.action_plans = result.action_plans ? result.action_plans : [];
      }, (err) => {
        console.log(err);
        this.action_plans = [];
      })
    });

    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getCompanyType?token=' + val.token );
      data.subscribe(result => {
        this.companyType = result.company_type;
      })
    });

    this.loadExistingFiles();

  }

  /**
   * The areas inside one state. Called again whenever State changes, so the
   * Area selectable never offers a locality from a different state. `selected`
   * is re-applied once the list is in, which is what keeps the saved area on a
   * record being edited.
   */
  loadAreas(state, selected?) {
    if (!state) {
      this.area = [];
      return;
    }

    this.storage.get('token').then((val) => {
      this.http.get(SERVER_URL + '/getArea?state=' + encodeURIComponent(state) +
        '&token=' + val.token)
        .subscribe(result => {
          this.area = result;

          if (selected) {
            this.Area = { "Option": selected };
          }
        }, (err) => {
          console.log(err);
          this.area = [];
        })
    });
  }

  // The country code is picked separately (PhoneCode), so this only has to
  // check the subscriber number itself - digits only, a plausible length.
  phoneFormatValidator(control: FormControl) {
    const val = (control.value || '').toString().trim();
    if (!val) {
      return null;
    }
    const digits = val.replace(/[^0-9]/g, '');
    if (/^[0-9]{5,12}$/.test(digits)) {
      return null;
    }
    return { invalidPhone: true };
  }

  // The final Contact_No sent to the server is the picked dial code plus the
  // subscriber number, with any leading trunk 0 dropped so it is not doubled
  // up with the code (e.g. +60 123456789, not +600123456789).
  getFinalContactNo(): string {
    const code = this.PhoneCode && this.PhoneCode.dial_code ? this.PhoneCode.dial_code : '';
    const local = (this.Contact_No || '').toString().replace(/[^0-9]/g, '').replace(/^0+/, '');
    return code + local;
  }

  // Splits a previously saved Contact_No (e.g. "+60123456789" or a bare
  // "0123456789" from before this split existed) back into a dial code and
  // subscriber number for prefill. Falls back to leaving the code blank -
  // the user is required to (re)pick it either way.
  splitContactNo(saved: string) {
    const val = (saved || '').toString().trim();
    if (!val) {
      return;
    }

    if (val.charAt(0) === '+') {
      const match = COUNTRY_CODES
        .filter(c => val.indexOf(c.dial_code) === 0)
        .sort((a, b) => b.dial_code.length - a.dial_code.length)[0];

      if (match) {
        this.PhoneCode = match;
        this.Contact_No = val.substring(match.dial_code.length);
        return;
      }
    }

    this.Contact_No = val;
  }

  // Uppercase a value and, for company names, strip the dots out of common
  // abbreviations (e.g. "Sdn. Bhd." -> "SDN BHD").
  normalizeName(val: string): string {
    if (!val) {
      return val;
    }
    return val.toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ');
  }

  uppercaseText(val: string): string {
    return val ? val.toUpperCase() : val;
  }

  // Company_Type has no separate "custom" column - when the user picked
  // Other, what they typed in the Custom_Company_Type box is what actually
  // gets saved into it.
  getFinalCompanyType(): string {
    const selected = this.Company_Type && this.Company_Type.Option;
    return selected === 'Other' ? this.Custom_Company_Type : selected;
  }

  private forceUppercase(controlName: string, transform: (val: string) => string) {
    this.signupform.get(controlName).valueChanges.subscribe((val) => {
      if (typeof val !== 'string') {
        return;
      }
      const transformed = transform(val);
      if (transformed !== val) {
        // Deferred a tick so this never rewrites the value in the same
        // change-detection cycle that just rendered it - doing that
        // synchronously is what throws
        // ExpressionChangedAfterItHasBeenCheckedError.
        setTimeout(() => {
          this.signupform.get(controlName).setValue(transformed, { emitEvent: false });
        }, 0);
      }
    });
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      Company_Name: new FormControl('', [Validators.required]),
      Customer_Name: new FormControl('', []),
      PhoneCode: new FormControl('', [Validators.required]),
      Contact_No: new FormControl('', [Validators.required, this.phoneFormatValidator]),
      Email: new FormControl('', [Validators.email]),
      Address: new FormControl('', []),
      Country: new FormControl('', [Validators.required]),
      State: new FormControl('', [Validators.required]),
      Area: new FormControl('', [Validators.required]),
      Source: new FormControl('', [Validators.required]),
      Type: new FormControl('', [Validators.required]),
      Custom_Type: new FormControl('', [Validators.required]),
      Company_Type: new FormControl('', [Validators.required]),
      Custom_Company_Type: new FormControl('', []),
      Priority: new FormControl('', [Validators.required]),
      Action_Plan: new FormControl('', []),
      Approach_Since: new FormControl('', []),
      Remarks: new FormControl('', []),

    })

    this.forceUppercase('Company_Name', (val) => this.normalizeName(val));
    this.forceUppercase('Customer_Name', (val) => this.uppercaseText(val));
    this.forceUppercase('Address', (val) => this.uppercaseText(val));
    this.forceUppercase('Remarks', (val) => this.uppercaseText(val));

    // Area only offers localities inside the state that is picked. On a
    // record being opened for edit the area it was saved with is handed over
    // in pendingArea, so it is kept instead of cleared.
    this.signupform.get('State').valueChanges.subscribe(state => {
      const option = state && state.Option ? state.Option : '';
      const keep = this.pendingArea;

      this.pendingArea = '';
      this.Area = keep ? { "Option": keep } : '';
      this.loadAreas(option, keep);
    });

    this.signupform.get('Type').valueChanges.subscribe(type => {
      const value = (type || '').toString().toUpperCase();
      if (type === 'OTHERS') {
        this.signupform.get('Custom_Type').setValidators([Validators.required]);
      } else {
        this.signupform.get('Custom_Type').clearValidators();
      }

      this.signupform.get('Custom_Type').updateValueAndValidity();

    });

    this.signupform.get('Company_Type').valueChanges.subscribe(companyType => {
      if (companyType && companyType.Option === 'Other') {
        this.signupform.get('Custom_Company_Type').setValidators([Validators.required]);
      } else {
        this.signupform.get('Custom_Company_Type').clearValidators();
      }

      this.signupform.get('Custom_Company_Type').updateValueAndValidity();

    });


 }

  ionViewDidLoad() {
    let data:Observable<any>;
    console.log('ionViewDidLoad DealformPage');
    this.storage.get('token').then((val) => {
      data = this.http.get(SERVER_URL + '/getdealdetail/'+this.Id2+'?token=' + val.token );
      data.subscribe(result => {
        this.details = result;
        
        this.Company_Name=this.details[0].Company_Name
        this.Customer_Name=this.details[0].Customer_Name
        this.splitContactNo(this.details[0].Contact_No)
        this.Email=this.details[0].Email
        this.Address=this.details[0].Address
        this.Country={"Option": this.details[0].Country}
        this.pendingArea=this.details[0].Area
        this.State={"Option": this.details[0].State}
        this.Priority={"Option": this.details[0].Priority}
        this.Source={"Option": this.details[0].Source}
        this.Type={"Option": this.details[0].Type}
        this.Custom_Type=this.details[0].custom_type

        // Company_Type has no separate "custom" column, so a saved value
        // outside the fixed dropdown set is what someone typed under Other.
        const savedCompanyType = this.details[0].Company_Type;
        const knownCompanyTypes = ['Individual', 'Company', 'Majlis'];
        if (savedCompanyType && knownCompanyTypes.indexOf(savedCompanyType) === -1) {
          this.Company_Type = { "Option": 'Other' };
          this.Custom_Company_Type = savedCompanyType;
        } else if (savedCompanyType) {
          this.Company_Type = { "Option": savedCompanyType };
        }

        this.Approach_Since=this.details[0].Aproach_Since
        this.Remarks=this.details[0].Remarks


        this.Award_Date=this.details[0].Award_Date
        this.Delivery_Period=this.details[0].Delivery_Period
        this.Forecast_Amount=this.details[0].Forecast_Amount
        this.Currency=this.details[0].Currency
        this.Stage=this.details[0].Stage
        this.Action_Plan=this.details[0].action_plan ? {"Option": this.details[0].action_plan} : ''
        this.Progress_Log=this.details[0].Progress_Log
        this.Support_Required=this.details[0].Support_Required
                
      })
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

  displayErrorAlert(err){
    console.log(err);
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: err,
      buttons: ['OK']
    });
    alert.present();
  }

  async chooseFiles() {
    try {
      if(this.platform.is('ios')) {
        const fileUri = await this.filePicker.pickFile();
        await this.handleFileUri("file://" + fileUri);

      } else {
        const fileUri = await this.fileChooser.open();
              
        if (fileUri.startsWith('content://')) {
          await this.handleContentUri(fileUri);
        } else {
          await this.handleFileUri(fileUri);
        }
      }
    } catch (err) {
      console.error('Error choosing file:', err);
      if (err !== 'cancelled') {
        this.displayErrorAlert('Error selecting file');
      }
    }
  }

  async handleContentUri(fileUri: string) {
    try {
      const fileEntry: any = await new Promise((resolve, reject) => {
        (window as any).resolveLocalFileSystemURL(fileUri, resolve, reject);
      });

      const cordovaFile: any = await new Promise((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });

      let fileName: string = fileEntry.name || cordovaFile.name || ('selected_file_' + Date.now());
      if (!fileName.includes('.')) {
        const mimeExt = this.getExtensionFromMimeType(cordovaFile.type);
        fileName = fileName + '.' + mimeExt;
      }
      let fileExtension = fileName.toLowerCase().split('.').pop();

      if (!fileExtension || fileExtension === fileName.toLowerCase()) {
        const mimeExt = this.getExtensionFromMimeType(cordovaFile.type);
        fileName = fileName + '.' + mimeExt;
        fileExtension = mimeExt;
      }

      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];

      if (allowedExtensions.indexOf(fileExtension) === -1) {
        this.displayErrorAlert(
          'File type not supported. Supported types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF'
        );
        return;
      }

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(cordovaFile);
      });

      const blob = new Blob([arrayBuffer], {
        type: cordovaFile.type || this.getMimeTypeFromExtension(fileName),
      });

      const fileObj = {
        name: fileName,
        uri: fileUri,
        path: fileUri,
        size: cordovaFile.size,
        type: cordovaFile.type || this.getMimeTypeFromExtension(fileName),
      };

      this.selectedFiles.push(fileObj);
      this.fileBlobs.push(blob);


      let toast = this.toast.create({
        message: 'File "' + fileName + '" selected successfully',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
    } catch (error) {
      console.error('Error handling content URI:', error);
      await this.handleContentUriFallback(fileUri);
    }
  }

  async handleContentUriFallback(fileUri: string) {
    try {
      const tempFileName = 'selected_file_' + Date.now();

      const blob = await this.readContentUriAsBlob(fileUri);

      let fileName: string;

      if ((window as any).resolveLocalFileSystemURL) {
        try {
          const fileEntry: any = await new Promise((resolve, reject) => {
            (window as any).resolveLocalFileSystemURL(fileUri, resolve, reject);
          });
          fileName = fileEntry.name || tempFileName;
        } catch (e) {
          fileName = tempFileName;
        }
      } else {
        fileName = tempFileName;
      }

      if (!fileName.includes('.')) {
        const extension = this.getExtensionFromMimeType(blob.type);
        fileName = fileName + '.' + extension;
      }
      let fileType = blob.type;

      if (!fileType) {
        fileType = 'application/pdf';
        fileName = tempFileName + '.pdf';
      } else {
        const extension = this.getExtensionFromMimeType(fileType);
        fileName = tempFileName + '.' + extension;
      }

      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
      const fileExtension = fileName.toLowerCase().split('.').pop();

      if (allowedExtensions.indexOf(fileExtension) === -1) {
        this.displayErrorAlert(
          'File type not supported. Supported types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF'
        );
        return;
      }

      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as ArrayBuffer'));
          }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(blob);
      });

      const safeBlob = new Blob([arrayBuffer], { type: fileType });

      const fileObj = {
        name: fileName,
        uri: fileUri,
        path: fileUri,
        size: safeBlob.size,
        type: fileType,
      };

      this.selectedFiles.push(fileObj);
      this.fileBlobs.push(safeBlob);


      let toast = this.toast.create({
        message: 'File "' + fileName + '" selected successfully',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();

    } catch (error) {
      this.displayErrorAlert('Unable to read the selected file. Please try selecting a different file.');
    }
  }

  async handleFileUri(fileUri: string) {
    try {
      let filePath;

      if(this.platform.is('ios')) {
        filePath = fileUri;
      } else {
        filePath = await this.filePath.resolveNativePath(fileUri);
      }

      const pathParts = filePath.split('/');
      let fileName = pathParts.pop() || ('selected_file_' + Date.now());

      if (!fileName.includes('.')) {
        const mimeExt = this.getExtensionFromMimeType(fileName);
        fileName = fileName + '.' + mimeExt;
      }

      const directory = pathParts.join('/') + '/';

      const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
      const fileExtension = fileName.toLowerCase().split('.').pop();

      if (allowedExtensions.indexOf(fileExtension) === -1) {
        this.displayErrorAlert(
          'File type not supported. Supported types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF'
        );
        return;
      }

      let blob: Blob;

      try {
        const arrayBuffer = await this.file.readAsArrayBuffer(directory, fileName);
        blob = new Blob([arrayBuffer], { type: this.getMimeTypeFromExtension(fileName) });
      } catch (error) {
        console.warn('ArrayBuffer read failed, falling back to DataURL:', error);

        const fileData = await this.file.readAsDataURL(directory, fileName);
        const response = await fetch(fileData);
        const tempBlob = await response.blob();

        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result instanceof ArrayBuffer) {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to read file as ArrayBuffer'));
            }
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(tempBlob);
        });

        blob = new Blob([arrayBuffer], { type: tempBlob.type || this.getMimeTypeFromExtension(fileName) });
      }

      const fileObj = {
        name: fileName,
        uri: fileUri,
        path: filePath,
        size: blob.size,
        type: blob.type || this.getMimeTypeFromExtension(fileName),
      };

      this.selectedFiles.push(fileObj);
      this.fileBlobs.push(blob);


      let toast = this.toast.create({
        message: 'File "' + fileName + '" selected successfully',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
    } catch (error) {
      console.error('Error handling file URI:', error);
      this.displayErrorAlert('Error reading the selected file');
    }
  }

  readContentUriAsBlob(uri: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', uri, true);
      xhr.responseType = 'blob';
      
      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error('Failed to read content URI'));
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error while reading content URI'));
      };
      
      xhr.send();
    });
  }

  getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif'
    };
    return mimeToExt[mimeType] || 'bin';
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

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.fileBlobs.splice(index, 1);
  }

  async chooseMultipleFiles() {
    let alert = this.alertCtrl.create({
      title: 'Select Files',
      message: 'You can select multiple files one by one. Click "Add Another File" to continue selecting.',
      buttons: [
        {
          text: 'Select File',
          handler: () => {
            this.chooseFiles();
          }
        },
        {
          text: 'Done',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }

  previewFile(index: number) {
    const file = this.selectedFiles[index];
    const blob = this.fileBlobs[index];
    
    if (this.isImage(file.type)) {
      this.previewImage(blob, file.name);
    } else if (file.type === 'application/pdf') {
      this.openFileExternally(blob, file.name, file.type);
    } 
  }

  previewImage(blob: Blob, fileName: string) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const imageData = event.target.result;
      
      let alert = this.alertCtrl.create({
        title: fileName,
        message: `
          <div style="text-align: center;">
            <img src="${imageData}" style="max-width: 100%; max-height: 300px; object-fit: contain;" />
          </div>
        `,
        buttons: [
          {
            text: 'Close',
            role: 'cancel'
          },
        ]
      });
      alert.present();
    };
    reader.readAsDataURL(blob);
  }

  openFileExternally(blob: Blob, fileName: string, mimeType: string) {
    const filePath = this.file.dataDirectory + fileName;

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
  }

  isImage(mimeType: string): boolean {
    return mimeType && mimeType.startsWith('image/');
  }

  getFileTypeDescription(mimeType: string): string {
    const typeMap = {
      'application/pdf': 'PDF Document',
      'application/msword': 'Word Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
      'application/vnd.ms-excel': 'Excel Spreadsheet',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet',
      'text/plain': 'Text File',
      'image/jpeg': 'JPEG Image',
      'image/png': 'PNG Image',
      'image/gif': 'GIF Image'
    };
    return typeMap[mimeType] || 'Unknown File Type';
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

  deleteExistingFile(index: number) {
    const file = this.existingFiles[index];
    
    let alert = this.alertCtrl.create({
      title: 'Delete File',
      message: `Are you sure you want to delete "${file.File_Name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.performDeleteFile(index, file);
          }
        }
      ]
    });
    alert.present();
  }

  private performDeleteFile(index: number, file: any) {
    let loading = this.loadingCtrl.create({
      content: 'Deleting file...',
      spinner: 'crescent'
    });
    
    loading.present();

    this.storage.get('token').then((val) => {
      const deleteUrl = `${SERVER_URL}/deleteCompanyFile/${file.Id}?token=${val.token}`;
      const deleteData = {
        fileName: file.File_Name,
        fileId: file.id || file.File_Id
      };
      
      this.http.post(deleteUrl, deleteData).subscribe(
        (response: any) => {
          loading.dismiss();
          if (response.success || response == 1) {
            this.existingFiles.splice(index, 1);
            let toast = this.toast.create({
              message: 'File deleted successfully',
              duration: 2000,
              position: 'bottom'
            });
            toast.present();
          } else {
            this.displayErrorAlert('Failed to delete file');
          }
        },
        error => {
          loading.dismiss();
          console.error('Error deleting file:', error);
          this.displayErrorAlert('Error deleting file');
        }
      );
    });
  }

  submit() {
    let loading = this.loadingCtrl.create({
      content: "Submitting..",
      spinner: 'crescent'
    });
  
    this.storage.get('token').then((val) => {

      loading.present();
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();

         Promise.all(defs).then((res) => {
          
          this.formData.append('DealId', this.Id2);
          this.formData.append("status", this.Status);
          this.formData.append("company_name", this.Company_Name);
          this.formData.append("customer_name", this.Customer_Name);
          this.formData.append("contact_no", this.getFinalContactNo());
          this.formData.append("email", this.Email);
          this.formData.append("address", this.Address);
          this.formData.append("country", this.Country.Option);
          this.formData.append("state", this.State.Option);
          this.formData.append("area", this.Area.Option);
          this.formData.append("priority", this.Priority.Option);
          this.formData.append("source", this.Source.Option);
          this.formData.append("type", this.Type.Option);
          this.formData.append("custom_type", this.Custom_Type);
          this.formData.append("action_plan", this.Action_Plan ? this.Action_Plan.Option : "");
          this.formData.append("company_type", this.getFinalCompanyType());
          this.formData.append("approach_since", this.Approach_Since);
          this.formData.append("remarks", this.Remarks);
          this.formData.append("companyId", this.CompanyId);
          console.log(JSON.stringify(res))
          console.log('all preparation done')
          resolveReady();
        })

        console.log(this.formData)

        if (this.fileBlobs && this.fileBlobs.length > 0) {
          for (let i = 0; i < this.fileBlobs.length; i++) {
            const blob = this.fileBlobs[i];
            const fileName = this.selectedFiles[i].name;
            this.formData.append("files[]", blob, fileName);
          }
        }
      });
      p.then(() => {
        return this.http.post(SERVER_URL + '/updateDeal?token=' + val.token, this.formData,
          {})
          .pipe(
            catchError(this.handleError)
          )
          .finally(() => {
            console.log(this.formData)
            loading.dismiss();
          })
        .subscribe(
          (res: any) =>{                      
            if (res == 1) {
              console.log(JSON.stringify(res))
              this.navCtrl.pop();
              let toast = this.toast.create({
                message: "Lead Info Updated",
                position: "middle",
                closeButtonText: "Ok",
                showCloseButton: true,
                cssClass: "red",
              });

              toast.present();

            } else {
              var obj = res;
              console.log(obj);
              var errormessage ="";

              for (var item in obj) {
                errormessage = obj[item];
                console.log(errormessage);

              }

              let toast = this.toast.create({
                message: errormessage[0],
                position: "middle",
                closeButtonText: "Ok",
                showCloseButton: true,
                cssClass: "red",
              });

              toast.present();

              
            }
        })
      });
    });
  }

  cancel(){
    this.navCtrl.pop();
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
        console.error('An error occurred:', error.error.message);
        return Observable.throw('An error occurred:' + error.error.message);
    } else {      
        console.error( 
            `Backend returned code ${JSON.stringify(error)}, ` +
            `body was: ${JSON.stringify(error)}`);
        if (error.status == 422) {
            return Observable.throw('Invalid username or password');
        }
        return Observable.throw('An error occured. Try again later');        
    }   
  };

}

