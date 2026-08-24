import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ViewController } from 'ionic-angular';
import { IonicSelectableComponent } from 'ionic-selectable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the VehicletransferPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-vehicletransfer',
  templateUrl: 'vehicletransfer.html',
})
export class VehicletransferPage {
  public type : any;
  public UserId2 : any;
  public Remarks : any;
  public allUsers : any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl : ViewController,
    public http: HttpClient,
    private storage: Storage,
    ) {
      this.type = this.navParams.get('type');
  } 

  ionViewWillEnter() {
    this.loadData();
  }
  submit(){
    this.closeModal({
      'UserId2' : this.UserId2 ? this.UserId2.Id : 0,
      'Remarks' : this.Remarks
    });
  }

  loadData(){
    this.storage.get('token').then((val) => {
      this.http.get('http://crm.midascom.my/api/asset/getAllUsers?token=' + val.token)
      .subscribe( (result:any) => {
          this.allUsers = result;
      })
    });
  }

  closeModal(data = null) {
    this.viewCtrl.dismiss(data);
  }

  searchUser(event: {
    component:IonicSelectableComponent,
    text:string
  }) {

    let text = event.text.trim().toLowerCase();
    event.component.startSearch();
    if(text.length < 2) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }
    if (!text) {
      event.component.items = [];
      event.component.endSearch();
      return;
    }

    event.component.items = this.allUsers.filter(data => {
      return data.Name.toLowerCase().indexOf(text) !== -1;
    });
    event.component.endSearch();
  }
}
