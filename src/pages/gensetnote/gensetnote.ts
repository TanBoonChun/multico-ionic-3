import { Component } from '@angular/core';
import { IonicPage, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { SERVER_URL } from '../../environment';

@IonicPage()
@Component({
  selector: 'page-gensetnote',
  templateUrl: 'gensetnote.html',
})
export class GensetnotePage {

  private serviceId: any;
  public notes: any = [];

  constructor(
    public navParams: NavParams,
    private storage: Storage,
    private http: HttpClient,
    private modalCtrl: ModalController
  ) {
    this.serviceId = this.navParams.get('serviceId');
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.storage.get('token').then(val => {
      this.http.get(SERVER_URL + '/gensetnote/' + this.serviceId + '?token=' + val.token)
        .subscribe((result: any) => {
          this.notes = result;
        });
    });
  }

  addNote() {
    const modal = this.modalCtrl.create('GensetnotemodalPage', { serviceId: this.serviceId });
    modal.present();
    modal.onDidDismiss(saved => {
      if (saved) {
        this.load();
      }
    });
  }

  openNote(note) {
    const modal = this.modalCtrl.create('GensetnotemodalPage', { serviceId: this.serviceId, noteId: note.Id });
    modal.present();
    modal.onDidDismiss(saved => {
      if (saved) {
        this.load();
      }
    });
  }

  // Formats a MySQL "YYYY-MM-DD HH:MM:SS" string as "DD-Mon-YYYY h:mm AM/PM",
  // matching the Start/End Task display format. Done here (not stored this way
  // in the DB) because the column is a real DATETIME and only accepts that format.
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
