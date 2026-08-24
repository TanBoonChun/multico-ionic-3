import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, AlertController, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';
import { DomSanitizer } from '@angular/platform-browser';
import { Base64 } from '@ionic-native/base64';
import { File } from '@ionic-native/file';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { Toast } from '@ionic-native/toast';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';

@IonicPage()
@Component({
  selector: 'page-gensetnotemodal',
  templateUrl: 'gensetnotemodal.html',
})
export class GensetnotemodalPage {

  private serviceId: any;
  private noteId: any;
  public title: string = '';
  public remarks: string = '';
  public isEdit: boolean = false;

  // Newly captured/picked images (not saved to server yet)
  public images = [];
  public imagesN = [];

  // Images already saved on the server (edit mode)
  public existingImages = [];
  private removeImageIds = [];

  constructor(
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private camera: Camera,
    private imagePicker: ImagePicker,
    private domSanitizer: DomSanitizer,
    private base64: Base64,
    private file: File,
    private storage: Storage,
    private http: HttpClient,
    private alertCtrl: AlertController,
    private loading: LoadingController,
    private toast: Toast
  ) {
    this.serviceId = this.navParams.get('serviceId');
    this.noteId = this.navParams.get('noteId');

    if (this.noteId) {
      this.isEdit = true;
      this.loadExisting();
    }
  }

  loadExisting() {
    const loader = this.loading.create({ content: "Please wait..." });
    loader.present();

    this.storage.get('token').then(val => {
      this.http.get(SERVER_URL + '/gensetnote/details/' + this.noteId + '?token=' + val.token)
        .subscribe((result: any) => {
          this.title = result.Title;
          this.remarks = result.Note;
          this.existingImages = (result.images || []).map(img => ({
            Id: img.Id,
            url: SERVER_URL_WITHOUT_API + img.Image_Path
          }));
          loader.dismiss();
        }, () => {
          loader.dismiss();
        });
    });
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

  displayErrorAlert(message) {
    const alert = this.alertCtrl.create({
      title: "Error",
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  takePicture() {
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 1280,
      targetHeight: 1280,
    };

    this.camera.getPicture(options).then((imageData) => {
      this.images.push(imageData);

      let filePath = imageData;
      let fileName = filePath.split('/').pop();
      let path = filePath.substring(0, filePath.lastIndexOf("/") + 1);

      this.file.readAsDataURL(path, fileName).then((base64File) => {
        this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File));
      }, () => {
        this.base64.encodeFile(imageData).then((base64File: string) => {
          this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',') + 1)));
        }, (err) => {
          console.log(err);
        });
      });
    }, (err) => {
      this.displayErrorAlert(err);
    });
  }

  getPicture() {
    const options: ImagePickerOptions = {
      quality: 70,
      outputType: 0,
      width: 1280,
      height: 1280,
    };

    const pick = () => {
      this.imagePicker.getPictures(options).then((results) => {
        for (let result of results) {
          if (result) {
            this.addPickedImage(result);
          }
        }
      }, (err) => {
        this.displayErrorAlert('Could not open the gallery. ' + JSON.stringify(err));
      });
    };

    this.imagePicker.hasReadPermission().then((granted) => {
      if (granted) {
        pick();
        return;
      }

      // Don't chain straight into pick() here: on some devices the permission
      // grant callback races with the picker's own activity lifecycle and
      // getPictures() comes back with phantom/empty entries. Silently doing
      // nothing on grant (user just taps "Get Picture" again) avoids that race.
      this.imagePicker.requestReadPermission().then(
        () => {},
        () => this.displayErrorAlert('Permission to read photos was denied.')
      );
    });
  }

  private addPickedImage(result: string) {
    if (!result) {
      return;
    }

    let uri = result;

    if (uri.indexOf('file://') !== 0 && uri.indexOf('content://') !== 0) {
      uri = 'file://' + uri;
    }

    this.images.push(uri);

    let fileName = uri.split('/').pop();
    let path = uri.substring(0, uri.lastIndexOf('/') + 1);

    this.file.readAsDataURL(path, fileName).then((base64File) => {
      this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl(base64File));
    }, () => {
      this.base64.encodeFile(uri).then((base64File: string) => {
        this.imagesN.push(this.domSanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + base64File.substring(base64File.indexOf(',') + 1)));
      }, (err) => {
        console.log('Could not build a thumbnail for ' + uri, err);
      });
    });
  }

  removeNewImage(index) {
    this.images.splice(index, 1);
    this.imagesN.splice(index, 1);
  }

  removeExistingImage(index) {
    const removed = this.existingImages.splice(index, 1);
    if (removed.length > 0) {
      this.removeImageIds.push(removed[0].Id);
    }
  }

  save() {
    if (!this.title && !this.remarks && this.imagesN.length === 0 && this.existingImages.length === 0) {
      return this.displayErrorAlert('Please enter a title/remarks or attach a picture.');
    }

    const loader = this.loading.create({ content: "Please wait..." });
    loader.present();

    const imagesBase64 = this.imagesN.map(img => img['changingThisBreaksApplicationSecurity']);

    this.storage.get('token').then(val => {
      const url = this.isEdit
        ? SERVER_URL + '/gensetnote/update?token=' + val.token
        : SERVER_URL + '/gensetnote/create?token=' + val.token;

      const payload: any = this.isEdit
        ? { Id: this.noteId, Title: this.title, Note: this.remarks, Images: imagesBase64, RemoveImageIds: this.removeImageIds }
        : { ServiceId: this.serviceId, Title: this.title, Note: this.remarks, Images: imagesBase64 };

      this.http.post(url, payload, {})
        .subscribe((result: any) => {
          loader.dismiss();
          if (result) {
            this.toast.show('Saved', '5000', 'center').subscribe();
            this.viewCtrl.dismiss(true);
          } else {
            this.toast.show('Fail to save note', '5000', 'center').subscribe();
          }
        }, () => {
          loader.dismiss();
          this.toast.show('Fail to save note', '5000', 'center').subscribe();
        });
    });
  }

}
