// export const SERVER_URL = "http://172.20.10.2:8000/api"; // Own Data
// export const SERVER_URL_WITHOUT_API = "http://172.20.10.2:8000"; // Own Data
// export const SERVER_URL = "http://192.168.68.58:8000/api";
// export const SERVER_URL_WITHOUT_API = "http://192.168.68.58:8000";
export const SERVER_URL = "http://192.168.68.57:8000/api";
export const SERVER_URL_WITHOUT_API = "http://192.168.68.57:8000";


// OneSignal (dashboard -> Settings -> Keys & IDs -> OneSignal App ID)
// NOTE: must be the SAME app as the app_id the Laravel backend posts with
// (UserController.php sendMessage* functions).
// export const ONESIGNAL_APP_ID = "7a850750-2b8b-4637-8fc8-784d18025961";
// iOS only: app group shared with the OneSignalNotificationServiceExtension.
// Must be "group.<bundle id>.onesignal" -> bundle id is com.softoya.centrix.
// export const ONESIGNAL_APP_GROUP = "group.com.softoya.multico.onesignal";


export const environment = {
  production: false,
  auth: {
    credentialsLoginUrl: SERVER_URL + '/login'
  },
};


