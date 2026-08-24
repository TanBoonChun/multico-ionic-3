import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ViewController } from 'ionic-angular';
import { SERVER_URL } from '../../environment';
import { GlobalProvider } from '../../providers/global/global';
@IonicPage()
@Component({
  selector: 'page-file-popover',
  templateUrl: 'file-popover.html',
})
export class FilePopoverPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
    public http: HttpClient, public globalProvider: GlobalProvider, public toastCtrl: ToastController) {
    this.navParams.get('id')
  }

  async removeFile() {
    const [, { token }] = await this.globalProvider.getStorageData();
    this.http.delete(SERVER_URL + "/files/" + this.navParams.get('Id'), {
      params: {
        token: token,
      }

    }).subscribe((result) => {
      const toast = this.toastCtrl.create({
        message: "File deleted.",
        duration: 1500,
        position: 'bottom'
      });
      toast.present();
      this.viewCtrl.dismiss(this.navParams.get('Id'));
    });
  }

}
