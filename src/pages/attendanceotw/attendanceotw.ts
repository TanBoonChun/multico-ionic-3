import { Component, NgZone } from "@angular/core";
import { NavController, NavParams, Platform, IonicPage } from "ionic-angular";
import { App, LoadingController } from "ionic-angular";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";
import { AlertController } from "ionic-angular";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Toast } from "@ionic-native/toast";
import { IonicSelectableComponent } from "ionic-selectable";
import { LocalNotifications } from "@ionic-native/local-notifications";
import { ToastController } from "ionic-angular";
import { Subscription } from "rxjs/Subscription";
import { Network } from '@ionic-native/network'; 

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
};

import { FormControl, FormGroup, Validators } from "@angular/forms";

import {
  BackgroundGeolocation,
  BackgroundGeolocationConfig,
  BackgroundGeolocationResponse,
  BackgroundGeolocationEvents,
  BackgroundGeolocationAccuracy
} from "@ionic-native/background-geolocation";
import { Geolocation, Geoposition } from "@ionic-native/geolocation";
import { CameraOptions, Camera } from "@ionic-native/camera";
import { DomSanitizer } from "@angular/platform-browser";
import { Base64 } from "@ionic-native/base64";
import { File, FileEntry } from "@ionic-native/file";
import { SERVER_URL } from "../../environment";

@IonicPage()

@Component({
  selector: "page-attendanceotw",
  templateUrl: "attendanceotw.html",
})
export class AttendanceotwPage {
  currentDate;
  formattedDate;
  formattedDateObj;
  
  Date: any;
  Time: string;
  Latitude_In: any;
  Longitude_In: any;
  Latitude_Out: any;
  Longitude_Out: any;
  Check_In_Type: string;
  Department: any;
  Task: any;
  Depart_From: any;
  Transport_Type: any="Car";
  Department1:any;
  Site_Code1:any;
  Site_Name: any;
  Site_Name2: any;
  Site_Code:any;
  SiteArray:any;
  SiteArray1:any;
  Timesheet_Name: string;
  Id: string;
  Leader_Member: string;
  Next_Person: string;
  ProjectId: string;
  State: string;
  Work: string;
  Reason: string;
  Remarks: string="";
  Work_Description: string;
  hideUI: any;
  types: any;
  departs: any;
  tasks: any;
  speed:any;

  Name: string = "";
  // items: any;
  UserId: any;
  token: string = "";
  sites: any;
  Site_Name_Display: string = "";
  public signupform: FormGroup;
  previousLat = [];
  getSites: any;
  jobs: any;
  Scope_Of_Work: string;
  Code: any;
  JobCode: any;
  data = { title: "", description: "", date: "", time: "" };

  timein: any;
  items = [];
  isTracking = false;
  trackedRoute = [];
  previousTracks = [];

  positionSubscription: Subscription;

  locRoute = this.storage.get("new");
  Location_Name: any;
  images = [];
  imagesN = [];
  formData: FormData;
  TrackerId: any;
  watch: any;    

  TimeinId: any;

  constructor(
    private network: Network,
    public navCtrl: NavController,
    public geo: Geolocation,
    public alertCtrl: AlertController,
    public app: App,
    public http: HttpClient,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    private locationAccuracy: LocationAccuracy,
    public localNotifications: LocalNotifications,
    public platform: Platform,
    private toast: Toast,
    private geolocation: Geolocation,
    private toastCtrl: ToastController,
    private background: BackgroundGeolocation,
    private ngZone:NgZone,
    public plt: Platform,
    private camera: Camera,
    public domSanitizer: DomSanitizer,
    private file: File,
    private base64: Base64,
  ) {
    this.clearstorage();
    setInterval(() => {this.time()},1000);

    // this.enableLocation();
    this.currentDate = new Date();
    this.getFormattedDate();

    this.JobCode = this.JobCode;

    this.Date = new Date();
    this.Time = this.calculateTime("-4");

    this.Id = this.navParams.get("Id");
    this.Timesheet_Name = this.navParams.get("Timesheet_Name");
    this.Name = this.navParams.get("Name");
    this.Department = undefined;

    this.speed= 0 ;
   
  }

  public onItemSelection(selection) {
    if (selection != undefined) {
      console.log("item selected: " + this.departs.Project_Name);
    } else {
      console.log("no item selected");
    }
  }
  Site_Name1:any;
  ngOnInit() {
    this.signupform = new FormGroup({
      Check_In_Type: new FormControl("", []),
      Department: new FormControl("", [Validators.required]),
      Site_Code: new FormControl("", [Validators.required]),
      // Department1: new FormControl("", []),
      // Site_Code1: new FormControl("", []),
      Task: new FormControl("", []),
      Depart_From: new FormControl("", [Validators.required]),
      Transport_Type: new FormControl("", [Validators.required]),
      Remarks:new FormControl("",[]),
      // Site_Name: new FormControl("", [Validators.required]),
      Site_Name1: new FormControl("", [Validators.required]),
      Latitude_In: new FormControl("", [Validators.required]),
      Longitude_In: new FormControl("", [Validators.required]),
      JobCode: new FormControl("", []),
    });

    this.Check_In_Type = "On Duty";
  }

  enableLocation() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.locationAccuracy
          .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
          .then(
            () => alert("Location information is on"),
            (error) =>
              alert(
                "Error requesting location permissions" + JSON.stringify(error)
              )
          );
      }
    });
  }

  ionViewWillEnter() {
    this.loadData();
  }

  getFormattedDate() {
    var dateObj = new Date();

    var year = dateObj.getFullYear().toString();
    var month = dateObj.getMonth().toString();
    var date = dateObj.getDate().toString();

    var monthArray = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "July",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dis",
    ];

    this.formattedDate = year + "-" + monthArray[month] + "-" + date;
    this.formattedDateObj = new Date(this.formattedDate);
  }

  doRefresh() {
    this.platform.ready().then(() => {
      //request location here
      let loading = this.loadingCtrl.create({
        content: "Refreshing Latitude & Longitude...",
        spinner: "crescent",
      });

      loading.present();

      this.geo
        .getCurrentPosition()
        .then((pos) => {
          this.Latitude_In = pos.coords.latitude;
          this.Longitude_In = pos.coords.longitude;
          loading.dismiss();
          alert("Location Refreshed");
        })
        .catch((err) => console.log(err));
    });
  }

  setProjectOptions(value) {

    if (value) {
      this.getSiteName(value);
    }
    // let arrApps = new Array();
    // let projectName = "";
    // for (let depart of this.departs) {
    //   if (depart.Id == value) {
    //     projectName = depart.Project_Name;
    //     break;
    //   }
    // }
    // this.projectCode(value);
    // this.scopeOfWorks(value);
    // this.projectOptions = arrApps;
  }

  getSiteName(id) {
    let data: Observable<any>;
    this.storage.get("token").then((val) => {
    this.http.get(SERVER_URL + "/getsitename/"+ id + "?token=" + val.token)
      .subscribe((result) => {
        console.log(result);
        this.getSites = result;
      });
    });
  }

  setSiteOptions(value) {
    let selectedProjectCode= this.Department;
    if(!selectedProjectCode) return ;
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
      this.SiteArray =options;
    }else{
      this.SiteArray=[{Id:selectedProjectCode.Id,siteCode:selectedProjectCode.Project_Code}];
    }
  }
  setSiteOptions1(value) {
    let selectedProjectCode= this.Department1;
    if(!selectedProjectCode) return ;
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
      this.SiteArray1 =options;
    }else{
      this.SiteArray1=[{Id:selectedProjectCode.Id,siteCode:selectedProjectCode.Project_Code}];
    }
    // if (value) {
    //   this.ProjectId = value.ProjectId;
    //   this.TrackerId = value.Id;
    // }
    // let arrApps = new Array();
    // let projectName = "";
    // for (let depart of this.departs) {
    //   if (depart.Id == value) {
    //     projectName = depart.Project_Name;
    //     break;
    //   }
    // }
    // this.projectCode(value);
    // this.scopeOfWorks(value);
    // this.projectOptions = arrApps;
  }

  calculateTime(offset: any) {
    let d = new Date();

    let nd = new Date(d.getTime() + 3600000 * offset);

    return nd.toISOString();
  }

  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    var day = ("0" + d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + "-" + monthNames[monthIndex] + "-" + year;
  }

  startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10

    return h + ":" + m + ":" + s;
  }

  // Sites Name
  filterSites(sites: any, text: string) {
    return sites
      .filter((site) => {
        return site.Project_code.toLowerCase().indexOf(text) !== -1;
      });
  }

  
  searchSites(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 1) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    event.component.items = this.filterSites(this.getSites, text);
    event.component.endSearch();
  }
  searchProject(event: { component: IonicSelectableComponent; text: string }) {
    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if (text.length < 1) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    event.component.items = this.departs.filter(d=> d.Project_Code.toLowerCase().indexOf(text) !== -1);
    event.component.endSearch();
  }
 
  //  JobCode
  filterJobs(jobs: any, text: string) {
    return jobs.filter((job) => {
      return job.JobScope.toLowerCase().indexOf(text) !== -1;
    });
  }

  searchJobs(event: { component: IonicSelectableComponent; text: string }) {
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
    event.component.items = this.filterJobs(this.jobs, text);
    event.component.endSearch();
  }

  async loadData() {
    this.storage.get("new").then((val) => {
      this.locRoute = val;
    });

    this.locRoute = await this.storage.get("new");

    if (this.locRoute != null) {
      this.isTracking = true;
      this.Location_Name = this.locRoute["Location_Name"];
      console.log(this.locRoute);
    }

    await this.platform.ready().then(() => {
      this.loadHistoricRoutes();
    });

    this.storage.get("timein_id").then((val) => {
      this.Id = val;
    });

    this.storage.get("timein").then((val) => {
      this.hideUI = val;
    });

    this.storage.get("user").then((val) => {
      this.Name = val.Name;
    });

    this.storage.get("Site_Name").then((val) => {
      this.Site_Name_Display = val;
    });

    let data: Observable<any>;

    this.geo
      .getCurrentPosition({ enableHighAccuracy: true })
      .then((pos) => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;
      })
      .catch((err) => console.log(err));

    // getSite
    this.storage.get("token").then((val) => {
      this.http
        .get(
          SERVER_URL + "/getprojects?token=" + val.token + "&type=attendance"
        )
        .subscribe((result) => {
          this.departs = result;
        });

      this.http
        .get<any>(
          SERVER_URL + "/gettodoincomplete?token=" +
            val.token
        )
        .subscribe((result) => {
          console.log(result);
          this.tasks = result.list;
          if (result.count > 0) {
            this.signupform.get("Task").setValue(this.tasks[0].Id);
          } else {
            this.signupform.get("Task").setValue(null);
          }
        });
    });
  }

  async loadHistoricRoutes() {
    let data: Observable<any>;
    let temp = [];

    await this.storage.get("routes").then((data) => {
      console.log(data);
      if (data) {
        this.previousTracks = data;
        for (var x = 0, y = this.previousTracks.length; x < y; x++) {
          // console.log(this.previousTracks[x].path);
          for (var i = 0, z = this.previousTracks[x].path.length; i < z; i++) {
            temp.push({
              lat: this.previousTracks[x].path[i].lat,
              long: this.previousTracks[x].path[i].lng,
            });
          }
        }
        this.previousLat = temp;
      }
    });
  }

  clearstorage() {
    this.platform.ready().then(() => {
      //request location here
      let loading = this.loadingCtrl.create({
        content: "Clearing route history...",
        spinner: "crescent",
      });

      loading.present();
      const p1 = this.storage.remove("routes");
      const p2 = this.storage.remove("new");
      const p3 = this.storage.remove("Site_Name");
      const p4 = this.storage.remove("timein");
      const p5 = this.storage.remove("timein_id");

      Promise.all([p1,p2,p3,p4,p5]).then(() => {
        this.previousLat.length = 0;
        this.loadData();
        loading.dismiss();
      });
    });
  }

  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = hour + ":" + min + ":" + sec;
    return time;
  }

  updateVal(location) {
    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };
    if (location.speed == undefined) {
      location.speed = 0;
      this.speed= 0 ;
    }
    let watch = this.geolocation.watchPosition(options);
    watch.subscribe((location) => {
      if(this.storeLatlong.indexOf(location.coords.latitude+","+location.coords.longitude) !== -1 ){

      }else{
        this.storeLatlong.push(location.coords.latitude+","+location.coords.longitude);
        this.trackedRoute.push({
          //watchposition
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          time: this.timeConverter(location.timestamp),
          speed: (location.coords.speed * 3.6),
        });
      }
    });
    
    
    this.toast.show(location.speed,"5000","center");

  }
  updateVal1(location) {
    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };
    if (location.speed == undefined) {
      location.speed = 0;
      this.speed= 0 ;
    }

      if(this.storeLatlong.indexOf(location.latitude+","+location.longitude) !== -1 ){

      }else{
        this.storeLatlong.push(location.latitude+","+location.longitude);
        this.trackedRoute.push({
          //watchposition
          lat: location.latitude,
          lng: location.longitude,
          time: this.timeConverter(location.timestamp),
          speed: (location.speed * 3.6),
        });
      }

  }
  watchArray=[];
  testlat:any;
  testlong:any;
  backgroundArray=[];
  storeLatlong=[];
  startTracking() {
    this.clearstorage();
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 10,
      stationaryRadius: 10,
      distanceFilter: 10,
      debug: false,
      stopOnTerminate: false,
      startForeground: true,
      interval: 10000,
    };

    let options = {
      // frequency: 60000, 
      enableHighAccuracy: true
    };
    
        this.background.configure(config).then(() => {
          this.background
            .on(BackgroundGeolocationEvents.location)
            .subscribe((location: BackgroundGeolocationResponse) => {
              if (this.platform.is("i")) this.background.finish();
              this.speed=(location.speed*3.6).toFixed(0);
              this.testlat=location.latitude.toFixed(8);
              this.testlong=location.longitude.toFixed(8);
              this.updateVal1(location);
            });
        });
        this.background.start();
        this.updateVal(location);
        this.isTracking = true;
        this.timein = this.startTime();
        this.storage.set("new", this.Site_Name);

        this.storage.get("token").then((val) => {
          
          let p = new Promise((resolveReady) => {
            var defs = [];
            this.formData = new FormData();
            this.images.forEach((i) => {
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
                this.formData.append("Latitude_In", this.Latitude_In);
                this.formData.append("Longitude_In", this.Longitude_In);
                this.formData.append("Date", this.myFunction(this.Date));
                this.formData.append("Time", this.startTime());
                this.formData.append("Site_Name", this.Site_Name1);
                this.formData.append("ProjectId", this.Department ? this.Department.Id : 0);
                this.formData.append("Site_Code", this.Site_Code ? this.Site_Code.Id : 0);
                this.formData.append("ProjectId1", this.Department1 ? this.Department1.Id : 0);
                this.formData.append("Site_Code1", this.Site_Code1 ? this.Site_Code1.Id : 0);
                this.formData.append("TaskId", this.Task ? this.Task : 0);
                this.formData.append("Depart_From", this.Depart_From);
                this.formData.append("TrackerId", this.TrackerId ? this.TrackerId : 0);
                this.formData.append("Transport_Type", this.Transport_Type);
                this.formData.append("Remarks", this.Remarks);
                resolveReady();
            });
          });
          p.then(() => {
            return this.http
              .post(
                SERVER_URL + "/otwtimein?token=" + val.token,
                this.formData,
                {}
              )
              .pipe(
              )
              .finally(() => {
              })
              .subscribe((res: any) => {
                this.hideUI = true;
                this.TimeinId = res;
              });
          });
        });
    
        if (!this.Site_Name) {    
          return;
        }

  }
  stopTracking() {
    this.background.stop();

    let loading = this.loadingCtrl.create({
      content: "Loading...",
      spinner: "crescent",
    });

    loading.present();
    let newRoute = {
      finished: new Date().getTime(),
      path: this.trackedRoute,
      item: this.items,
      sitename: this.Site_Name,
      time: this.timein,
    };
    this.previousTracks.push(newRoute);
    this.storage.set("routes", this.previousTracks);
    this.storage
      .get("token")
      .then((val) => {
        
        if (!this.Site_Name) {
          this.Location_Name = this.Site_Name2;
        } else {
          this.Location_Name = this.Site_Name.Location_Name;
        }
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
            // this.previousTracks.forEach(pt => {this.formData.append("lat[]", pt)});
            this.formData.append("TimeinId", this.TimeinId);

            this.formData.append("lat", JSON.stringify(this.previousTracks));
            this.formData.append("Date", this.myFunction(this.Date));
            this.formData.append("Time_Out", this.startTime());
            this.formData.append("Site_Name", this.Site_Name);
            this.formData.append("Site_Name", this.Site_Name1);
            this.formData.append("ProjectId", this.Department ? this.Department.Id : 0);
            this.formData.append("Site_Code", this.Site_Code ? this.Site_Code.Id : 0);
            this.formData.append("ProjectId1", this.Department1 ? this.Department1.Id : 0);
            this.formData.append("Site_Code1", this.Site_Code1 ? this.Site_Code1.Id : 0);
            this.formData.append("TaskId", this.Task ? this.Task : 0);
            this.formData.append("Depart_From", this.Depart_From);
            this.formData.append("TrackerId", this.TrackerId ? this.TrackerId : 0);
            this.formData.append("Transport_Type", this.Transport_Type);
            this.formData.append("Remarks", this.Remarks);
            resolveReady();
          });
        });
        p.then(() => {
          return this.http
            .post(
              SERVER_URL + "/otw2?token=" + val.token,
              this.formData,
              {}
            )
            .subscribe((res: any) => {

              if (res == 1) {
                  // this.navCtrl.pop();
                // this.storage.set('timein', true);
                // this.storage.set('timein_id', res);
                this.hideUI = false;
                this.Site_Name_Display = this.Location_Name;

                this.Id = res;
                this.storage.set("Site_Name", this.Location_Name);
                this.loadHistoricRoutes();
                this.formData = new FormData();
                this.isTracking = false;
                this.clearImage();
                this.Location_Name = null;
                this.ProjectId = null;
                this.Task = null;
                this.Depart_From = null;
                this.TrackerId = null;
                this.Transport_Type = "Car";
                this.Department = null;
                this.Site_Name = null;
                this.trackedRoute=[];
                this.signupform.reset();
                this.clearstorage();
                loading.dismiss();
              } else {
                loading.dismiss();
                this.displayErrorAlert("Something went wrong. Please try again.");
                this.background.start();
              }

            }, (err) => {
              loading.dismiss();
              this.background.stop();
              // this.background.start();
              this.displayErrorAlert(
               err.error
              );

            });
        });
      });
  }

  clearImage() {
    this.images.length = 0;
    this.imagesN.length = 0;
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

  onTakePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      saveToPhotoAlbum: true,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true,
    };

    this.camera.getPicture(options).then(
      (imageData) => {
        this.images.push(imageData);

        if (this.platform.is("ios")) {
          let filePath = imageData;
          let fileName = filePath.split("/").pop();
          let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);
          this.file
            .readAsDataURL(path, fileName)
            .then((base64File) => {
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
      },
      (err) => {
        this.displayErrorAlert(err);
      }
    );
  }
  clock:any;
  
   time() {
    var d = new Date();
    var s = d.getSeconds();
    var m = d.getMinutes();
    var h = d.getHours();
    this.clock = h + ":" + ('00'+m).slice(-2) + ":" + ('00'+s).slice(-2);
    
  }

}
