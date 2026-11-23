import { Component } from '@angular/core';
import { NavController, LoadingController, IonicPage } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { OneSignal } from '@ionic-native/onesignal';
import { SERVER_URL } from '../../environment';

/**
 * Logout: a plain confirmation with one Logout button (no admin id / password any more).
 * It unregisters this phone from push notifications (clearplayerid), clears the saved session and
 * goes back to the login page. If the server cannot be reached the phone is still logged out.
 */
@IonicPage()
@Component({
  selector: 'page-logoutadminpermission',
  templateUrl: 'logoutadminpermission.html',
})
export class LogoutadminpermissionPage {

  busy = false;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public http: HttpClient,
    private oneSignal: OneSignal,
  ) {}

  /** The push player id of this phone: from OneSignal, otherwise the one saved at login. */
  private playerId(): Promise<any> {
    let fromOneSignal: Promise<any>;
    try {
      fromOneSignal = this.oneSignal.getIds().then((ids) => ids.userId).catch(() => null);
    } catch (e) {
      fromOneSignal = Promise.resolve(null);
    }
    return fromOneSignal.then((id) => id ? id : this.storage.get('playerid'));
  }

  logout() {
    if (this.busy) { return; }
    this.busy = true;

    const loading = this.loadingCtrl.create({ content: 'Logging out...', spinner: 'crescent' });
    loading.present();

    const finish = () => {
      this.storage.clear().then(() => {
        loading.dismiss();
        this.busy = false;
        this.navCtrl.setRoot('LoginPage');
      });
    };

    this.storage.get('token').then((val) => {
      const token = val && val.token ? val.token : '';
      if (!token) { return null; }
      return this.playerId().then((playerid) =>
        this.http.post(SERVER_URL + '/clearplayerid?token=' + token, { Player_Id: playerid ? playerid : '' }).toPromise());
    }).then(finish, finish);
  }

  cancel() {
    this.navCtrl.pop();
  }
}
