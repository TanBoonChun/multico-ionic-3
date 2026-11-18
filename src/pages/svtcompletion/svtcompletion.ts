import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ActionSheetController, Content } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Toast } from '@ionic-native/toast';
import { SvtProvider, SvtUtil } from '../../providers/svt/svt';
import { SignaturePadComponent } from '../../components/signature-pad/signature-pad';

/**
 * Completion Report (redesign section 6): replaces the paper service report.
 *
 * Service report details, time entries, parts, the inspection checklist picked from the
 * asset type, overall status, work performed, customer comment, technician and customer
 * signatures, Export PDF and Close ticket (locked until the checklist and both signatures
 * are complete).
 *
 * API:
 *   GET  serviceticket/completion/{id}        -> everything on the screen
 *   POST serviceticket/completion/save        -> header, times, parts, checks (+ photos), signatures
 *   POST serviceticket/completion/close
 *   GET  serviceticket/completion/{id}/pdf    -> the signed PDF
 * Signatures and photos are sent as base64 data URIs.
 *
 * Navigation params: ticket (the ticket object from the list), asset.
 */
@IonicPage()
@Component({
  selector: 'page-svtcompletion',
  templateUrl: 'svtcompletion.html',
})
export class SvtCompletionPage {

  @ViewChild(Content) content: Content;
  @ViewChild('techSig') techSig: SignaturePadComponent;
  @ViewChild('custSig') custSig: SignaturePadComponent;

  t: any;
  asset: any;
  loaded = false;
  reportNo = '';
  jobNo = '';
  closed = false;
  missing: string[] = [];

  // header
  f: any = {
    VehicleNo: '', MileageFrom: '', MileageTo: '', HourMeter: '', NextServiceHour: '',
    Recommendation: '', OverallStatus: '', WorkPerformed: '', CustomerComment: '',
    CustomerRep: '', CustomerRepTitle: '',
  };
  times: any[] = [];
  parts: any[] = [];
  templateName = '';
  checks: any[] = [];

  // signatures
  techSigned = false;
  custSigned = false;
  techImg = '';
  custImg = '';
  techDrawn = false;
  custDrawn = false;
  signerPhoto = '';
  signerPhotoOld = '';

  overallOptions = [
    { value: 'Pass', label: 'Pass', css: '' },
    { value: 'Pass with remarks', label: 'Pass with remarks', css: 'warn' },
    { value: 'Fail', label: 'Fail', css: 'fail' },
  ];

  constructor(
    private nav: NavController,
    private params: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private sheet: ActionSheetController,
    private camera: Camera,
    private iab: InAppBrowser,
    private toast: Toast,
    private svt: SvtProvider,
  ) {
    this.t = this.params.get('ticket') || {};
    this.asset = this.params.get('asset');
  }

  ionViewDidLoad() {
    this.load();
  }

  get statusText(): string {
    if (this.closed) { return 'Closed'; }
    if (this.techSigned && this.custSigned) { return 'Ready to close'; }
    return 'Awaiting signatures';
  }

  get answered(): number {
    return this.checks.filter((c) => c.Result || c.Status).length;
  }

  /** The footer buttons appear only once the report has loaded: re-measure so the content does not run under them. */
  private relayout() {
    setTimeout(() => { if (this.content) { this.content.resize(); } }, 50);
  }

  load() {
    this.svt.get('/serviceticket/completion/' + this.t.Id).then((res) => {
      if (!res) { return; }
      const c = res.completion || {};
      this.apply(res, c);
      this.loaded = true;
      this.relayout();
    }, (err) => {
      this.loaded = true;
      this.relayout();
      this.alertCtrl.create({ title: 'Error', subTitle: this.svt.errorMessage(err, 'Could not load the completion report.'), buttons: ['OK'] }).present();
    });
  }

  private apply(res: any, c: any) {
    this.reportNo = c.ReportNo || '';
    this.jobNo = res.jobNo || this.t.service_id;
    this.closed = !!res.closed;
    this.missing = res.missing || [];
    this.techSigned = !!res.techSigned;
    this.custSigned = !!res.customerSigned;
    this.techImg = c.TechSignatureImg ? this.svt.fileUrl(c.TechSignatureImg) : '';
    this.custImg = c.CustomerSignatureImg ? this.svt.fileUrl(c.CustomerSignatureImg) : '';
    this.signerPhotoOld = c.SignerPhoto ? this.svt.fileUrl(c.SignerPhoto) : '';

    for (const key in this.f) {
      if (this.f.hasOwnProperty(key) && c[key] !== undefined && c[key] !== null) { this.f[key] = c[key]; }
    }
    if (!this.f.HourMeter && this.asset && this.asset.Id) { /* hour meter stays empty until entered */ }

    this.times = (res.times || []).map((r) => ({
      WorkDate: r.WorkDate, StartTime: r.StartTime, StopTime: r.StopTime,
      Description: r.Description || '', Remarks: r.Remarks || '', Technician: r.Technician,
    }));
    this.parts = res.parts || [];

    const list = res.checklist || {};
    this.templateName = list.template ? list.template.Name : '';
    this.checks = (list.items || []).map((it) => ({
      ItemId: it.ItemId, Item: it.Item, AnswerType: it.AnswerType, Kind: this.kind(it.AnswerType), Unit: it.Unit,
      Choices: it.Choices || [], PhotoRule: it.PhotoRule, Required: it.Required,
      Result: it.Result || '', Status: it.Status || '',
      PhotoOld: it.Photo ? this.svt.fileUrl(it.Photo) : '', PhotoNew: '',
    }));
    // Choice items are answered with a searchable ionic-selectable, so give them { value, label } items
    for (const c of this.checks) {
      c.ChoiceItems = (c.Choices || []).map((ch) => ({ value: ch, label: ch }));
      c.ChoiceSel = c.ChoiceItems.filter((i) => i.value === c.Result)[0] || null;
    }
  }

  private kind(answerType: string): string {
    const a = String(answerType || '').toLowerCase();
    if (a.indexOf('value') >= 0) { return 'value'; }
    if (a.indexOf('text') >= 0) { return 'text'; }
    if (a.indexOf('choice') >= 0) { return 'choice'; }
    return 'passfail';
  }

  dateOf(r: any): string {
    const d = SvtUtil.parseDate(r.WorkDate);
    return d ? d.getDate() + '/' + (d.getMonth() + 1) : '';
  }

  /** Photo rule of the template item: Off hides the camera, "On fail" only asks for it once the item is marked Fail. */
  showsPhoto(c: any): boolean {
    if (!c.PhotoRule || c.PhotoRule === 'Off') { return false; }
    if (c.PhotoRule === 'On fail') { return c.Status === 'Fail' || !!c.PhotoNew || !!c.PhotoOld; }
    return true;
  }

  needsPhoto(c: any): boolean {
    return c.PhotoRule === 'Required' || (c.PhotoRule === 'On fail' && c.Status === 'Fail');
  }

  /** A Choice item was picked in the selectable: store its value as the answer. */
  choiceChanged(c: any) {
    c.Result = c.ChoiceSel ? c.ChoiceSel.value : '';
  }

  setStatus(c: any, status: string) {
    c.Status = c.Status === status ? '' : status;
  }

  // ---------------------------------------------------------------- photos

  private takePhoto(onDone: (dataUri: string) => void) {
    this.sheet.create({
      title: 'Add photo',
      buttons: [
        { text: 'Take photo', handler: () => { this.getPhoto(this.camera.PictureSourceType.CAMERA, onDone); } },
        { text: 'Choose from gallery', handler: () => { this.getPhoto(this.camera.PictureSourceType.PHOTOLIBRARY, onDone); } },
        { text: 'Cancel', role: 'cancel' },
      ],
    }).present();
  }

  private getPhoto(source: number, onDone: (dataUri: string) => void) {
    const options: CameraOptions = {
      quality: 60, sourceType: source, destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG, mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true, targetWidth: 1280, targetHeight: 1280,
    };
    this.camera.getPicture(options).then((data) => onDone('data:image/jpeg;base64,' + data), () => {});
  }

  checkPhoto(c: any) {
    this.takePhoto((uri) => { c.PhotoNew = uri; });
  }

  signerShot() {
    this.takePhoto((uri) => { this.signerPhoto = uri; });
  }

  // ---------------------------------------------------------------- signatures

  resignTech() { this.techSigned = false; this.techImg = ''; }
  resignCust() { this.custSigned = false; this.custImg = ''; }

  // ---------------------------------------------------------------- save / pdf / close

  private payload(): any {
    const body: any = {
      ServiceId: this.t.Id,
      VehicleNo: this.f.VehicleNo, MileageFrom: this.f.MileageFrom, MileageTo: this.f.MileageTo,
      HourMeter: this.f.HourMeter, NextServiceHour: this.f.NextServiceHour,
      Recommendation: this.f.Recommendation, OverallStatus: this.f.OverallStatus,
      WorkPerformed: this.f.WorkPerformed, CustomerComment: this.f.CustomerComment,
      CustomerRep: this.f.CustomerRep, CustomerRepTitle: this.f.CustomerRepTitle,
      times: this.times,
      parts: this.parts.map((p) => ({ PartNo: p.PartNo, Particulars: p.Particulars, Qty: p.Qty })),
      TemplateName: this.templateName,
      checks: this.checks.map((c) => ({
        ItemId: c.ItemId, Item: c.Item, AnswerType: c.AnswerType, Result: c.Result, Status: c.Status,
        Photo: c.PhotoNew || undefined,
      })),
    };
    const tech = this.techSig ? this.techSig.toDataURL() : null;
    const cust = this.custSig ? this.custSig.toDataURL() : null;
    if (tech) { body.TechSignature = tech; }
    if (cust) { body.CustomerSignature = cust; }
    if (this.signerPhoto) { body.SignerPhoto = this.signerPhoto; }
    return body;
  }

  /** Saves the report and then runs `then` (used by Export PDF and Close ticket). */
  save(then?: () => void) {
    if (this.closed) { if (then) { then(); } return; }

    if (this.custDrawn && !String(this.f.CustomerRep || '').trim()) {
      this.alertCtrl.create({ title: 'Customer', subTitle: 'Enter the representative name before saving the signature.', buttons: ['OK'] }).present();
      return;
    }

    const loader = this.loadingCtrl.create({ content: 'Saving...' });
    loader.present();
    this.svt.post('/serviceticket/completion/save', this.payload()).then((res) => {
      loader.dismiss();
      this.missing = res && res.missing ? res.missing : this.missing;
      this.toast.show('Report saved', '2000', 'center').subscribe();
      // reload so signatures / photos come back as saved files
      this.techDrawn = false; this.custDrawn = false; this.signerPhoto = '';
      if (this.techSig) { this.techSig.clear(); }
      if (this.custSig) { this.custSig.clear(); }
      this.svt.get('/serviceticket/completion/' + this.t.Id).then((full) => {
        this.apply(full, full.completion || {});
        if (then) { then(); }
      });
    }, (err) => {
      loader.dismiss();
      this.alertCtrl.create({ title: 'Could not save', subTitle: this.svt.errorMessage(err, 'Could not save the report.'), buttons: ['OK'] }).present();
    });
  }

  exportPdf() {
    this.save(() => {
      this.svt.pdfUrl(this.t.Id).then((url) => {
        this.iab.create(url, '_system');
      });
    });
  }

  get canClose(): boolean {
    return !this.closed && this.missing.length === 0 && this.techSigned && this.custSigned;
  }

  closeTicket() {
    this.save(() => {
      if (this.missing.length > 0) {
        this.alertCtrl.create({ title: 'Cannot close yet', subTitle: 'Some items are still missing - see the list on the screen.', buttons: ['OK'] }).present();
        return;
      }
      this.alertCtrl.create({
        title: 'Close ticket',
        message: 'Close ' + this.t.service_id + '? The completion report is locked after this.',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Close ticket',
            handler: () => {
              this.svt.post('/serviceticket/completion/close', { ServiceId: this.t.Id }).then(() => {
                this.closed = true;
                this.toast.show('Ticket closed', '3000', 'center').subscribe();
                this.nav.popToRoot();
              }, (err) => {
                const m = err && err.error && err.error.missing ? err.error.missing : [];
                if (m.length) { this.missing = m; }
                this.alertCtrl.create({ title: 'Cannot close', subTitle: this.svt.errorMessage(err, 'Could not close the ticket.'), buttons: ['OK'] }).present();
              });
            },
          },
        ],
      }).present();
    });
  }
}
