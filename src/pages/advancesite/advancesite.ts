import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, ModalController, ViewController,Platform, IonicPage } from 'ionic-angular';
import { ElementRef, ViewChild} from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File, FileEntry } from '@ionic-native/file';


import { Base64 } from '@ionic-native/base64';

import { FormControl, FormGroup, Validators} from '@angular/forms';
import { SERVER_URL } from '../../environment';

@IonicPage()

@Component({
  selector: "page-advancesite",
  templateUrl: "advancesite.html",
})
export class AdvancesitePage {

  images = [];
  imagesO = [];
  imagesN = [];
  formData: FormData;
  public Site_Name: any = "";
  banks: any;
  vendors: any;
  items: any;
  SiteId: any = "";
  Bank_Name: any = "";
  Reason: any = "";
  Department: any = "";
  departs: any;
  Sum1: any = "";
  Sum2: any = "";
  Sum3: any = "";
  Sum4: any = "";
  Sum5: any = "";
  Sum6: any = "";
  Sum7: any = "";
  ASum1: any= "";
  ASum2: any = "";
  ASum3: any = "";
  ASum4: any = "";
  ASum5: any = "";
  ASum6: any = "";
  ASum7: any = "";
  DSum1: any= "[0-9]";
  DSum2: any=0;
  DSum3: any = "";
  DSum4: any = "";
  DSum5: any = "";
  DSum6: any = "";
  DSum7: any = "";
  Total_Requested: any=0;
  Need_Advance: any = false;
  private token: string = "";
  public userImage: string;
  public Name: string = "";
  public Position: string = "";
  public signupform: FormGroup;
  apps: any;
  Project_Code: any;
  Site_Code: any;
  Vendor:any;
  // Partners / pax are not used by the travel & advance form any more
  // Partner1:any="";
  // Partner2:any="";
  // Partner3:any="";
  // Partner4:any="";
  Att_Remarks:any="";
  private id: any;

  TotalDate:any='';
  // NoPartner:any='';

  newStartDate:any;
  newEndDate:any;
  // PartnerName:any;

  allname:any=[];
  itemarray:any=[];
  disableButton;

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
      Bank_Name: new FormControl("", []),
      Project_Code: new FormControl("", [Validators.required]),
      Site_Code: new FormControl("", []),
      Site_Name: new FormControl("", []),
      Vendor: new FormControl("", []),
      Need_Advance: new FormControl(false, []),
      // NoPartner: new FormControl("", []),
      // Partner1: new FormControl("",[]),
      // Partner2: new FormControl("",[]),
      // Partner3: new FormControl("",[]),
      // Partner4: new FormControl("",[]),
      Sum1: new FormControl("", []),
      Sum2: new FormControl("", []),
      Sum3: new FormControl("", []),
      Sum4: new FormControl("", []),
      Sum5: new FormControl("", []),
      Sum6: new FormControl("", []),
      ASum1: new FormControl("", [Validators.min(0)]),
      ASum2: new FormControl("", [Validators.min(0)]),
      ASum3: new FormControl("", [Validators.min(0)]),
      ASum4: new FormControl("", [Validators.min(0)]),
      ASum5: new FormControl("", [Validators.min(0)]),
      ASum6: new FormControl("", [Validators.min(0)]),
      DSum1: new FormControl("", [Validators.min(0)]),
      DSum2: new FormControl("", [Validators.min(0)]),
      DSum3: new FormControl("", [Validators.min(0)]),
      DSum4: new FormControl("", [Validators.min(0)]),
      DSum5: new FormControl("", [Validators.min(0)]),
      DSum6: new FormControl("", [Validators.min(0)]),

      // PartnerName: new FormControl("", []),

      Att_Remarks:new FormControl("",[]),

    });

    this.toggleAdvance();
  }

  // The bank account and the amounts only matter when an advance payment is requested
  toggleAdvance() {
    let bank = this.signupform.get("Bank_Name");

    if (this.Need_Advance) {
      bank.setValidators([Validators.required]);
    } else {
      bank.setValidators(null);
    }

    bank.updateValueAndValidity();

    this.recalculateTotal();
  }

  recalculateTotal() {
    if (!this.Need_Advance) {
      this.Total_Requested = 0;
      return;
    }

    let total = 0;

    this.itemarray.forEach((item) => {
      let amount = Number.parseFloat(item.Total_Requested);
      if (!isNaN(amount)) {
        total += amount;
      }
    });

    this.Total_Requested = total.toFixed(2);
  }

  ionViewWillEnter() {
    // Name and Position come from the logged in user in loadData()
    this.loadData();
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

  truthClick(){
    this.disableButton =true;
  }

  // Pax picker is gone, it only reset the rows when the number of travellers changed
  // tukar(selectedValue: any){
  //   this.itemarray = [];
  //   this.PartnerName = [];
  //   this.Total_Requested = 0;
  //
  //   console.log('Selected value: ',selectedValue)
  //
  // }

  fetchCalculatedDays(value){

    if (this.newEndDate != "" && this.newStartDate != "") {
      this.storage.get('token').then((val) => {
        this.http.get(SERVER_URL + '/fetchCalculatedDays?token=' + val.token + "&Start_Date=" + this.myFunction(this.newStartDate) + "&End_Date=" + this.myFunction(this.newEndDate))
        .subscribe((result : any) => {
          var days = 0;
          this.TotalDate = result;
          console.log(this.TotalDate)
          // this.TotalDate = days;
             
          
          console.log(JSON.stringify(result));  
          
        })
      });
    }

  }

  async showModal(){
    const modal = this.modalController.create('AdvancesitemodalPage',{
      cssClass: 'my-custom-class'
    });

    modal.onDidDismiss(data=>{
       this.DSum2 = data
       console.log(data)
    });
    return await modal.present();
  }

  loadData() {
    let data: Observable<any>;

    // Name & Position
    this.storage.get("user").then((val) => {
      this.userImage = val.Web_Path;
      this.Name = val.Name;
      this.Position = val.Position;
    });

    // Bank Accounts
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/bankaccounts?token=" + val.token
      );
      data.subscribe((result) => {
        console.log(result);
        this.banks = result;
      });
    });

    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getvendors?token=" + val.token
      );
      data.subscribe((result) => {
        this.vendors = result;
      });
    });

    // Department
    this.storage.get("token").then((val) => {
      data = this.http.get(
        SERVER_URL + "/getprojects?token=" + val.token + "&type=advance"
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

  addrow(){

    const alertA = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Project Code must be insert first",
      buttons:['Ok']
    });

    if(!this.Project_Code ){
      // this.displayErrorAlert("Project Code must be insert first");
      return alertA.present();
    }

    // Pax and partners used to drive the accommodation rate - the amount is entered by hand now

    let modal = this.modalController.create('AdvancesitenewPage',{
      'Project_Code': this.Project_Code.Id,
      // 'NoPartner': this.NoPartner,
      'Site_ID': this.SiteId,
      'Need_Advance': this.Need_Advance,
    })

    modal.present();

    modal.onDidDismiss(data => {
      if (data) {
        this.itemarray.push(data);
        console.log(data,this.itemarray);

        this.recalculateTotal();
      }
    });
  }

  edit(index){
    let params = Object.assign({}, this.itemarray[index], { Need_Advance: this.Need_Advance });
    let modal = this.modal.create('AdvancesitenewPage', params);
      modal.present();
      modal.onDidDismiss(data => {
        if (data) {
          this.itemarray[index] = data;
          this.recalculateTotal();
        }
      });
  }

  remove(ele){
    this.itemarray.splice(ele,1);
    this.recalculateTotal();
  }



  noSpace(string){
    this.Site_Name = string.split(' ').join('');
    return string.split(' ').join('');
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
    // event.component.startSearch();
    // if (text.length < 2) {
    //   event.component.items = [];
    //   event.component.endSearch();
    //   return;
    // }
    // if (!text) {
    //   event.component.items = [];
    //   event.component.endSearch();
    //   return;
    // }
    event.component.items = this.filterPorts(this.items, text);
    // event.component.endSearch();
  }

  searchVendors(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.items = this.vendors.filter(v=> v.Vendor_Name.toLowerCase().indexOf(text) !== -1);
    event.component.endSearch();
  }

  // partner(){
  //   var p1 = this.Partner1;
  //   if(this.NoPartner.id == 1){
  //     p1 = this.Partner1;
  //   }
  // }

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

  calculateTotal() {
    var total =
      Number.parseFloat(this.Sum1) +
      Number.parseFloat(this.Sum2) +
      Number.parseFloat(this.Sum3) +
      Number.parseFloat(this.Sum4) +
      Number.parseFloat(this.Sum5) +
      Number.parseFloat(this.Sum6);
    return total.toFixed(2);
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

  // numberOnlyValidation(event: any) {
  //   const pattern = /[0-9]/;
  //   let inputChar = String.fromCharCode(event.charCode);

  //   if (!pattern.test(inputChar)) {
  //     // invalid character, prevent input
  //     event.preventDefault();
  //   }else{
  //     this.calculateSum1();
  //   }
  // }

  // calculateSum1(){
  //   // if(this.DSum1 < 0){
  //   //  this.presentToastOut();
  //   // }else{
  //     var total1 =
  //     Number.parseFloat(this.ASum1) * Number.parseFloat(this.DSum1);
  //     return total1.toFixed(2);
  //   // }
   
  // }

  // calculateSum2(){
  //   var total2 =
  //   Number.parseFloat(this.ASum2) * Number.parseFloat(this.DSum2);
  //   return total2.toFixed(2);
  // }

  // calculateSum3(){
  //   var total3 =
  //   Number.parseFloat(this.ASum3) * Number.parseFloat(this.DSum3);
  //   return total3.toFixed(2);
  // }

  // calculateSum4(){
  //   var total4 =
  //   Number.parseFloat(this.ASum4) * Number.parseFloat(this.DSum4);
  //   return total4.toFixed(2);
  // }

  // calculateSum5(){
  //   var total5 =
  //   Number.parseFloat(this.ASum5) * Number.parseFloat(this.DSum5);
  //   return total5.toFixed(2);
  // }

  // calculateSum6(){
  //   var total6 =
  //   Number.parseFloat(this.ASum6) * Number.parseFloat(this.DSum6);
  //   return total6.toFixed(2);
  // }



  get isOther() {

    if (Number.parseFloat(this.Sum6) > 0) {

      return true;
    }

    return false;
  }

  setSiteName(Project_Code) {
    if (typeof Project_Code === "object") {
      let str = "";

      if (Project_Code["Site Id"]) {
        str = Project_Code["Site Id"];
      }

      if (str != "" && Project_Code["Site LRD"]) {
        str = str + " - " + Project_Code["Site LRD"];
      } else if (Project_Code["Site LRD"]) {
        str = Project_Code["Site LRD"];
      }

      if (str != "" && Project_Code["Site Name"]) {
        str = str + " - " + Project_Code["Site Name"];
      } else if (Project_Code["Site Name"]) {
        str = Project_Code["Site Name"];
      }
      this.Site_Name = Project_Code["Site Name"];
    }
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
        console.log(imageData);
      },
      (err) => {
        this.displayErrorAlert(err);
      }
    );

    // this.camera.getPicture(options).then(
    //   (imageData) => {
    //     // this.image = 'data:image/jpeg/jpg;base64,' + imageData;
    //     this.images.push(imageData);

    //     // // ****Original****

    //     if (this.platform.is("ios")) {
    //       let filePath = imageData;
    //       let fileName = filePath.split("/").pop();
    //       let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
    //       this.file
    //         .readAsDataURL(path, fileName)
    //         .then((base64File) => {
    //           // console.log("here is encoded image ", base64File)
    //           this.imagesN.push(
    //             this.domSanitizer.bypassSecurityTrustResourceUrl(base64File)
    //           );
    //         })
    //         .catch(() => {
    //           console.log("Error reading file");
    //         });
    //     } else {
    //       this.base64.encodeFile(imageData).then(
    //         (base64File: string) => {
    //           this.imagesN.push(
    //             this.domSanitizer.bypassSecurityTrustResourceUrl(
    //               "data:image/jpeg/jpg;base64," +
    //                 base64File.substring(base64File.indexOf(",") + 1)
    //             )
    //           );
    //         },
    //         (err) => {
    //           console.log(err);
    //         }
    //       );
    //     }

    //     console.log(imageData);
    //     // // ***endOriginal****

    //     // **** Test ****

    //     // **** end Test ****
    //   },
    //   (err) => {
    //     this.displayErrorAlert(err);
    //   }
    // );
  }

  clearImage() {
    this.images.length = 0;
    this.imagesN.length = 0;
  }

  

  submit() { 

    const alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: this.Need_Advance ? "Amount cannot be 0" : "Please add at least one travel detail",
      buttons:['Ok']
    });

    if (this.itemarray.length === 0 || (this.Need_Advance && Number.parseFloat(this.Total_Requested) <= 0)) {
      return alert.present();
    }

    const alertBank = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Bank Account must be insert first",
      buttons:['Ok']
    });

    if (this.Need_Advance && !this.Bank_Name) {
      return alertBank.present();
    }

    const alert2 = this.alertCtrl.create({
      title: 'Error',
      subTitle: "Project Code must be insert first",
      buttons:['Ok']
    });

    if(!this.Project_Code ){

      return alert2.present();
    }

    // Partners were tied to the pax based accommodation rate, which the form no longer has

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
          this.formData.append("ProjectId", this.Project_Code.Id);
          this.formData.append("Bank_Account_No", this.Bank_Name ? this.Bank_Name : "");
          this.formData.append("Site_Name", this.Site_Name);
          this.formData.append("SiteId", "0");
          this.formData.append("Vendor", this.Vendor ? this.Vendor.Id : "");
          this.formData.append("Need_Advance", this.Need_Advance ? "1" : "0");
          this.formData.append("Purpose", "");
          this.formData.append("Installment", "");
          this.formData.append("Type", "Site Advance");
          // this.formData.append("Partner1", this.Partner1);
          // this.formData.append("Partner2", this.Partner2);
          // this.formData.append("Partner3", this.Partner3);
          // this.formData.append("Partner4", this.Partner4);
          // this.formData.append("PartnerName", JSON.stringify(this.PartnerName) ? JSON.stringify(this.PartnerName) : "");
          this.formData.append("newAdvance", JSON.stringify(this.itemarray));
          this.formData.append("Total_Requested", this.Total_Requested);
          // this.formData.append("NoPartner", this.NoPartner);
          this.formData.append("Att_Remarks", this.Att_Remarks ? this.Att_Remarks : "");
            resolveReady();
        });
      });
      p.then(() => {
        return this.http
          .post(
            SERVER_URL + "/myadvanceapply5?token=" + val.token,
            this.formData,
            {}
          )
          .finally(() => {
            loading.dismiss();
          })
          .subscribe((res: any) => {
            this.toast.show(`advance submitted`, '5000', 'center').subscribe(
                toast => {
                  console.log(toast);
                }
              );
              loading.dismiss();
              this.clearImage();
              this.navCtrl.pop();
            // this.presentToastIn();
          },
          (err) => {
            console.log(err)
            this.displayErrorAlert(
              err.error
            );
            loading.dismiss();
          });
      });
    });
    
  }

  // private handleError(error: HttpErrorResponse) {
  //   if (error.error instanceof ErrorEvent) {
  //       // A client-side or network error occurred. Handle it accordingly.
  //       console.error('An error occurred:', error.error.message);
  //       return Observable.throw('An error occurred:' + error.error.message);
  //   } else {
  //       // The backend returned an unsuccessful response code.
  //       // The response body may contain clues as to what went wrong,
  //       console.error(
  //           `Backend returned code ${JSON.stringify(error)}, ` +
  //           `body was: ${JSON.stringify(error)}`);
  //       if (error.status == 422) {
  //           return Observable.throw('An error occured. Try again later. Validation Error');
  //       }
  //       return Observable.throw('An error occured. Try again later');
  //   }
  // };

  displayErrorAlert(err) {
    console.log(err);
    let alert = this.alertCtrl.create({
      title: "Error",
      subTitle: err.error,
      buttons: ["OK"],
    });
    alert.present();
  }
}
