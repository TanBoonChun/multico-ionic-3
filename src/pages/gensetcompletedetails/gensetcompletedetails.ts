import { Component } from '@angular/core';
import { IonicPage, NavParams, ModalController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SERVER_URL } from '../../environment';
import { SvtProvider, SvtUtil } from '../../providers/svt/svt';

/**
 * Service Complete Details: a read-only summary of a finished ticket.
 *
 *  - header: ticket, status, customer, asset, location
 *  - work period: Start / End task and Start / End travel (the time-in/out the technician logged)
 *  - Completion Report: overall status, work performed, recommendation, hour meter, parts used,
 *    inspection checklist results, failures, notes, signatures and the signed PDF
 *
 * Every section after the work period is hidden when there is nothing to show, so a ticket that
 * was completed before the Completion Report existed does not look empty or broken.
 *
 * API used:
 *   GET getstartendtask/{serviceId}, gettravellog/{id}     work period (as before)
 *   GET serviceticket/completion/{id}                      report, parts, checklist, signatures
 *   GET gensetnote/{id}  (+ gensetnote/details/{noteId})   failures and notes (+ photos)
 *   GET serviceticket/completion/{id}/pdf                  signed PDF (opened in the browser)
 */
@IonicPage()
@Component({
  selector: 'page-gensetcompletedetails',
  templateUrl: 'gensetcompletedetails.html',
})
export class GensetcompletedetailsPage {

  private id: any;
  private serId: any;
  public t: any = {};

  public atask: any = [];
  public atraveltask: any = [];

  public loaded = false;
  public hasReport = false;
  public report: any = {};          // completion header (svt_completions)
  public customer = '';
  public asset: any = {};
  public location = '';
  public parts: any[] = [];
  public checks: any[] = [];        // answered checklist items only
  public checkTemplate = '';
  public checkSummary = { pass: 0, fail: 0, na: 0 };
  public failures: any[] = [];
  public notes: any[] = [];
  public closed = false;
  public techSigned = false;
  public custSigned = false;
  public techImg = '';
  public custImg = '';

  constructor(
    private navParam: NavParams,
    private storage: Storage,
    private http: HttpClient,
    private modalCtrl: ModalController,
    private iab: InAppBrowser,
    private svt: SvtProvider,
  ) {
    this.id = this.navParam.get('Id');
    this.serId = this.navParam.get('serviceId');
    this.t = {
      service_id: this.navParam.get('service_id'),
      service_type: this.navParam.get('service_type'),
      service_date: this.navParam.get('service_date'),
      genset_no: this.navParam.get('genset_no'),
      Status: this.navParam.get('Status'),
    };
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.storage.get('token').then((val) => {
      this.http.get(
        SERVER_URL + '/getstartendtask/' + this.serId + '?token=' + val.token
      ).subscribe((result) => {
        this.atask = result;
      });

      this.http.get(
        SERVER_URL + '/gettravellog/' + this.id + '?token=' + val.token
      ).subscribe((result) => {
        this.atraveltask = result;
      });
    });

    this.loadReport();
    this.loadNotes();
  }

  private loadReport() {
    this.svt.get('/serviceticket/completion/' + this.id).then((res) => {
      this.loaded = true;
      if (!res) { return; }

      const c = res.completion || null;
      this.hasReport = !!c;
      this.report = c || {};
      this.customer = res.customer || '';
      this.asset = res.asset || {};
      this.location = res.location || '';
      this.closed = !!res.closed;
      this.techSigned = !!res.techSigned;
      this.custSigned = !!res.customerSigned;
      this.techImg = c && c.TechSignatureImg ? this.svt.fileUrl(c.TechSignatureImg) : '';
      this.custImg = c && c.CustomerSignatureImg ? this.svt.fileUrl(c.CustomerSignatureImg) : '';

      this.parts = (res.parts || []).map((p) => ({ PartNo: p.PartNo, Particulars: p.Particulars, Qty: Number(p.Qty) || 0 }));

      const list = res.checklist || {};
      this.checkTemplate = list.template ? list.template.Name : '';
      this.checks = (list.items || [])
        .filter((it) => it.Result || it.Status)
        .map((it) => ({
          Item: it.Item, Result: it.Result || '', Status: it.Status || '', Unit: it.Unit || '',
          Photo: it.Photo ? this.svt.fileUrl(it.Photo) : '',
        }));
      this.checkSummary = {
        pass: this.checks.filter((c2) => c2.Status === 'Pass').length,
        fail: this.checks.filter((c2) => c2.Status === 'Fail').length,
        na: this.checks.filter((c2) => c2.Status === 'N/A').length,
      };
    }, () => {
      // the report could not be loaded: the ticket details above still show
      this.loaded = true;
    });
  }

  private loadNotes() {
    this.svt.get('/gensetnote/' + this.id).then((res) => {
      const all = Array.isArray(res) ? res : [];
      this.failures = all.filter((n) => n.Type === 'Failure');
      this.notes = all.filter((n) => n.Type !== 'Failure');
      this.failures.forEach((f) => {
        this.svt.get('/gensetnote/details/' + f.Id).then((d) => { f.images = d && d.images ? d.images : []; }, () => { f.images = []; });
      });
    }, () => { this.failures = []; this.notes = []; });
  }

  thumb(f: any): string {
    return f.images && f.images.length ? this.svt.fileUrl(f.images[0].Image_Path) : '';
  }

  pretty(v: any): string {
    return SvtUtil.pretty(v);
  }

  /** "Pass" / "Fail" / "N/A" pill colour of a checklist result. */
  checkClass(status: string): string {
    if (status === 'Pass') { return 'svt-pill-green'; }
    if (status === 'Fail') { return 'svt-pill-red'; }
    return 'svt-pill-grey';
  }

  openNote(note) {
    const modal = this.modalCtrl.create('GensetnoteviewPage', { noteId: note.Id });
    modal.present();
  }

  exportPdf() {
    this.svt.pdfUrl(this.id).then((url) => {
      this.iab.create(url, '_system');
    });
  }

  // Formats a MySQL "YYYY-MM-DD HH:MM:SS" string as "DD-Mon-YYYY h:mm AM/PM",
  // matching the Start/End Task display format.
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
