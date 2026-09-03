import { catchError } from 'rxjs/operators';
import { Component } from '@angular/core';
import { ModalController,IonicPage, NavController, NavParams, normalizeURL, Platform, ToastController } from 'ionic-angular';
import { ElementRef, ViewChild} from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AlertController } from 'ionic-angular';
import { Base64 } from '@ionic-native/base64';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { FileChooser } from '@ionic-native/file-chooser';
import { File, FileEntry } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FilePath } from '@ionic-native/file-path';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { AnimationFrameScheduler } from 'rxjs/scheduler/AnimationFrameScheduler';
import { IOSFilePicker } from '@ionic-native/file-picker';


const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}
import { SERVER_URL } from '../../environment';
/**
 * Generated class for the AttachmentPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-attachment',
  templateUrl: 'attachment.html',
})
export class AttachmentPage {

  formData: FormData;
  imageURI:any;

  images = [];
  images2 = [];

  imagesN = [];
  imagesN2 = [];

  PO:any='';
  PO_No:any='';
  PO_Date:any='';
  PO_Currency:any='';
  PO_Amount:any='';
  PO_Remarks:any='';
  Quo:any='';
  Quo_No:any='';
  Quo_Date:any='';
  Quo_Currency:any='';
  Quo_Amount:any='';
  Quo_Remarks:any='';
  attachment_type_po:any="PO";
  attachment_type_qo:any="Quotation";
  type:any='';
  Quotation_Amount:any='';
  Quotation_Date:any='';
  Quotation_No:any='';
  Quotation_Remarks:any='';


  dealId:any='';
  Company_Name:any;
  Title:any;
  scheduleId: any='';
  details:any='';
  items:any='';

  selectedFiles: any[] = []; // Store file objects with metadata
  fileBlobs: Blob[] = [];
  selectedFiles2: any[] = []; // Store file objects with metadata
  fileBlobs2: Blob[] = [];

  existingQuoFiles: any[] = [];
  existingPoFiles: any[] = [];

  quoFiles: any[] = [];
  poFiles: any[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private camera: Camera,
    public alertCtrl: AlertController,
    private fileChooser: FileChooser,
    private fileOpener: FileOpener,
    private file: File,
    private filePath: FilePath,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private toast: ToastController,    
    private base64: Base64,
    private imagePicker: ImagePicker,
    public modalCtrl: ModalController,
    public platform: Platform,
    public loadingCtrl: LoadingController,
    private filePicker: IOSFilePicker
  ) {
    console.log(this.navParams)
    this.dealId=this.navParams.get('DealId'),
    this.Company_Name=this.navParams.get('Company_Name'),
    this.Title=this.navParams.get('Title')
    this.scheduleId=this.navParams.get('Id');
    this.type=this.navParams.get('type');
    this.PO_Amount=this.navParams.get('PO_Amount')
    this.PO_Date=this.navParams.get('PO_Date')
    this.PO_No=this.navParams.get('PO_No')
    this.PO_Remarks=this.navParams.get('PO_Remarks')
    this.Quo_Amount=this.navParams.get('Quotation_Amount')
    this.Quo_Date=this.navParams.get('Quotation_Date')
    this.Quo_No=this.navParams.get('Quotation_No')
    this.Quo_Remarks=this.navParams.get('Quotation_Remarks')
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AttachmentPage');
    let data:Observable<any>;
    this.loadExistingQuoFiles();
    this.loadExistingPoFiles();

   this.storage.get('token').then((val) => {
    data = this.http.get(SERVER_URL + '/getdealdetail/'+this.dealId+'?token=' + val.token );
    data.subscribe(result => {
      this.details = result;

      this.PO_Amount=this.details[0].PO_Amount
      this.PO_Date=this.details[0].PO_Date
      this.PO_No=this.details[0].PO_No
      this.PO_Remarks=this.details[0].PO_Remarks
      this.Quo_Amount=this.details[0].Quotation_Amount
      this.Quo_Date=this.details[0].Quotation_Date
      this.Quo_No=this.details[0].Quotation_No
      this.Quo_Remarks=this.details[0].Quotation_Remarks
    })
  });
  }

  loadExistingQuoFiles() {
    this.storage.get('token').then((val) => {
      const data = this.http.get<any>(SERVER_URL + '/getDealQuoFiles/' + this.dealId + '?token=' + val.token);
      data.subscribe(result => {
        this.existingQuoFiles = result.quoFiles || [];
        console.log('Existing files loaded:', this.existingQuoFiles);
      }, error => {
        console.error('Error loading existing files:', error);
      });
    });
  }

  loadExistingPoFiles() {
    this.storage.get('token').then((val) => {
      const data = this.http.get<any>(SERVER_URL + '/getDealPoFiles/' + this.dealId + '?token=' + val.token);
      data.subscribe(result => {
        this.existingPoFiles = result.poFiles || [];
        console.log('Existing files loaded:', this.existingPoFiles);
      }, error => {
        console.error('Error loading existing files:', error);
      });
    });
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

  onTakePicture2() {
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
          path = this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
        })
        .catch(() => {
          console.log('Error reading file');
        })
      }else{
        
        this.base64.encodeFile(imageData).then((base64File: string) => {
          this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
        }, (err) => {
          console.log(err);
        });
      }
      this.images2.push(imageData)
      console.log(imageData)

    }, (err) => {
    this.displayErrorAlert(err);
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

  clearImage2() {
    this.images2.length = 0
    this.imagesN2.length = 0
  }

  getImage2() {
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
                this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
              }, (err) => {
                console.log(err);
              });

              this.images2.push('file://'+results[i])
              let filePath = 'file://'+results[i]
              let fileName = filePath.split('/').pop();
              let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

              this.file.readAsDataURL(path, fileName)
              .then(base64File => {
                  this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
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
                this.images2.push(results[i])
                this.base64.encodeFile(results[i]).then((base64File: string) => {
                  this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
                }, (err) => {
                  console.log(err);
                });

                this.images.push('file://'+results[i])
              let filePath = 'file://'+results[i]
              let fileName = filePath.split('/').pop();
              let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

              this.file.readAsDataURL(path, fileName)
              .then(base64File => {
                  this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File))
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
                this.images2.push(results[i])
                this.base64.encodeFile(results[i]).then((base64File: string) => {
                  this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
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
                  this.images2.push(results[i])
                  this.base64.encodeFile(results[i]).then((base64File: string) => {
                    this.imagesN2.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',')+1)))
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

  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
  
    var day = ('0'+ d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + '-' + monthNames[monthIndex] + '-' + year;
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

  submitPO(){
    let loading = this.loadingCtrl.create({
      content: "Submitting PO Update",
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
                  self.formData.append('PO[]', imgBlob, file.name);
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
          this.formData.append('attachment_type',this.attachment_type_po);
          this.formData.append('dealid', this.dealId);
          this.formData.append('PO', this.PO);
          this.formData.append('po_no',this.PO_No);
          // this.formData.append('po_date',this.myFunction(this.PO_Date));
          // this.formData.append('po_amount',this.PO_Amount);
          // this.formData.append('currency',this.PO_Currency);
          this.formData.append('po_remarks',this.PO_Remarks);
          // this.formData.append('attachment_type',"PO");
          // this.formData.append('attachment_type','PO');

          console.log(JSON.stringify(res))
          console.log('all preparation done')
          resolveReady();
        })

        if (this.fileBlobs && this.fileBlobs.length > 0) {
          for (let i = 0; i < this.fileBlobs.length; i++) {
            const blob = this.fileBlobs[i];
            const fileName = this.selectedFiles[i].name;
            this.formData.append("PO[]", blob, fileName);
          }
        }
      });
      p.then(() => {
        return this.http.post(SERVER_URL + '/postAttachment?token=' + val.token, this.formData,
          {})
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
                message: "PO Info Updated",
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
        }, (error: any) => {

          let errorMessage =  error.error.errors.po_or_file[0];
          let toast = this.toast.create({
            message: errorMessage,
            position: "middle",
            closeButtonText: "Ok",
            showCloseButton: true,
            cssClass: "red",
          });

          toast.present();
        })
      });
    });
  }

  async chooseFiles2() {
    try {
      if(this.platform.is('ios')) {
        const fileUri = await this.filePicker.pickFile();
        await this.handleFileUri2("file://" + fileUri);

      } else {
        const fileUri = await this.fileChooser.open();
              
        if (fileUri.startsWith('content://')) {
          await this.handleContentUri2(fileUri);
        } else {
          await this.handleFileUri2(fileUri);
        }
      }
      
    } catch (err) {
      if (err !== 'cancelled') {
        this.displayErrorAlert('Error selecting file');
      }
    }
  }

  async handleContentUri2(fileUri: string) {
    try {
      const fileEntry: any = await new Promise((resolve, reject) => {
        (window as any).resolveLocalFileSystemURL(fileUri, resolve, reject);
      });

      const cordovaFile: any = await new Promise((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });

      let fileName: string = fileEntry.name || cordovaFile.name || ('selected_file_' + Date.now());
      if (!fileName.includes('.')) {
        const mimeExt = this.getExtensionFromMimeType2(cordovaFile.type);
        fileName = fileName + '.' + mimeExt;
      }
      let fileExtension = fileName.toLowerCase().split('.').pop();

      if (!fileExtension || fileExtension === fileName.toLowerCase()) {
        const mimeExt = this.getExtensionFromMimeType2(cordovaFile.type);
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
        type: cordovaFile.type || this.getMimeTypeFromExtension2(fileName),
      });

      const fileObj = {
        name: fileName,
        uri: fileUri,
        path: fileUri,
        size: cordovaFile.size,
        type: cordovaFile.type || this.getMimeTypeFromExtension2(fileName),
      };

      this.selectedFiles2.push(fileObj);
      this.fileBlobs2.push(blob);


      let toast = this.toast.create({
        message: 'File "' + fileName + '" selected successfully',
        duration: 2000,
        position: 'bottom',
      });
      toast.present();
    } catch (error) {
      console.error('Error handling content URI:', error);
      await this.handleContentUriFallback2(fileUri);
    }
  }

  async handleContentUriFallback2(fileUri: string) {
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
        const extension = this.getExtensionFromMimeType2(blob.type);
        fileName = fileName + '.' + extension;
  }
      let fileType = blob.type;

      if (!fileType) {
        fileType = 'application/pdf';
        fileName = tempFileName + '.pdf';
      } else {
        const extension = this.getExtensionFromMimeType2(fileType);
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

      this.selectedFiles2.push(fileObj);
      this.fileBlobs2.push(safeBlob);

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

  async handleFileUri2(fileUri: string) {
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
        const mimeExt = this.getExtensionFromMimeType2(fileName);
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
        blob = new Blob([arrayBuffer], { type: this.getMimeTypeFromExtension2(fileName) });
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

        blob = new Blob([arrayBuffer], { type: tempBlob.type || this.getMimeTypeFromExtension2(fileName) });
      }

      const fileObj = {
        name: fileName,
        uri: fileUri,
        path: filePath,
        size: blob.size,
        type: blob.type || this.getMimeTypeFromExtension2(fileName),
      };

      this.selectedFiles2.push(fileObj);
      this.fileBlobs2.push(blob);

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

  readContentUriAsBlob2(uri: string): Promise<Blob> {
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

  getExtensionFromMimeType2(mimeType: string): string {
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

  getMimeTypeFromExtension2(fileName: string): string {
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

  removeFile2(index: number) {
    this.selectedFiles2.splice(index, 1);
    this.fileBlobs2.splice(index, 1);
  }

  async chooseMultipleFiles2() {
    let alert = this.alertCtrl.create({
      title: 'Select Files',
      message: 'You can select multiple files one by one. Click "Add Another File" to continue selecting.',
      buttons: [
        {
          text: 'Select File',
          handler: () => {
            this.chooseFiles2();
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

  previewFile2(index: number) {
    const file = this.selectedFiles2[index];
    const blob = this.fileBlobs2[index];
    
    if (this.isImage2(file.type)) {
      this.previewImage2(blob, file.name);
    } else if (file.type === 'application/pdf') {
      this.openFileExternally2(blob, file.name, file.type);
    } 
  }

  previewImage2(blob: Blob, fileName: string) {
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
          }
        ]
      });
      alert.present();
    };
    reader.readAsDataURL(blob);
  }

  openFileExternally2(blob: Blob, fileName: string, mimeType: string) {
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

  isImage2(mimeType: string): boolean {
    return mimeType && mimeType.startsWith('image/');
  }

  getFileTypeDescription2(mimeType: string): string {
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

  submitQO(){
    let loading = this.loadingCtrl.create({
      content: "Submitting Quotation Update",
      spinner: 'crescent'
    });
  
    this.storage.get('token').then((val) => {
      loading.present();
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();
        this.images2.forEach((i) => {
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
                  self.formData.append('Quotation[]', imgBlob, file.name);
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
          this.formData.append('attachment_type',this.attachment_type_qo);
          this.formData.append('dealid', this.dealId);
          this.formData.append('quotation_no',this.Quo_No);
          // this.formData.append('quotation_date',this.myFunction(this.Quo_Date));
          // this.formData.append('quotation_amount',this.Quo_Amount);
          this.formData.append('quotation_remarks',this.Quo_Remarks);
          resolveReady();
        })

        if (this.fileBlobs2 && this.fileBlobs2.length > 0) {
          for (let i = 0; i < this.fileBlobs2.length; i++) {
            const blob = this.fileBlobs2[i];
            const fileName = this.selectedFiles2[i].name;
            this.formData.append("Quotation[]", blob, fileName);
          }
        }
        
      });
      p.then(() => {
        return this.http.post(SERVER_URL + '/postAttachment2?token=' + val.token, this.formData,
          {})
          
          .finally(() => {
            loading.dismiss();
          })
        .subscribe(
          (res: any) =>{                      
            if (res == 1) {
              console.log(JSON.stringify(res))
              this.navCtrl.pop();
              let toast = this.toast.create({
                message: "Quotation Info Updated",
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
        }, (error: any) => {
          let errorMessage = error.error.errors.quotation_or_file[0];
          let toast = this.toast.create({
            message: errorMessage,
            position: "middle",
            closeButtonText: "Ok",
            showCloseButton: true,
            cssClass: "red",
          });

          toast.present();
        })
      });
    });
  }

  previewExistingQuoFile(index: number) {
    const file = this.existingQuoFiles[index];
    
    if (this.isImageByName(file.File_Name)) {
      this.previewExistingImage(file, 'quo');
    } else {
      this.openExistingFileExternally(file, 'quo');
    }
  }

  previewExistingPoFile(index: number) {
    const file = this.existingPoFiles[index];
    
    if (this.isImageByName(file.File_Name)) {
      this.previewExistingImage(file, 'po');
    } else {
      this.openExistingFileExternally(file, 'po');
    }
  }

  previewExistingImage(file: any, type: 'quo' | 'po') {
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

  openExistingFileExternally(file: any, type: 'quo' | 'po') {
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

  deleteExistingQuoFile(index: number) {
    const file = this.existingQuoFiles[index];
    
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
            this.performDeleteQuoFile(index, file);
          }
        }
      ]
    });
    alert.present();
  }

  deleteExistingPoFile(index: number) {
    const file = this.existingPoFiles[index];
    
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
            this.performDeletePoFile(index, file);
          }
        }
      ]
    });
    alert.present();
  }

  private performDeleteQuoFile(index: number, file: any) {
    let loading = this.loadingCtrl.create({
      content: 'Deleting file...',
      spinner: 'crescent'
    });
    
    loading.present();

    this.storage.get('token').then((val) => {
      const deleteUrl = `${SERVER_URL}/deleteQuoFile/${file.Id}?token=${val.token}`;
      const deleteData = {
        fileName: file.File_Name,
        fileId: file.id || file.File_Id
      };
      
      this.http.post(deleteUrl, deleteData).subscribe(
        (response: any) => {
          loading.dismiss();
          if (response.success || response == 1) {
            this.existingQuoFiles.splice(index, 1);
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

  private performDeletePoFile(index: number, file: any) {
    let loading = this.loadingCtrl.create({
      content: 'Deleting file...',
      spinner: 'crescent'
    });
    
    loading.present();

    this.storage.get('token').then((val) => {
      const deleteUrl = `${SERVER_URL}/deletePoFile/${file.Id}?token=${val.token}`;
      const deleteData = {
        fileName: file.File_Name,
        fileId: file.id || file.File_Id
      };
      
      this.http.post(deleteUrl, deleteData).subscribe(
        (response: any) => {
          loading.dismiss();
          if (response.success || response == 1) {
            this.existingPoFiles.splice(index, 1);
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

