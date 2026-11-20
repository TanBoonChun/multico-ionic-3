import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IonicPage, NavController, NavParams, AlertController, ModalController, LoadingController } from 'ionic-angular';
import { Toast } from '@ionic-native/toast';
import { Geolocation } from '@ionic-native/geolocation';
import { CallNumber } from '@ionic-native/call-number';
import { LaunchNavigator, LaunchNavigatorOptions } from '@ionic-native/launch-navigator';
import { SERVER_URL } from '../../environment';
import { SvtProvider, SvtUtil } from '../../providers/svt/svt';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

/**
 * Service Details (redesign section 4): the main working screen of a ticket.
 *
 *  - header card: warranty / job type / order type / SLA badges and the 5-step progress
 *  - asset information, hour meter (last reading + Log reading)
 *  - site with Navigate and Call
 *  - failure log with photos (gensetnote Type = Failure)
 *  - parts used (svt_completion_parts through serviceticket/completion)
 *  - time log (travel and task times)
 *  - pinned actions: Start/End travel, Start/End task, Complete
 *
 * The ticket fields arrive as navigation params from the list (the serviceTicket() query).
 */
@IonicPage()
@Component({
  selector: 'page-gensetservicedetails',
  templateUrl: 'gensetservicedetails.html',
})
export class GensetserviceDetailsPage {

  t: any;                   // the ticket as sent by the list
  id: any;                  // serviceticket.Id
  serId: any;               // gensetservice.Id
  steps: any[] = [];
  sla: any = null;
  pretty = SvtUtil.pretty;

  // asset (from asset/profile)
  asset: any = null;
  assetWarranty = false;
  hours: any[] = [];

  failures: any[] = [];
  parts: any[] = [];
  closed = false;

  contact: any = '';        // who to call (getcall)
  atask: any = [];          // task start / end rows (timesheets)
  atraveltask: any = [];    // travel rows
  travelLoaded = false;     // buttons stay disabled until the time log has been read
  taskLoaded = false;
  repairRows: any = [];     // my repair attendance rows (time in / time out)
  repairLoaded = false;
  refreshing = false;       // Refresh location is waiting for the GPS
  locating = false;         // a time in / time out is waiting for the GPS
  repairWorking = false;    // a time in / time out is in progress (GPS, then the request)
  busy = false;             // a start/end request is in flight (blocks a second tap)

  Latitude_In: any;
  Longitude_In: any;
  destination: string;

  constructor(
    private storage: Storage,
    private http: HttpClient,
    private navParam: NavParams,
    private nav: NavController,
    private toast: Toast,
    public callNumber: CallNumber,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private launchNavigator: LaunchNavigator,
    public geo: Geolocation,
    private svt: SvtProvider,
  ) {
    this.t = this.navParam.data || {};
    this.id = this.t.Id;
    this.serId = this.t.serviceId;
    this.destination = this.t.Lat + ',' + this.t.Long;
    this.buildHeader();

    this.geo
      .getCurrentPosition()
      .then(pos => {
        this.Latitude_In = pos.coords.latitude;
        this.Longitude_In = pos.coords.longitude;
      })
      .catch(err => console.log(err));
  }

  ionViewWillEnter() {
    this.load();
  }

  private buildHeader() {
    const p = SvtUtil.progress(this.t);
    const icons = ['person', 'eye', 'document', 'construct', 'checkmark'];
    const labels = ['Assigned', 'Visit', 'Quotation', 'Repair', 'Closed'];
    this.steps = labels.map((label, i) => ({
      label: label,
      icon: icons[i],
      state: p.done[i] ? 'done' : (p.current === i ? 'current' : ''),
    }));
    this.sla = SvtUtil.sla(this.t);
  }

  get underWarranty(): boolean {
    return SvtUtil.isWarranty(this.t) || this.assetWarranty;
  }

  load() {
    // who to call
    this.svt.get('/getcall', { UserId: this.t.UserId }).then((res) => { this.contact = res || ''; }, () => {});

    // time log rows
    this.svt.get('/getstartendtask/' + this.serId).then((res) => { this.atask = res || []; this.taskLoaded = true; }, () => { this.taskLoaded = true; });
    this.svt.get('/gettravellog/' + this.id).then((res) => { this.atraveltask = res || []; this.travelLoaded = true; }, () => { this.travelLoaded = true; });
    this.svt.get('/serviceticket/repairattendance/' + this.id).then((res) => { this.repairRows = Array.isArray(res) ? res : []; this.repairLoaded = true; this.repairWorking = false; }, () => { this.repairLoaded = true; this.repairWorking = false; });

    this.loadAsset();
    this.loadFailures();
    this.loadParts();
  }

  /** Asset record, warranty flag and hour meter readings. */
  private loadAsset() {
    if (!this.t.genset_no) { return; }
    this.svt.get('/asset/profile/' + encodeURIComponent(this.t.genset_no)).then((res) => {
      this.asset = res.asset;
      this.assetWarranty = !!res.under_warranty;
      this.hours = res.hour_meter || [];
    }, () => { this.asset = null; });
  }

  private loadFailures() {
    this.svt.get('/gensetnote/' + this.id, { type: 'Failure' }).then((res) => {
      this.failures = Array.isArray(res) ? res : [];
      // the list has no photos, so fetch each note once for its thumbnail and count
      this.failures.forEach((f) => {
        this.svt.get('/gensetnote/details/' + f.Id).then((d) => {
          f.images = d && d.images ? d.images : [];
        }, () => { f.images = []; });
      });
    }, () => { this.failures = []; });
  }

  private loadParts() {
    this.svt.get('/serviceticket/completion/' + this.id).then((res) => {
      this.parts = res && res.parts ? res.parts : [];
      this.closed = !!(res && res.closed);
    }, () => { this.parts = []; });
  }

  thumb(f: any): string {
    return f.images && f.images.length ? this.svt.fileUrl(f.images[0].Image_Path) : '';
  }

  timeOf(value: string): string {
    if (!value) { return '-'; }
    const m = /(\d{1,2}):(\d{2})(:\d{2})?(\s?[AP]M)?/i.exec(String(value));
    if (!m) { return value; }
    if (m[4]) { return m[1] + ':' + m[2] + m[4]; }
    return (m[1].length === 1 ? '0' : '') + m[1] + ':' + m[2];
  }

  /** One line per trip / per task: start and end time ("-" while it is still running). */
  get travelRows(): any[] {
    return this.atraveltask.map((r) => ({ start: this.timeOf(r.Start_Time), end: r.End_Time ? this.timeOf(r.End_Time) : '-', open: !r.End_Time }));
  }
  get taskRows(): any[] {
    return this.atask.filter((r) => r.Time_In).map((r) => ({ start: this.timeOf(r.Time_In), end: r.Time_Out ? this.timeOf(r.Time_Out) : '-', open: !r.Time_Out }));
  }

  /** Start shows first; after Start only End shows, and after End Start shows again. */
  get travelRunning(): boolean { return this.atraveltask.some((r) => !r.End_Time); }
  get taskRunning(): boolean { return this.atask.some((r) => r.Time_In && !r.Time_Out); }

  /** "2026-11-20 14:43:00" -> "20 Nov 14:43". */
  stamp(value: string): string {
    const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(String(value || ''));
    if (!m) { return value || '-'; }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return parseInt(m[3], 10) + ' ' + months[parseInt(m[2], 10) - 1] + ' ' + m[4] + ':' + m[5];
  }

  /** Repair Attendance Log: one line per time in / time out of mine on this ticket. */
  get repairLogRows(): any[] {
    return this.repairRows.map((r) => ({ start: this.stamp(r.TimeIn), end: r.TimeOut ? this.stamp(r.TimeOut) : '-', open: !r.TimeOut }));
  }

  /** Time in shows first; after Time in only Time out shows, and after Time out Time in shows again. */
  get repairRunning(): boolean { return this.repairRows.some((r) => !r.TimeOut); }

  // ---------------------------------------------------------------- hour meter

  get lastHour(): any {
    return this.hours.length ? this.hours[0] : null;
  }

  logReading() {
    if (!this.asset) {
      this.alertCtrl.create({ title: 'Hour meter', subTitle: 'This ticket has no asset on file.', buttons: ['OK'] }).present();
      return;
    }
    this.alertCtrl.create({
      title: 'Log hour meter',
      inputs: [{ name: 'hours', type: 'number', placeholder: 'Hours now (e.g. 7347.9)' }],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: (data) => {
            const hours = parseFloat(data.hours);
            if (isNaN(hours) || hours < 0) { return false; }
            this.svt.post('/asset/hourMeter/save', {
              InventoryId: this.asset.Id, ServiceId: this.id, ReadingDate: SvtUtil.ymd(new Date()), Hours: hours,
            }).then(() => {
              this.toast.show('Reading saved', '3000', 'center').subscribe();
              this.loadAsset();
            }, (err) => {
              this.toast.show(this.svt.errorMessage(err, 'Could not save the reading'), '5000', 'center').subscribe();
            });
          },
        },
      ],
    }).present();
  }

  // ---------------------------------------------------------------- failures

  addFailure() {
    const modal = this.modalCtrl.create('SvtFailurePage', { serviceId: this.id });
    modal.onDidDismiss((saved) => { if (saved) { this.loadFailures(); } });
    modal.present();
  }

  editFailure(f: any) {
    const modal = this.modalCtrl.create('SvtFailurePage', { serviceId: this.id, noteId: f.Id });
    modal.onDidDismiss((saved) => { if (saved) { this.loadFailures(); } });
    modal.present();
  }

  notes() {
    this.nav.push('GensetnotePage', { serviceId: this.id });
  }

  // ---------------------------------------------------------------- parts used

  addPart() {
    if (this.closed) {
      this.alertCtrl.create({ title: 'Parts', subTitle: 'This ticket is closed.', buttons: ['OK'] }).present();
      return;
    }
    const modal = this.modalCtrl.create('SvtPartPage');
    modal.onDidDismiss((part) => {
      if (!part) { return; }
      const label = part.Warranty ? part.Particulars + ' (warranty ' + part.Warranty + ')' : part.Particulars;
      const next = this.parts.map((p) => ({ PartNo: p.PartNo, Particulars: p.Particulars, Qty: p.Qty }));
      next.push({ PartNo: part.PartNo, Particulars: label, Qty: part.Qty });
      this.saveParts(next);
    });
    modal.present();
  }

  private saveParts(parts: any[]) {
    const loader = this.loadingCtrl.create({ content: 'Saving...' });
    loader.present();
    this.svt.post('/serviceticket/completion/save', { ServiceId: this.id, parts: parts }).then(() => {
      loader.dismiss();
      this.loadParts();
    }, (err) => {
      loader.dismiss();
      this.toast.show(this.svt.errorMessage(err, 'Could not save the part'), '5000', 'center').subscribe();
    });
  }

  // ---------------------------------------------------------------- actions

  complete() {
    this.nav.push('SvtCompletePage', { ticket: this.t, asset: this.asset });
  }

  private confirmThen(subTitle: string, run: () => void) {
    if (this.busy) { return; }
    this.alertCtrl.create({
      title: 'Confirmation',
      subTitle: subTitle,
      buttons: [
        { role: 'cancel', text: 'Cancel' },
        { text: 'Yes', handler: () => { run(); } },
      ],
    }).present();
  }

  /** Posts a time log action, keeps the buttons locked until it answers, then reloads the log. */
  private submit(path: string, body: any, failMsg: string, done?: () => void) {
    if (this.busy) { if (done) { done(); } return; }
    this.busy = true;
    this.storage.get('token').then(val => {
      this.http.post(SERVER_URL + path + '?token=' + val.token, body, httpOptions).subscribe((result: any) => {
        this.busy = false;
        if (result && result.reason) {
          this.toast.show(result.reason, '5000', 'center').subscribe();
        } else if (result === -1) {
          this.toast.show('Finish your other in-progress ticket first', '5000', 'center').subscribe();
        } else if (result === 100) {
          this.toast.show('Already up to date', '3000', 'center').subscribe();
        } else if (result > 0) {
          this.toast.show('Success', '3000', 'center').subscribe();
        } else {
          this.toast.show(failMsg, '5000', 'center').subscribe();
        }
        this.load();
      }, () => {
        this.busy = false;
        this.toast.show(failMsg, '5000', 'center').subscribe();
        this.load();
      });
    }, () => { this.busy = false; if (done) { done(); } });
  }

  start() {
    this.confirmThen('Start task?', () => this.submit('/serviceticket/startTask2', { id: this.serId }, 'Fail to start the task'));
  }

  endTask() {
    this.confirmThen('Want to end task?', () => this.submit('/serviceticket/endTask', { id: this.serId }, 'Fail to end the task'));
  }

  starttravel() {
    this.confirmThen('Start to travel?', () => this.submit('/serviceticket/starttravel', {
      id: this.id, Latitude: this.Latitude_In, Longitude: this.Longitude_In,
    }, 'Fail to start travel!'));
  }

  endtravel() {
    this.confirmThen('Arrived?', () => this.submit('/serviceticket/endtravel', {
      id: this.id, Latitude: this.Latitude_In, Longitude: this.Longitude_In,
    }, 'Fail to end travel!'));
  }
  /** Reads the position again right before a repair time in / time out (the 500 m rule needs where he is now). */
  private withPosition(run: () => void) {
    this.locating = true;
    this.geo.getCurrentPosition({ timeout: 10000, enableHighAccuracy: true }).then((pos) => {
      this.Latitude_In = pos.coords.latitude;
      this.Longitude_In = pos.coords.longitude;
      this.locating = false;
      run();
    }).catch(() => { this.locating = false; run(); });
  }

  refreshLocation() {
    if (this.refreshing || this.repairWorking) { return; }
    this.refreshing = true;
    this.withPosition(() => {
      this.refreshing = false;
      this.toast.show(this.Latitude_In ? 'Location updated' : 'Location not available', '2000', 'center').subscribe();
    });
  }

  repairTimeIn() {
    if (this.repairWorking || this.refreshing) { return; }
    this.confirmThen('Time in for the repair?', () => {
      this.repairWorking = true;
      this.withPosition(() => this.submit('/serviceticket/repairtimein', {
        id: this.id, Latitude: this.Latitude_In, Longitude: this.Longitude_In,
      }, 'Fail to time in', () => { this.repairWorking = false; }));
    });
  }

  repairTimeOut() {
    if (this.repairWorking || this.refreshing) { return; }
    this.confirmThen('Time out from the repair?', () => {
      this.repairWorking = true;
      this.withPosition(() => this.submit('/serviceticket/repairtimeout', {
        id: this.id, Latitude: this.Latitude_In, Longitude: this.Longitude_In,
      }, 'Fail to time out', () => { this.repairWorking = false; }));
    });
  }

  Call() {
    if (!this.contact || !this.contact.Contact_No_1) {
      this.toast.show('No phone number on file', '3000', 'center').subscribe();
      return;
    }
    this.callNumber.callNumber(this.contact.Contact_No_1, true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }

  navme() {
    const options: LaunchNavigatorOptions = { start: '' };
    this.launchNavigator.navigate(this.destination, options).then(
      success => console.log('Launched navigator'),
      error => this.toast.show('Could not open navigation: ' + error, '5000', 'center').subscribe()
    );
  }
}
