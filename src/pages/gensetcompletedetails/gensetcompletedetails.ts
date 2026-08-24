import { Component } from '@angular/core';
import { IonicPage, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { SERVER_URL } from '../../environment';

@IonicPage()
@Component({
  selector: 'page-gensetcompletedetails',
  templateUrl: 'gensetcompletedetails.html',
})
export class GensetcompletedetailsPage {

  private id: any;
  private serId: any;
  public type: string;
  public service_id: any;
  public genset: any;
  public siteName: string;
  public latitude: any;
  public longitude: any;
  public model: string;
  public capacity: string;
  public status: string;
  public serviceDate: string;

  public atask: any = [];
  public atraveltask: any = [];
  public notes: any = [];

  constructor(
    private navParam: NavParams,
    private storage: Storage,
    private http: HttpClient,
    private modalCtrl: ModalController
  ) {
    this.id = this.navParam.get('Id');
    this.serId = this.navParam.get('serviceId');
    this.type = this.navParam.get('service_type');
    this.service_id = this.navParam.get('service_id');
    this.genset = this.navParam.get('genset_no');
    this.siteName = this.navParam.get('Loc_Name');
    this.latitude = this.navParam.get('Lat');
    this.longitude = this.navParam.get('Long');
    this.model = this.navParam.get('model');
    this.capacity = this.navParam.get('capacity');
    this.status = this.navParam.get('Status');
    this.serviceDate = this.navParam.get('service_date');
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.storage.get('token').then((val) => {
      this.http.get(
        SERVER_URL + '/getstartendtask/' + this.serId + '?token=' + val.token
      ).subscribe((result) => {
        this.atask = result;
      });

      this.http.get(
        SERVER_URL + '/gettravellog/' + this.id + '?token=' + val.token
      ).subscribe((result) => {
        this.atraveltask = result;
      });

      this.http.get(
        SERVER_URL + '/gensetnote/' + this.id + '?token=' + val.token
      ).subscribe((result) => {
        this.notes = result;
      });
    });
  }

  openNote(note) {
    const modal = this.modalCtrl.create('GensetnoteviewPage', { noteId: note.Id });
    modal.present();
  }

  // Formats a MySQL "YYYY-MM-DD HH:MM:SS" string as "DD-Mon-YYYY h:mm AM/PM",
  // matching the Start/End Task display format.
  formatDate(value: string): string {
    if (!value) {
      return '';
    }

    const parts = value.split(' ');
    if (parts.length < 2) {
      return value;
    }

    const [datePart, timePart] = parts;
    const dateBits = datePart.split('-');
    const timeBits = timePart.split(':');
    if (dateBits.length < 3 || timeBits.length < 2) {
      return value;
    }

    const [year, month, day] = dateBits;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = months[parseInt(month, 10) - 1] || month;

    let hour = parseInt(timeBits[0], 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    if (hour === 0) {
      hour = 12;
    }

    return day + '-' + monthName + '-' + year + ' ' + hour + ':' + timeBits[1] + ' ' + ampm;
  }

}
