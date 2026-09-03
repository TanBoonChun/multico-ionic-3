import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, Platform, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { SERVER_URL } from '../../environment';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FileChooser } from '@ionic-native/file-chooser';
import { File, FileEntry } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FilePath } from '@ionic-native/file-path';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { catchError } from 'rxjs/operators';


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
  selector: 'page-customernew',
  templateUrl: 'customernew.html',
})
export class CustomernewPage {

  public leadForm: FormGroup;
  formData: FormData;
  imageURI:any;
  images = [];
  imagesN = [];
  CU_Name: any='';
  CO_Name: any='';
  Customer_Name: any='';
  Contact_No: any='';
  CO_No: any='';
  Office_No: any='';
  Fax_No: any='';
  Email: any='';
  Address: any='';
  Remarks: any='';
  CO_Code: any='';
  Status: any='';
  Country: any='';
  country: any=[];
  currentUserId: any;
  State: any='';
  state: any=[];
  Priority: any='';
  priority: any=[];
  Source: any='';
  source: any=[];
  Type: any='';
  type: any=[];
  Approach_Since: any='';
  Custom_Country: any='';
  Custom_Type: any='';
  Region: any='';
  region: any=[];
  department: any='';

  selectedFiles: any[] = []; // Store file objects with metadata
  fileBlobs: Blob[] = []; // Store actual file data

  // Flag to track if form has been submitted
  // submitted: boolean = false;

  // compareWith : any ;
  // MyDefaultYearIdValue : string ;

  // signup={
  //   state:0
  // }

  constructor(
    public navCtrl: NavController, 
    private storage: Storage,
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    public http: HttpClient,
    private toast: ToastController,  
    private base64: Base64,
    private imagePicker: ImagePicker,
    public alertCtrl: AlertController,
    private fileChooser: FileChooser,
    private fileOpener: FileOpener,
    private file: File,
    private filePath: FilePath,
    public loadingCtrl: LoadingController,
    public platform: Platform,
    private filePicker: IOSFilePicker,
    public navParams: NavParams) {

      this.loadData();
  }

  loadData(){
    let data:Observable<any>;

    this.storage.get('user').then((val) => {
     this.currentUserId = val.UserId;
     this.department = val.Department;
    });

    // Company
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
      data = this.http.get(SERVER_URL + '/getRegion/?token=' + val.token );
      data.subscribe(result => {
        this.region = result;
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

  }

  ngOnInit() {
    this.leadForm = new FormGroup({
      Status: new FormControl('', []),
      CO_Name: new FormControl('', [Validators.required]),
      Customer_Name: new FormControl('', []),
      Contact_No: new FormControl('', [Validators.required]),
      Email: new FormControl('', []),
      Address: new FormControl('', []),
      Country: new FormControl('', [Validators.required]),
      Custom_Country: new FormControl('', []),
      State: new FormControl('', []),
      Region: new FormControl('', []),
      Source: new FormControl('', [Validators.required]),
      Type: new FormControl('', [Validators.required]),
      Custom_Type: new FormControl('', [Validators.required]),
      Priority: new FormControl('', []),
      Approach_Since: new FormControl('', []),
      CO_No: new FormControl('', []),
      Remarks: new FormControl('', []),
    })

    this.leadForm.get('Country').valueChanges.subscribe(country => {
      const value = (country || '').toString().toUpperCase();
      if (country === 'KLANG VALLEY') {
        this.leadForm.get('Region').setValidators([Validators.required]);
        this.leadForm.get('State').clearValidators();
        this.leadForm.get('Custom_Country').clearValidators();
      } 
      else if (country === 'OTHER STATES (MALAYSIA)') {
        this.leadForm.get('State').setValidators([Validators.required]);
        this.leadForm.get('Region').clearValidators();
        this.leadForm.get('Custom_Country').clearValidators();
      } 
      else if (country === 'INTERNATIONAL') {
        this.leadForm.get('Custom_Country').setValidators([Validators.required]);
        this.leadForm.get('State').clearValidators();
        this.leadForm.get('Region').clearValidators();
      } 
      else {
        // default: clear all conditional validators
        this.leadForm.get('State').clearValidators();
        this.leadForm.get('Region').clearValidators();
        this.leadForm.get('Custom_Country').clearValidators();
      }

      // update validity
      this.leadForm.get('State').updateValueAndValidity();
      this.leadForm.get('Region').updateValueAndValidity();
      this.leadForm.get('Custom_Country').updateValueAndValidity();
    });

    this.leadForm.get('Type').valueChanges.subscribe(type => {
      const value = (type || '').toString().toUpperCase();
      if (type === 'OTHERS') {
        this.leadForm.get('Custom_Type').setValidators([Validators.required]);
      } else {
        this.leadForm.get('Custom_Type').clearValidators();
      }

      this.leadForm.get('Custom_Type').updateValueAndValidity();

    });

  }
  

  ionViewDidLoad() {
    console.log('ionViewDidLoad CustomernewPage');
  }

  act:any[]=[
    {
      id:1,
      name:'Active'
    },
    {
      id:2,
      name:'Inactive'
    }
  ];

  checkups(): string[] {
    return [
      "foo",
      "bar",
      "baz"
    ];
  }

  checkup: string = "bar";

  logChosen(): void {
    console.log(this.checkup);
  }


  compareWithFn(o1, o2) {
    return o1 === o2;
  };

  // Add this property to your component class
  rocExists: boolean = false;

  // Method to check if ROC exists
  checkROCExists(roc: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.get('token').then((val) => {
        this.http.post(SERVER_URL + '/checkROC?token=' + val.token, {
          roc: roc
        }, httpOptions)
        .subscribe(
          (res: any) => {
            resolve(res.exists);
          },
          (error) => {
            reject(error);
          }
        );
      });
    });
  }


  // Check if required fields are valid
  // isFieldValid(fieldName: string): boolean {
  //   if (!this.submitted) {
  //     return true;
  //   }
    
  //   switch(fieldName) {
  //     case 'CO_Name':
  //       return this.CO_Name && this.CO_Name.trim() !== '';
  //     case 'Customer_Name':
  //       return this.Customer_Name && this.Customer_Name.trim() !== '';
  //     case 'CO_No':
  //       // ROC is not required, but if provided, it shouldn't exist
  //       if (!this.CO_No || this.CO_No.trim() === '') {
  //         return true; // Field is optional, so empty is valid
  //       }
  //       return !this.rocExists; // If has value, check it doesn't exist
  //     case 'Contact_No':
  //       return this.Contact_No && this.Contact_No.trim() !== '';
  //     case 'Office_No':
  //       return this.Office_No && this.Office_No.trim() !== '';
  //     case 'Email':
  //       return this.Email && this.Email.trim() !== '' && this.validateEmail(this.Email);
  //     case 'Address':
  //       return this.Address && this.Address.trim() !== '';
  //     default:
  //       return true;
  //   }
  // }
  
  // // Validate email format
  // validateEmail(email: string): boolean {
  //   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //   return emailRegex.test(email);
  // }
  
  // // Check if all required fields are filled
  // validateForm(): boolean {
  //   return this.isFieldValid('CO_Name') && 
  //          this.isFieldValid('Customer_Name') && 
  //          this.isFieldValid('CO_No') && 
  //          this.isFieldValid('Contact_No') && 
  //          this.isFieldValid('Office_No') && 
  //          this.isFieldValid('Email') && 
  //          this.isFieldValid('Address');
  // }
  
  // Replace your chooseFiles method with this version that handles content URIs:

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

// Handle content:// URIs (modern Android)
async handleContentUri(fileUri: string) {
  try {
    console.log('Handling content URI:', fileUri);

    const fileEntry: any = await new Promise((resolve, reject) => {
      (window as any).resolveLocalFileSystemURL(fileUri, resolve, reject);
    });

    console.log('File entry:', fileEntry);

    const cordovaFile: any = await new Promise((resolve, reject) => {
      fileEntry.file(resolve, reject);
    });

    console.log('Cordova File object:', cordovaFile);

    // --- Fix: ensure fileName + extension ---
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

    console.log("handle contetn uri", fileName)

    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];

    if (allowedExtensions.indexOf(fileExtension) === -1) {
      this.displayErrorAlert(
        'File type not supported. Supported types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF'
      );
      return;
    }

    // --- ✅ Fix: actually read the file into an ArrayBuffer ---
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

    console.log('File added successfully:', fileObj);

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

// --- Fallback method for content URIs ---
async handleContentUriFallback(fileUri: string) {
  try {
    console.log('Using fallback method for content URI');

    const tempFileName = 'selected_file_' + Date.now();

    // Read the file as blob via XHR
    const blob = await this.readContentUriAsBlob(fileUri);

    // --- ✅ Ensure fileName + extension ---
    let fileName: string;

    // Try to use the fileEntry name if available (though we may not have it here)
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

    // Ensure extension from MIME type
    if (!fileName.includes('.')) {
      const extension = this.getExtensionFromMimeType(blob.type);
      fileName = fileName + '.' + extension;
    }

    console.log("Handle content uri fall back",fileName)
    let fileType = blob.type;

    if (!fileType) {
      // Default if unknown
      fileType = 'application/pdf';
      fileName = tempFileName + '.pdf';
    } else {
      const extension = this.getExtensionFromMimeType(fileType);
      fileName = tempFileName + '.' + extension;
    }

    // Validate extension
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = fileName.toLowerCase().split('.').pop();

    if (allowedExtensions.indexOf(fileExtension) === -1) {
      this.displayErrorAlert(
        'File type not supported. Supported types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF'
      );
      return;
    }

    // --- ✅ Re-read blob safely into ArrayBuffer ---
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

    console.log('File added via fallback method:', fileObj);

    let toast = this.toast.create({
      message: 'File "' + fileName + '" selected successfully',
      duration: 2000,
      position: 'bottom',
    });
    toast.present();

  } catch (error) {
    console.error('Fallback method also failed:', error);
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
    console.log("handle file uri", fileName)

    const directory = pathParts.join('/') + '/';

    // Allowed extensions
    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
    const fileExtension = fileName.toLowerCase().split('.').pop();

    if (allowedExtensions.indexOf(fileExtension) === -1) {
      this.displayErrorAlert(
        'File type not supported. Supported types: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF'
      );
      return;
    }

    // --- ✅ Always read into ArrayBuffer using FileReader for consistency ---
    let blob: Blob;

    try {
      // Try ArrayBuffer read
      const arrayBuffer = await this.file.readAsArrayBuffer(directory, fileName);
      blob = new Blob([arrayBuffer], { type: this.getMimeTypeFromExtension(fileName) });
    } catch (error) {
      console.warn('ArrayBuffer read failed, falling back to DataURL:', error);

      // Fallback → read as DataURL then convert to Blob
      const fileData = await this.file.readAsDataURL(directory, fileName);
      const response = await fetch(fileData);
      const tempBlob = await response.blob();

      // Ensure binary-safe by re-reading with FileReader
      // Correctly typed FileReader → ArrayBuffer
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
        reader.readAsArrayBuffer(tempBlob); // or cordovaFile depending on context
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

    console.log('File added successfully:', fileObj);

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

// Read content URI as blob using XMLHttpRequest
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

// Get file extension from MIME type
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

// Your existing getMimeTypeFromExtension method (keep this)
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

  // Method to remove a selected file
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.fileBlobs.splice(index, 1);
  }

  // Method to choose multiple files (call chooseFiles multiple times)
  async chooseMultipleFiles() {
    // Show alert asking how many files to select
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

  // Preview image files
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
          // {
          //   text: 'Remove File',
          //   handler: () => {
          //     this.removeFileByName(fileName);
          //   }
          // }
        ]
      });
      alert.present();
    };
    reader.readAsDataURL(blob);
  }

  // Preview PDF files (show basic info since PDF preview requires external library)
  previewPDF(blob: Blob, fileName: string) {
    const fileSizeKB = (blob.size / 1024).toFixed(2);
    
    let alert = this.alertCtrl.create({
      title: 'PDF File Preview',
      message: `
        <div style="text-align: center;">
          <ion-icon name="document" style="font-size: 48px; color: #d32f2f;"></ion-icon>
          <h4>${fileName}</h4>
          <p>Size: ${fileSizeKB} KB</p>
          <p>Type: PDF Document</p>
          <small>PDF preview not available. File will be uploaded with your form.</small>
        </div>
      `,
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        },
        // {
        //   text: 'Open Externally',
        //   handler: () => {
        //     this.openFileExternally(blob, fileName);
        //   }
        // },
        // {
        //   text: 'Remove File',
        //   handler: () => {
        //     this.removeFileByName(fileName);
        //   }
        // }
      ]
    });
    alert.present();
  }

  openFileExternally(blob: Blob, fileName: string, mimeType: string) {
    // Choose a path (e.g., app's data directory)
    const filePath = this.file.dataDirectory + fileName;

    // Convert blob into ArrayBuffer
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
  
  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }

  cancel(){
    this.navCtrl.pop();
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: false,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
    }
    
    this.camera.getPicture(options).then((imageData) => {
      if(this.platform.is('ios')){
        let filePath = imageData
        let fileName = filePath.split('/').pop();
        let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
        this.file.readAsDataURL(path, fileName)
        .then(base64File => {
          path = this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
        })
        .catch(() => {
          console.log('Error reading file');
        })
      }else{
        
        this.base64.encodeFile(imageData).then((base64File: string) => {
          this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
        }, (err) => {
          console.log(err);
        });
      }
      this.images.push(imageData)
      console.log(imageData)
      
    }, (err) => {
    this.displayErrorAlert(err);
    });
  }

  clearImage() {
    this.images.length = 0
    this.imagesN.length = 0
  }
    
  getImage() {
    const options: ImagePickerOptions = {
      quality: 70,            
      outputType: 0,                  
    }
    if(this.platform.is('ios')){
      this.imagePicker.hasReadPermission().then(res => {
        if (res) {
          this.imagePicker.getPictures({}).then((results) => {
            for (var i = 0; i < results.length; i++) {
              console.log('Image URI: ' + results[i]);          
              this.base64.encodeFile(results[i]).then((base64File: string) => {
                this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
              }, (err) => {
                console.log(err);
              });

              this.images.push('file://'+results[i])
              let filePath = 'file://'+results[i]
              let fileName = filePath.split('/').pop();
              let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

              this.file.readAsDataURL(path, fileName)
              .then(base64File => {
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
              })
              .catch(() => {
                console.log('Error reading file');
              });
            }
          }, (err) => { });
        } else {
          this.imagePicker.requestReadPermission().then(res => {
            this.imagePicker.getPictures({}).then((results) => {
              for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]);          
                this.images.push(results[i])
                this.base64.encodeFile(results[i]).then((base64File: string) => {
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
                }, (err) => {
                  console.log(err);
                });

                this.images.push('file://'+results[i])
              let filePath = 'file://'+results[i]
              let fileName = filePath.split('/').pop();
              let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

              this.file.readAsDataURL(path, fileName)
              .then(base64File => {
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
              })
              .catch(() => {
                console.log('Error reading file');
              });
              }
            }, (err) => { });
          })
        }
      })
    } else {
      this.imagePicker.hasReadPermission().then(res => {
        if (res) {
          this.imagePicker.getPictures({}).then((results) => {
            for (var i = 0; i < results.length; i++) {
                console.log('Image URI: ' + results[i]);
                this.images.push(results[i])
                this.base64.encodeFile(results[i]).then((base64File: string) => {
                  this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
                }, (err) => {
                  console.log(err);
                });
            }
          }, (err) => { });
        } else {
          this.imagePicker.requestReadPermission().then(res => {
            this.imagePicker.getPictures({}).then((results) => {
              for (var i = 0; i < results.length; i++) {
                  console.log('Image URI: ' + results[i]);
                  this.images.push(results[i])
                  this.base64.encodeFile(results[i]).then((base64File: string) => {
                    this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
                  }, (err) => {
                    console.log(err);
                  });
              }
            }, (err) => { });
          })
        }
      })
    }
  }

  submit() {
    if (this.Status == "") {
      this.Status = "New";
    }

    if (this.department.toUpperCase() === 'SALES') {
      this.Source = { Option: 'SALESMAN WALK IN' };
    }

    let loading = this.loadingCtrl.create({
      content: "Creating New Lead",
      spinner: 'crescent'
    });

    this.storage.get('token').then((val) => {
      loading.present();
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();
        this.images.forEach((i) => {
          console.log('processing '+i);
          var self = this;        
          var def = new Promise((resolve) => {
            this.file.resolveLocalFilesystemUrl(i)
            .then((entry: FileEntry) => {
              entry.file(function(file) {          
                console.log('now i have a file ob', file.name);
                console.dir(JSON.stringify(file));
                var reader = new FileReader();
                reader.onloadend = function(e) {
                  var imgBlob = new Blob([this.result], { type:file.type});
                  self.formData.append('files[]', imgBlob, file.name);
                  resolve(i)
                };
                reader.readAsArrayBuffer(file);           
              }, function(e) {
                console.log('error getting file', e);
              });			
            }, (err) => {
              console.log("Put error message here", JSON.stringify(err));
            })
          });
          defs.push(def)
      });
      
      Promise.all(defs).then((res) => {
        this.formData.append("status", this.Status);
        this.formData.append("company_name", this.CO_Name);
        this.formData.append("customer_name", this.Customer_Name);
        this.formData.append("contact_no", this.Contact_No);
        this.formData.append("email", this.Email);
        this.formData.append("address", this.Address);
        this.formData.append("country", this.Country.Option);
        this.formData.append("state", this.State.Option);
        this.formData.append("custom_country", this.Custom_Country);
        this.formData.append("region", this.Region.Option);
        this.formData.append("priority", this.Priority.Option);
        this.formData.append("source", this.Source.Option);
        this.formData.append("type", this.Type.Option);
        this.formData.append("custom_type", this.Custom_Type);
        this.formData.append("approach_since", this.Approach_Since);
        this.formData.append("co_no", this.CO_No);
        this.formData.append("remarks", this.Remarks);
        resolveReady();
      })
      
      
      if (this.fileBlobs && this.fileBlobs.length > 0) {
        for (let i = 0; i < this.fileBlobs.length; i++) {
          const blob = this.fileBlobs[i];
          const fileName = this.selectedFiles[i].name;
          this.formData.append("files[]", blob, fileName);
        }
      }
    });

    p.then(() => {
      return this.http.post(SERVER_URL + '/newcustomer?token=' + val.token, this.formData, {})
      .pipe(
        catchError(this.handleError)
      )
      .finally(() => {
        loading.dismiss();
      })
      .subscribe(
        (res: any) => {
          console.log(res);

          if (res == 1) {
            this.navCtrl.pop();
            let toast = this.toast.create({
              message: "New Lead created",
              position: "middle",
              closeButtonText: "Ok",
              showCloseButton: true,
              cssClass: "red",
            });
            toast.present();
          } else {
            var errormessage = res;
            this.displayErrorAlert(errormessage);
          }
        },
        (err) => {
          console.error("Upload error:", err);
        }
      );
    })
    
  });
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

