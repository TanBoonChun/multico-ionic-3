import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { IonicStorageModule } from "@ionic/storage";
import { IonicImageLoader } from "ionic-image-loader";
import { File } from "@ionic-native/file";
import { FileTransfer } from "@ionic-native/file-transfer";
import { DocumentViewer } from "@ionic-native/document-viewer";
import { PhotoViewer } from "@ionic-native/photo-viewer";
import { Geolocation } from "@ionic-native/geolocation";
import { Camera } from "@ionic-native/camera";
import { HTTP } from "@ionic-native/http";
import { AuthProvider } from "../providers/auth/auth";
import { UnauthorizedInterceptor } from "../providers/auth/unauthorized.interceptor";
import { Toast } from "@ionic-native/toast";
import { FileOpener } from "@ionic-native/file-opener";
import { LocationAccuracy } from "@ionic-native/location-accuracy";
import { Base64 } from "@ionic-native/base64";
import { ImagePicker } from "@ionic-native/image-picker";
import { Badge } from "@ionic-native/badge";
import { AppPreferences } from "@ionic-native/app-preferences";
import { MyApp } from "./app.component";
import { IonicImageViewerModule } from "ionic-img-viewer";
import { OneSignal } from "@ionic-native/onesignal";
import { AppVersion } from "@ionic-native/app-version";
import { IonicSelectableModule } from "ionic-selectable";
import { BarcodeScanner } from "@ionic-native/barcode-scanner";
import { Network } from "@ionic-native/network";
import { WebView } from "@ionic-native/ionic-webview/ngx";
import { FilePath } from "@ionic-native/file-path";

import { LocalNotifications } from "@ionic-native/local-notifications";
import { BackgroundGeolocation } from "@ionic-native/background-geolocation";

import { AndroidPermissions } from "@ionic-native/android-permissions";

import { LogisticrequestconfirmPage } from "../pages/logisticrequestconfirm/logisticrequestconfirm";
import { LogisticinventorybagPage } from "../pages/Logisticinventorybag/logisticinventorybag";
import { LogisticinventorybagdetPage } from "../pages/logisticinventorybagdet/logisticinventorybagdet";

// import { GensetreplacementmodalPage } from "../pages/gensetreplacementmodal/gensetreplacementmodal";

import { StockpurchasedPage } from "../pages/stockpurchased/stockpurchased";
import { StockpurchaseddetailsPage } from "../pages/stockpurchaseddetails/stockpurchaseddetails";
import { StocknonPage } from "../pages/stocknon/stocknon";
import { StocknondetailsPage } from "../pages/stocknondetails/stocknondetails";
import { StockpurchasedreceivePage } from "../pages/stockpurchasedreceive/stockpurchasedreceive";
import { StockpurchasedreplacePage } from "../pages/stockpurchasedreplace/stockpurchasedreplace";
import { GoodreturnnoteformPage } from "../pages/goodreturnnoteform/goodreturnnoteform";
import { GoodreturnnoteformitemPage } from "../pages/goodreturnnoteformitem/goodreturnnoteformitem";
import { GoodreceivingformPage } from "../pages/goodreceivingform/goodreceivingform";
import { GoodreceivingmodalPage } from "../pages/goodreceivingmodal/goodreceivingmodal";
import { GoodreceivingnewPage } from "../pages/goodreceivingnew/goodreceivingnew";
import { GoodreceivinglistPage } from "../pages/goodreceivinglist/goodreceivinglist";
import { GoodreceivingdetailsPage } from "../pages/goodreceivingdetails/goodreceivingdetails";
import { GoodreturnedlistPage } from "../pages/goodreturnedlist/goodreturnedlist";
import { GoodreturneddetailsPage } from "../pages/goodreturneddetails/goodreturneddetails";
import { ReplacementlistdetailsPage } from "../pages/replacementlistdetails/replacementlistdetails";
import { ReplacementnosnPage } from "../pages/replacementnosn/replacementnosn";

import { InAppBrowser } from "@ionic-native/in-app-browser";
import { GlobalProvider } from "../providers/global/global";
import { CallNumber } from "@ionic-native/call-number";
import { LaunchNavigator } from "@ionic-native/launch-navigator";
import * as ionicGalleryModal from "ionic-gallery-modal";
import { HAMMER_GESTURE_CONFIG } from "@angular/platform-browser";

@NgModule({
  declarations: [
    MyApp,
    LogisticrequestconfirmPage,
    LogisticinventorybagPage,
    LogisticinventorybagdetPage,
    // GensetreplacementmodalPage,
    StockpurchasedPage,
    StockpurchaseddetailsPage,
    StocknonPage,
    StocknondetailsPage,
    StockpurchasedreceivePage,
    StockpurchasedreplacePage,
    GoodreturnnoteformPage,
    GoodreturnnoteformitemPage,
    GoodreceivingformPage,
    GoodreceivingmodalPage,
    GoodreceivingnewPage,
    GoodreceivinglistPage,
    GoodreceivingdetailsPage,
    GoodreturnedlistPage,
    GoodreturneddetailsPage,
    ReplacementlistdetailsPage,
    ReplacementnosnPage,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, { scrollAssist: true, autoFocusAssist: true }),
    IonicStorageModule.forRoot(),
    IonicImageLoader.forRoot(),
    IonicImageViewerModule,
    IonicSelectableModule,
    ionicGalleryModal.GalleryModalModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LogisticrequestconfirmPage,
    LogisticinventorybagPage,
    LogisticinventorybagdetPage,
    // GensetreplacementmodalPage,
    StockpurchasedPage,
    StockpurchaseddetailsPage,
    StocknonPage,
    StocknondetailsPage,
    StockpurchasedreceivePage,
    StockpurchasedreplacePage,
    GoodreturnnoteformPage,
    GoodreturnnoteformitemPage,
    GoodreceivingformPage,
    GoodreceivingmodalPage,
    GoodreceivingnewPage,
    GoodreceivinglistPage,
    GoodreceivingdetailsPage,
    GoodreturnedlistPage,
    GoodreturneddetailsPage,
    ReplacementlistdetailsPage,
    ReplacementnosnPage,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Camera,
    AuthProvider,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UnauthorizedInterceptor,
      multi: true,
    },
    Toast,
    BarcodeScanner,
    File,
    DocumentViewer,
    FileTransfer,
    PhotoViewer,
    FileOpener,
    LocationAccuracy,
    Base64,
    ImagePicker,
    OneSignal,
    Badge,
    HTTP,
    AppPreferences,
    AppVersion,
    IonicSelectableModule,
    LocalNotifications,
    BackgroundGeolocation,
    AndroidPermissions,
    Network,
    WebView,
    FilePath,
    InAppBrowser,
    GlobalProvider,
    CallNumber,
    LaunchNavigator,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: ionicGalleryModal.GalleryModalHammerConfig,
    },
  ],
})
export class AppModule {}
