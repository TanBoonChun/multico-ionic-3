import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, AlertController, LoadingController, ActionSheetController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Toast } from '@ionic-native/toast';
import { SvtProvider } from '../../providers/svt/svt';

/**
 * Add / edit a failure (redesign section 5a). A failure is a gensetnote with Type = Failure:
 * a title, a description and several photos.
 *
 * API: POST gensetnote/create {ServiceId, Title, Note, Type, Images[]}
 *      POST gensetnote/update {Id, Title, Note, Type, Images[], RemoveImageIds[]}
 *      GET  gensetnote/details/{id}  (edit mode)
 * Photos go up as base64 data URIs.
 *
 * Navigation params: serviceId (the ticket Id), noteId (only when editing).
 * Dismisses with `true` when something was saved.
 */
@IonicPage()
@Component({
  selector: 'page-svtfailure',
  templateUrl: 'svtfailure.html',
})
export class SvtFailurePage {

  serviceId: any;
  noteId: any;
  isEdit = false;
  title = '';
  note = '';
  newPhotos: string[] = [];                       // data URIs not saved yet
  oldPhotos: { Id: any, url: string }[] = [];     // already on the server
  private removeIds: any[] = [];

  constructor(
    private params: NavParams,
    private view: ViewController,
    private camera: Camera,
    private toast: Toast,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private sheet: ActionSheetController,
    private svt: SvtProvider,
  ) {
    this.serviceId = this.params.get('serviceId');
    this.noteId = this.params.get('noteId');
    this.isEdit = !!this.noteId;
  }

  ionViewDidLoad() {
    if (!this.isEdit) { return; }
    this.svt.get('/gensetnote/details/' + this.noteId).then((res) => {
      if (!res) { return; }
      this.title = res.Title || '';
      this.note = res.Note || '';
      this.oldPhotos = (res.images || []).map((img) => ({ Id: img.Id, url: this.svt.fileUrl(img.Image_Path) }));
    });
  }

  close() {
    this.view.dismiss(false);
  }

  addPhoto() {
    this.sheet.create({
      title: 'Add photo',
      buttons: [
        { text: 'Take photo', handler: () => { this.pick(this.camera.PictureSourceType.CAMERA); } },
        { text: 'Choose from gallery', handler: () => { this.pick(this.camera.PictureSourceType.PHOTOLIBRARY); } },
        { text: 'Cancel', role: 'cancel' },
      ],
    }).present();
  }

  private pick(source: number) {
    const options: CameraOptions = {
      quality: 60,
      sourceType: source,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      targetWidth: 1280,
      targetHeight: 1280,
    };
    this.camera.getPicture(options).then((data) => {
      this.newPhotos.push('data:image/jpeg;base64,' + data);
    }, () => { /* cancelled */ });
  }

  removeNew(i: number) {
    this.newPhotos.splice(i, 1);
  }

  removeOld(i: number) {
    const gone = this.oldPhotos.splice(i, 1);
    if (gone.length) { this.removeIds.push(gone[0].Id); }
  }

  save() {
    if (!this.title.trim() && !this.note.trim() && this.newPhotos.length === 0 && this.oldPhotos.length === 0) {
      this.alertCtrl.create({ title: 'Failure', subTitle: 'Enter a title or description, or add a photo.', buttons: ['OK'] }).present();
      return;
    }

    const loader = this.loadingCtrl.create({ content: 'Saving...' });
    loader.present();

    const body: any = { Title: this.title, Note: this.note, Type: 'Failure', Images: this.newPhotos };
    let path = '/gensetnote/create';
    if (this.isEdit) {
      path = '/gensetnote/update';
      body.Id = this.noteId;
      body.RemoveImageIds = this.removeIds;
    } else {
      body.ServiceId = this.serviceId;
    }

    this.svt.post(path, body).then((res) => {
      loader.dismiss();
      if (res) {
        this.toast.show('Failure saved', '3000', 'center').subscribe();
        this.view.dismiss(true);
      } else {
        this.toast.show('Could not save the failure', '5000', 'center').subscribe();
      }
    }, (err) => {
      loader.dismiss();
      this.toast.show(this.svt.errorMessage(err, 'Could not save the failure'), '5000', 'center').subscribe();
    });
  }
}
