import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { OneSignal } from '@ionic-native/onesignal';
import { Badge } from '@ionic-native/badge';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { AppPreferences } from '@ionic-native/app-preferences';
import { ONESIGNAL_APP_ID, ONESIGNAL_APP_GROUP } from '../environment';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any;

  constructor(
    private platform: Platform, 
    private statusBar: StatusBar, 
    private storage: Storage, 
    private splashScreen: SplashScreen, 
    private oneSignal: OneSignal, 
    private androidPermissions: AndroidPermissions,
    private appPreferences: AppPreferences,
    private badge: Badge) {
    this.platformReady();

      this.storage.get('token').then((val) => {
        if(val) {
          this.rootPage = 'HomePage';
        } else {
          this.rootPage = 'LoginPage';
        }
    });

  }

  platformReady() {
    this.platform.ready().then(() => {
      this.statusBar.hide()

      // check if in browser or on device before running OneSignal Code
      if(this.platform.is('core') || this.platform.is('mobileweb')) {
        console.log("Platform is core or is mobile web");

      } else {
        this.resetBadge();

        // the icon badge is stale as soon as the user comes back to the app,
        // whether they tapped the notification or the app icon
        this.platform.resume.subscribe(() => this.resetBadge());

        this.oneSignal.startInit(ONESIGNAL_APP_ID);

        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.InAppAlert);

        this.oneSignal.handleNotificationReceived().subscribe(() => {
          // iOS sets the icon badge itself from ios_badgeType/ios_badgeCount in
          // the push, so counting here as well would double it. Android has no
          // such payload field - cordova-plugin-badge (ShortcutBadger) is the
          // only way to get a number there, and it only works on launchers that
          // support it, and only while the app process is alive.
          if (this.platform.is('android')) {
            this.badge.increase(1).catch(err => console.log(err));
          }
        });

        this.oneSignal.handleNotificationOpened().subscribe(() => {
          this.resetBadge();
        });

        this.oneSignal.endInit();
        this.oneSignal.setSubscription(true);

        // keep the player id handy for the login / logout calls
        this.oneSignal.getIds().then(ids => {
          console.log('OneSignal player id: ' + ids.userId);
          this.storage.set('playerid', ids.userId);
        }).catch(err => console.log(err));
      }
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  // Back to zero on the launcher icon, plus the count the OneSignal iOS
  // notification extension keeps in the shared app group.
  private resetBadge() {
    this.badge.clear().catch(err => console.log(err));
    this.clearBadgeCount();
  }

  // The notification service extension tracks the running badge count in the
  // shared app group so it can set a number on a push that arrives while the app
  // is closed. 'onesignalBadgeCount' is the key the OneSignal 2.16.1 framework
  // reads (currentCachedBadgeValue / updateCachedBadgeValue:) - the SDK never
  // looks at any other name, so a different key here is silently a no-op.
  private clearBadgeCount() {
    const suite = this.appPreferences.suite(ONESIGNAL_APP_GROUP);
    if (!suite || typeof suite.store !== 'function') {
      return;
    }
    Promise.resolve(suite.store('onesignalBadgeCount', 0))
      .catch(err => console.log(err));
  }
}
