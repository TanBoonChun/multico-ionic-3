import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';

// Read-only note viewer. Deliberately separate from GensetnotemodalPage (which
// handles create/edit + Camera/ImagePicker) so completed-ticket notes can
// never be edited from here, and so this page can't break the edit flow.
@IonicPage()
@Component({
  selector: 'page-gensetnoteview',
  templateUrl: 'gensetnoteview.html',
})
export class GensetnoteviewPage {

  private noteId: any;
  public title: string = '';
  public remarks: string = '';
  public images: any[] = [];

  constructor(
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private storage: Storage,
    private http: HttpClient,
    private loading: LoadingController
  ) {
    this.noteId = this.navParams.get('noteId');
    this.load();
  }

  load() {
    const loader = this.loading.create({ content: 'Please wait...' });
    loader.present();

    this.storage.get('token').then(val => {
      this.http.get(SERVER_URL + '/gensetnote/details/' + this.noteId + '?token=' + val.token)
        .subscribe((result: any) => {
          this.title = result.Title;
          this.remarks = result.Note;
          this.images = (result.images || []).map(img => SERVER_URL_WITHOUT_API + img.Image_Path);
          loader.dismiss();
        }, () => {
          loader.dismiss();
        });
    });
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }

}
