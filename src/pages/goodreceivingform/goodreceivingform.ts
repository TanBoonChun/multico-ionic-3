import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, ViewController,Platform,IonicPage, Form } from 'ionic-angular';
import { ElementRef, ViewChild} from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry, IFile } from '@ionic-native/file';
import { catchError } from 'rxjs/operators';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}

import { Base64 } from '@ionic-native/base64';

import { FormControl, FormGroup, Validators, FormControlDirective} from '@angular/forms';
import { GoodreceivingmodalPage } from '../goodreceivingmodal/goodreceivingmodal';
import { GoodreceivingnewPage } from '../goodreceivingnew/goodreceivingnew';
import { SERVER_URL } from '../../environment';

/**
 * Generated class for the GoodreceivingformPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-goodreceivingform',
  templateUrl: 'goodreceivingform.html',
})
export class GoodreceivingformPage {
  images = [];
  imagesO = [];
  imagesN = [];
  formData: FormData;
 
  Total_Requested: any=0;
  Purpose: any = "";
  private token: string = "";
  public userImage: string;
  public Name: string = "";
  public Position: string = "";
  public signupform: FormGroup;
  apps: any;
  Project_Code: any;
  Site_Code: any;
  Att_Remarks:any="";

  private id: any;
  items:any;

  allname:any=[];
  itemarray:any=[];

  inventories:any;
  locations:any;
  options:any;
  ownerships:any;
  projects:any;
  regions:any;
  vendors:any;

  FromCompany:any;
  ReceivingDate:any;
  ReceivingTime:any;
  PO:any;
  DO:any;
  Warehouse:any;
  Ownership:any;
  Company:any;
  Segment:any;
  segment:any;
  Remarks:any;
  Project_No:any='';
  Site_Name:any='';
  Process:any;

  newMaterial: any;
  newUnit: any;
  newQuantity: any;
  newCondition: any;
  newAnArray: any;

  @ViewChild("myInput") myInput: ElementRef;
  @ViewChild("companyComponent") companyComponent: IonicSelectableComponent;

  resize() {
    var element = this.myInput[
      "_elementRef"
    ].nativeElement.getElementsByClassName("text-input")[0];
    var scrollHeight = element.scrollHeight;
    element.style.height = scrollHeight + "px";
    this.myInput["_elementRef"].nativeElement.style.height =
      scrollHeight + 16 + "px";
  }

  constructor(
    public navCtrl: NavController,
    private toastCtrl: ToastController,
    private viewCtrl:ViewController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public domSanitizer: DomSanitizer,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    private modal: ModalController,
    private toast: Toast,
    public loadingCtrl: LoadingController,
    private modalController: ModalController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private file: File,
    private base64: Base64,
    public platform: Platform,
  ) {    
  }

  ngOnInit() {
    this.signupform = new FormGroup({
      PO: new FormControl("",[]),
      DO: new FormControl("",[]),
      Warehouse: new FormControl("",[]),
      ReceivingDate: new FormControl("",[]),
      ReceivingTime: new FormControl("",[]),
      FromCompany: new FormControl("",[]),
      Project_Code: new FormControl("", [Validators.required]),
      Site_Code: new FormControl("", []),
      Site_Name: new FormControl("", []),
      Ownership:new FormControl("",[]),
      Company: new FormControl("",[]),
      Segment: new FormControl("",[]),
      Remarks: new FormControl("",[]),
      Process: new FormControl("",[Validators.required]),
      Project_No: new FormControl("",[]),
      Att_Remarks: new FormControl("",[]),
      newMaterial: new FormControl("",[]),
      newUnit: new FormControl("",[]),
      newQuantity: new FormControl("",[]),
      newCondition: new FormControl("",[]),
      newAnArray: new FormControl("",[])
    });
  }

  ionViewWillEnter() {
    this.loadData();
    this.Name = this.navParams.get("Name");
    // this.TotalDate = this.navParams.get("TotalDate");
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

  async showModal(){
    const modal = this.modalController.create(GoodreceivingmodalPage,{
      cssClass: 'my-custom-class'
    });

    modal.onDidDismiss(data=>{
       console.log(data)
    });
    return await modal.present();
  }

  filterCompanies(vendors: any, text: string) {
    return vendors.filter((vendor) => {
      return vendor.Vendor_Name.toLowerCase().indexOf(text) !== -1;
    });
  }

  searchCompany(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 2) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    event.component.items = this.filterCompanies(this.vendors, text);
    event.component.endSearch();
  }

  loadData() {
    let data: Observable<any>;

    // Name & Position
    this.storage.get("user").then((val) => {
      this.userImage = val.Web_Path;
      this.Name = val.Name;
      this.Position = val.Position;
    });

     // Receiving
     this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/receiving?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        this.inventories = result.inventories;
        this.locations = result.locations;
        this.options = result.options;
        this.ownerships = result.ownerships;
        this.projects = result.projects;
        this.regions = result.regions;
        this.vendors = result.vendors;
        this.segment = result.segment;
      });
    });

    // Department
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojects?token=" + val.token  + "&type=good_receive"
      );
      data.subscribe((result) => {
        console.log(result);
        // this.departs = result;
        this.items = result;

      });
    });

    // Name 
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getName?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        // this.departs = result;
        this.allname = result;

      });
    });

  }

  updateTask(index) {
    let alert = this.alertCtrl.create({
      title: 'Update SerialNo?',
      message: 'Type in your new serialNo to update.',
      inputs: [{ name: 'a', placeholder: 'Task' }],
      buttons: [{ text: 'Cancel', role: 'cancel' },
                { text: 'Update', handler: data => {  
                  this.itemarray[index] = data.newAnArray; }}]
    });
    alert.present();
  }

  addrow(){
    // if(!this.Project_Code ){
    //   this.displayErrorAlert("Project Code must be insert first");
    //   return;
    // }

    // if(!this.NoPartner ){
    //   this.displayErrorAlert("Pax must be insert first");
    //   return;
    // }

    let modal = this.modalController.create(GoodreceivingnewPage,{
      // 'Project_Code': this.Project_Code.Id, 
      // 'NoPartner': this.NoPartner,
      // 'Site_ID': this.SiteId,
    })

    modal.present();

    modal.onDidDismiss(data => {
      if (data) {
        this.itemarray.push(data);
        console.log(data,this.itemarray);

        // this.Total_Requested += parseFloat(data.Total_Requested);
      }
    });
  }

  edit(index){
    let modal = this.modal.create(GoodreceivingnewPage,this.itemarray[index]);
      modal.present();
      // this.Total_Requested -= parseFloat(this.itemarray[index].Total_Requested)
      modal.onDidDismiss(data => {
        if (data) {
          this.itemarray[index] = data;
          // this.Total_Requested += parseFloat(this.itemarray[index].Total_Requested)        
        }
      });
  }

  remove(ele){
    this.Total_Requested -= parseFloat(this.itemarray[ele].Total_Requested)
    this.itemarray.splice(ele,1);
  }

  filterPorts(apps: any, text: string) {
    return apps.filter((app) => {
      return app.Project_Code.toLowerCase().indexOf(text) !== -1;
    });
  }

  searchApps(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 2) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    // event.component.items = this.filterPorts(this.apps, text);
    event.component.items = this.apps.filter(a=> a.siteCode.toLowerCase().indexOf(text) !== -1);
    event.component.endSearch();
  }
  searchItems(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 2) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    event.component.items = this.filterPorts(this.items, text);
    event.component.endSearch();
  }



  siteCode() {
    let data: Observable<any>;
    let selectedProjectCode= this.Project_Code;
    if(typeof selectedProjectCode['Site_Code'] !== 'undefined'){
      let options=selectedProjectCode['Site_Code'].map(function(item){
        let siteCode= "";
        switch(item.Level){
          case 1 :siteCode= item.Department;break;
          case 2 :siteCode= item.Segment;break;
          case 3 :siteCode= item.Contract_No;break;
          case 4 :siteCode= item.PO_No;break;
          case 5 :siteCode= item.Site_ID;break;
        }
        let obj={Id:item['Id'],siteCode:siteCode};
        return obj;
      });
      this.apps =options;
      console.log(this.apps) 
    }
  }

  presentToastOut() {
    let toast = this.toastCtrl.create({
      message: "No negative value (-)",
      position: "middle",
      closeButtonText: "Ok",
      showCloseButton: true,
      cssClass: "red",
    });

    toast.onDidDismiss(() => {
      console.log("Dismissed toast");
    });

    toast.present();
    toast.dismiss();
  }

  setPurpose(event) {
    let purposeControl = this.signupform.get("Purpose");

    if (Number.parseFloat(event) > 0) {
      purposeControl.setValidators([Validators.required]);
      purposeControl.updateValueAndValidity();

    }

    purposeControl.setValidators(null);
    purposeControl.updateValueAndValidity();
  }
  
  isObject(variable) {
    return typeof variable === "object";
  }

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        // this.image = 'data:image/jpeg/jpg;base64,' + imageData;
        this.images.push(imageData);

        // // ****Original****

        if (this.platform.is("ios")) {
          let filePath = imageData;
          let fileName = filePath.split("/").pop();
          let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
          this.file
            .readAsDataURL(path, fileName)
            .then((base64File) => {
              // console.log("here is encoded image ", base64File)
              this.imagesN.push(
                this.domSanitizer.bypassSecurityTrustResourceUrl(base64File)
              );
            })
            .catch(() => {
              console.log("Error reading file");
            });
        } else {
          this.base64.encodeFile(imageData).then(
            (base64File: string) => {
              this.imagesN.push(
                this.domSanitizer.bypassSecurityTrustResourceUrl(
                  "data:image/jpeg/jpg;base64," +
                    base64File.substring(base64File.indexOf(",") + 1)
                )
              );
            },
            (err) => {
              console.log(err);
            }
          );
        }

        console.log(imageData);
        // // ***endOriginal****

        // **** Test ****

        // **** end Test ****
      },
      (err) => {
        this.displayErrorAlert(err);
      }
    );
  }

  clearImage() {
    this.images.length = 0;
    this.imagesN.length = 0;
  }

  

  submit() {

    if(!this.Project_Code ){
      this.displayErrorAlert("Project Code must be insert first");

      return;
    }

    let loading = this.loadingCtrl.create({
      content: "Submitting ...",
    });

    loading.present();

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

    this.storage.get("token").then((val) => {
      let p = new Promise((resolveReady) => {
        var defs = [];
        this.formData = new FormData();
        this.images.forEach((i) => {
          console.log("processing " + i);
          var self = this;
          var def = new Promise((resolve) => {
            this.file.resolveLocalFilesystemUrl(i).then(
              (entry: FileEntry) => {
                entry.file(
                  function (file) {
                    console.log("now i have a file ob", file.name);
                    console.dir(JSON.stringify(file));
                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                      var imgBlob = new Blob([this.result], {
                        type: file.type,
                      });
                      self.formData.append(
                        "attachment[]",
                        imgBlob,
                        file.name
                      );
                      resolve(i);
                    };
                    reader.readAsArrayBuffer(file);
                  },
                  function (e) {
                    console.log("error getting file", e);
                  }
                );
              },
              (err) => {
                console.log("Put error message here", JSON.stringify(err));
              }
            );
          });

          defs.push(def);
        });

        Promise.all(defs).then((res) => {
          this.formData.append("Process",this.Process);
          this.formData.append("FromCompany", this.FromCompany.Id);
          this.formData.append("Receiving_Date", this.ReceivingDate);
          this.formData.append("Receiving_Time", this.ReceivingTime);
          this.formData.append("PO", this.PO);
          this.formData.append("DO", this.DO);
          this.formData.append("Room_Id", this.Warehouse.RoomId);
          this.formData.append("Ownership", this.Ownership.Option);
          this.formData.append("ProjectId", this.Project_Code.Id);
          this.formData.append("Site_Code", this.Site_Code.Id);
          this.formData.append("Site_Name", this.Site_Name);
          this.formData.append("Project_No", this.Project_No);
          this.formData.append("Company", this.Company.Option);
          this.formData.append("Segment", this.Segment.Option);
          this.formData.append("Remarks", this.Remarks);

          this.formData.append("Stock", JSON.stringify(this.itemarray));
            resolveReady();
        });
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/goodreceiveform?token=" + val.token,
            this.formData,
            {}
          )
          .pipe(
            catchError(this.handleError)
          )
          .finally(() => {
            loading.dismiss();
          })
          .subscribe((res: any) => {
            this.navCtrl.pop();
            loading.dismiss();
            this.clearImage();
            // this.presentToastIn();
          });
      });
    });
    
  }

  saje(){
    console.log("Process",this.Process)
    console.log("FromCompany", this.FromCompany.Id);
    console.log("ReceivingDate", this.ReceivingDate);
    console.log("ReceivingTime", this.ReceivingTime)
    console.log("PO", this.PO)
    console.log("DO", this.DO)
    console.log("Warehouse", this.Warehouse.RoomId)
    console.log("Ownership", this.Ownership.Option)
    console.log("Project_Code", this.Project_Code.Id)
    console.log("Site_Code", this.Site_Code.Id)
    console.log("Site_Name", this.Site_Name)
    console.log("Project_No", this.Project_No)
    console.log("Company", this.Company.Option)
    console.log("Segment", this.Segment.Option)
    console.log("Remarks", this.Remarks)
    console.log("Stock",this.itemarray)

  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
        return Observable.throw('An error occurred:' + error.error.message);
    } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.error(
            `Backend returned code ${JSON.stringify(error)}, ` +
            `body was: ${JSON.stringify(error)}`);
        if (error.status == 422) {
            return Observable.throw('An error occured. Try again later. Validation Error');
        }
        return Observable.throw('An error occured. Try again later');
    }
  };

  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err,
      buttons: ["OK"],
    });
    alert.present();
  }
}
