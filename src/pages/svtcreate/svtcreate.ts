import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Toast } from '@ionic-native/toast';
import { SvtProvider, SvtUtil } from '../../providers/svt/svt';

/**
 * Create Ticket (redesign section 3), grouped as Classification, Customer and asset, Schedule.
 *
 * STATUS: the screen is complete but the SERVER SIDE IS NOT READY. The app API has no
 * endpoint that creates a ticket and none that returns the pick-lists. This page is written
 * against the shape the centrix backend uses (and the web form already posts), so it should
 * work as soon as the backend adds them:
 *
 *   GET  serviceticket/createOptions
 *        -> { tickettype[{Option,Description}], client[{Id,Vendor_Name}], site[{Id,Site_ID,Site_Name}],
 *             pic[{Id,Name}], jobtype[], subjobtype[{Option,Parent_Option}], ordertype[], scopeofwork[] }
 *        (the four SVO lists may be plain strings or {Option} objects)
 *   POST serviceticket/create
 *        { assettype, genset_no, client, site, service, servicedate, servicepic, serviceremark,
 *          job_type, sub_job_type, order_type, scope_of_work }
 *
 * The asset warranty banner uses asset/profile, which already exists.
 *
 * Navigation params (optional): asset (from the Asset Profile), underWarranty.
 */
@IonicPage()
@Component({
  selector: 'page-svtcreate',
  templateUrl: 'svtcreate.html',
})
export class SvtCreatePage {

  // pick-lists, each item is { value, label } so every dropdown can be a searchable ionic-selectable
  tickettypeItems: any[] = [];
  jobItems: any[] = [];
  subjobtypeAll: any[] = [];
  subItems: any[] = [];
  orderItems: any[] = [];
  scopes: string[] = [];
  clientItems: any[] = [];
  siteItems: any[] = [];
  picItems: any[] = [];
  optionsError = '';

  // what the user picked in each dropdown (the selected { value, label } item, or null)
  sel: any = { service: null, job: null, sub: null, order: null, client: null, site: null, pic: null, dep: null, seg: null, code: null };

  // Department / Segment / Project Code: choosing all three creates a new job no together with the ticket
  codeRows: any[] = [];
  depItems: any[] = [];
  segItems: any[] = [];
  codeItems: any[] = [];
  nextJobNo = '';
  private userBranch = '';
  private clientSegments: any = {};   // client Id -> segment (Customer Management)

  // form
  f: any = {
    scope_of_work: '', genset_no: '', servicedate: '', serviceremark: '',
  };
  assetInfo: any = null;      // asset/profile result for the banner
  assetMissing = false;
  private assetType = '';
  private projectSiteId: any = '';     // location of the asset (Location List), sent with the ticket
  private assetDefaults: any = null;   // client / site of the asset, applied once the pick-lists are loaded
  private lookupTimer: any;

  constructor(
    private nav: NavController,
    private params: NavParams,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private scanner: BarcodeScanner,
    private toast: Toast,
    private svt: SvtProvider,
  ) {
    this.f.servicedate = SvtUtil.ymd(new Date());
    const asset = this.params.get('asset');
    if (asset) {
      this.f.genset_no = asset.machinery_no || asset.barcode || '';
      this.assetType = asset.type || '';
    }
  }

  ionViewDidLoad() {
    this.svt.get('/serviceticket/createOptions').then((res) => {
      res = res || {};
      this.tickettypeItems = (res.tickettype || []).map((t) => ({
        value: t.Option, label: t.Option + (t.Description ? ' - ' + t.Description : ''),
      }));
      this.clientItems = (res.client || []).map((c) => ({ value: c.Id, label: c.Vendor_Name }));
      this.siteItems = (res.site || []).map((s) => ({ value: s.Id, label: this.siteLabel(s) }));
      this.picItems = (res.pic || []).map((p) => ({ value: p.Id, label: p.Name }));
      this.jobItems = this.items(this.names(res.jobtype || res.job_type));
      this.subjobtypeAll = this.objects(res.subjobtype || res.sub_job_type);
      this.subItems = this.subFor(null);
      this.orderItems = this.items(this.names(res.ordertype || res.order_type));
      this.scopes = this.names(res.scopeofwork || res.scope_of_work);

      this.clientSegments = {};
      (res.client || []).forEach((c) => { if (c.Segment) { this.clientSegments[c.Id] = c.Segment; } });
      this.codeRows = res.projectcodes || [];
      this.userBranch = res.branch || '';
      this.nextJobNo = res.next_job_no || '';
      this.rebuildCodeLists();
      this.pickBranch();

      this.applyAssetDefaults();
    }, (err) => {
      this.optionsError = this.svt.errorMessage(err, 'Could not load the lists.') +
        ' The pick-lists for this form are not on the server yet.';
    });

    if (this.f.genset_no) { this.lookupAsset(); }
  }

  private names(list: any): string[] {
    return (list || []).map((o) => (typeof o === 'string' ? o : o.Option));
  }

  private objects(list: any): any[] {
    return (list || []).map((o) => (typeof o === 'string' ? { Option: o, Parent_Option: '' } : o));
  }

  /** Plain strings -> { value, label } items for ionic-selectable. */
  private items(list: string[]): any[] {
    return (list || []).map((n) => ({ value: n, label: n }));
  }

  /** Any sub job type can be used with any job type (same as the web form), so nothing is filtered by the job type. */
  private subFor(job: string): any[] {
    return this.items(this.subjobtypeAll.map((o) => o.Option));
  }

  changeJob() {
    // nothing to do: the sub job type list does not depend on the job type
  }

  pickScope(s: string) {
    this.f.scope_of_work = this.f.scope_of_work === s ? '' : s;
  }

  siteLabel(s: any): string {
    return s.Site_Name ? (s.Site_ID ? s.Site_ID + ' - ' : '') + s.Site_Name : (s.Site_ID || '');
  }

  // ---------------------------------------------------------------- asset

  scan() {
    this.scanner.scan().then((result) => {
      if (result.cancelled || !result.text) { return; }
      this.f.genset_no = result.text.trim();
      this.lookupAsset();
    }, (err) => {
      this.alertCtrl.create({ title: 'Scanner', subTitle: 'Could not open the camera: ' + err, buttons: ['OK'] }).present();
    });
  }

  typingAsset() {
    clearTimeout(this.lookupTimer);
    this.lookupTimer = setTimeout(() => this.lookupAsset(), 600);
  }

  private lookupAsset() {
    const code = String(this.f.genset_no || '').trim();
    this.assetInfo = null;
    this.assetMissing = false;
    if (!code) { return; }
    this.svt.get('/asset/profile/' + encodeURIComponent(code)).then((res) => {
      this.assetInfo = res;
      this.assetType = res.asset.type || '';
      if (res.asset.machinery_no) { this.f.genset_no = res.asset.machinery_no; }
      this.assetDefaults = { client: res.asset.client_id, site: res.asset.site_id };
      this.projectSiteId = res.asset.project_site_id || '';
      this.applyAssetDefaults();
    }, () => { this.assetMissing = true; });
  }

  /**
   * Fill Client and Site from the asset (the web form does the same). Runs when the asset and the
   * pick-lists are both loaded, whichever finishes last; a value that is not in a list is left empty.
   */
  private applyAssetDefaults() {
    if (!this.assetDefaults) { return; }
    const client = this.clientItems.find((c) => String(c.value) === String(this.assetDefaults.client));
    const site = this.siteItems.find((s) => String(s.value) === String(this.assetDefaults.site));
    if (this.assetDefaults.client && client) { this.sel.client = client; }
    if (this.assetDefaults.site && site) { this.sel.site = site; }
    if (this.sel.client && !this.sel.site) { this.changeClient(); }
  }

  // ---------------------------------------------------------------- job no (Department / Segment / Project Code)

  private uniq(list: string[]): string[] {
    const out: string[] = [];
    list.forEach((v) => { if (v && out.indexOf(v) < 0) { out.push(v); } });
    return out;
  }

  /** True when Department, Segment and Project Code are all chosen: a new job no is created with the ticket. */
  get autoJob(): boolean {
    return !!(this.sel.dep && this.sel.seg && this.sel.code);
  }

  /** Each list only offers what fits the choices above it, and a choice that no longer fits is dropped. */
  private rebuildCodeLists() {
    const dep = this.sel.dep ? this.sel.dep.value : '';
    this.depItems = this.items(this.uniq(this.codeRows.map((r) => r.Department)));

    this.segItems = this.items(this.uniq(this.codeRows.filter((r) => !dep || r.Department === dep).map((r) => r.Segment)));
    if (this.sel.seg && !this.segItems.some((i) => i.value === this.sel.seg.value)) { this.sel.seg = null; }

    const seg = this.sel.seg ? this.sel.seg.value : '';
    this.codeItems = this.items(this.uniq(this.codeRows
      .filter((r) => (!dep || r.Department === dep) && (!seg || r.Segment === seg)).map((r) => r.Contract_No)));
    if (this.sel.code && !this.codeItems.some((i) => i.value === this.sel.code.value)) { this.sel.code = null; }
  }

  /** The user's Branch is the default Department. */
  private pickBranch() {
    if (!this.codeRows.length || !this.userBranch || this.sel.dep) { return; }
    const b = this.depItems.find((d) => String(d.value).toUpperCase() === String(this.userBranch).toUpperCase());
    if (b) { this.sel.dep = b; this.rebuildCodeLists(); }
  }

  /** Department and Segment together give the project code. */
  private autoSelectCode() {
    if (!this.sel.dep || !this.sel.seg) { return; }
    const row = this.codeRows.find((r) => r.Department === this.sel.dep.value && r.Segment === this.sel.seg.value);
    if (row) {
      this.sel.code = this.codeItems.find((c) => c.value === row.Contract_No) || null;
      this.sel.site = null;
    }
  }

  changeDep() {
    this.rebuildCodeLists();
    this.autoSelectCode();
  }

  changeSeg() {
    this.rebuildCodeLists();
    this.autoSelectCode();
  }

  changeCode() {
    if (!this.sel.code) { return; }
    const row = this.codeRows.find((r) => r.Contract_No === this.sel.code.value);
    if (row) {
      this.sel.dep = this.depItems.find((d) => d.value === row.Department) || this.sel.dep;
      this.sel.seg = this.items(this.uniq(this.codeRows.map((r) => r.Segment))).find((s) => s.value === row.Segment) || this.sel.seg;
      this.rebuildCodeLists();
      this.sel.code = this.codeItems.find((c) => c.value === row.Contract_No) || this.sel.code;
    }
    this.sel.site = null;
  }

  /** Picking an existing job no replaces the auto-create choice. */
  changeSite() {
    if (this.sel.site) {
      this.sel.dep = null; this.sel.seg = null; this.sel.code = null;
      this.rebuildCodeLists();
    }
  }

  /** The client's Segment (Customer Management) pre-selects the segment, and with the Branch the project code. */
  changeClient() {
    const segment = this.sel.client ? this.clientSegments[this.sel.client.value] : '';
    if (!segment || this.sel.site || !this.codeRows.length) { return; }
    this.pickBranch();
    const all = this.items(this.uniq(this.codeRows.map((r) => r.Segment)));
    const found = all.find((s) => String(s.value).toUpperCase() === String(segment).toUpperCase());
    if (found) {
      this.sel.seg = found;
      this.rebuildCodeLists();
      this.autoSelectCode();
    }
  }

  /** Latest expiry among the active warranties, as '12 Mar 2027'. */
  get warrantyUntil(): string {
    let latest = '';
    for (const w of (this.assetInfo ? this.assetInfo.warranty : [])) {
      if (w.Active && w.WarrantyExpiry && w.WarrantyExpiry > latest) { latest = w.WarrantyExpiry; }
    }
    return latest ? SvtUtil.pretty(latest) : '';
  }

  pretty(v: any) { return SvtUtil.pretty(v); }

  // ---------------------------------------------------------------- submit

  submit() {
    const missing: string[] = [];
    if (!this.sel.service) { missing.push('Type'); }
    // job type and order type become compulsory once their lists exist (same rule as the web form)
    if (this.jobItems.length && !this.sel.job) { missing.push('Job type'); }
    if (this.orderItems.length && !this.sel.order) { missing.push('Order type'); }
    if (!this.sel.client) { missing.push('Client'); }
    if (!this.sel.site && !this.autoJob) { missing.push('Job no (or Branch, Segment and Project Code)'); }
    if (!this.f.genset_no) { missing.push('Asset'); }
    if (missing.length) {
      this.alertCtrl.create({ title: 'Please fill in', subTitle: missing.join(', '), buttons: ['OK'] }).present();
      return;
    }

    const d = SvtUtil.parseDate(this.f.servicedate);
    const body = {
      assettype: this.assetType,
      genset_no: this.f.genset_no,
      client: this.sel.client.value,
      site: this.sel.site ? this.sel.site.value : '',
      department: this.autoJob ? this.sel.dep.value : '',
      segment: this.autoJob ? this.sel.seg.value : '',
      project_code: this.autoJob ? this.sel.code.value : '',
      job_no_preview: this.autoJob ? this.nextJobNo : '',
      service: this.sel.service.value,
      servicedate: d ? SvtUtil.dmy(d) : '',
      servicepic: this.sel.pic ? this.sel.pic.value : '',
      serviceremark: this.f.serviceremark,
      job_type: this.sel.job ? this.sel.job.value : '',
      sub_job_type: this.sel.sub ? this.sel.sub.value : '',
      order_type: this.sel.order ? this.sel.order.value : '',
      scope_of_work: this.f.scope_of_work,
      project_site_id: this.projectSiteId,
    };

    const loader = this.loadingCtrl.create({ content: 'Submitting...' });
    loader.present();
    this.svt.post('/serviceticket/create', body).then(() => {
      loader.dismiss();
      this.toast.show('Ticket created', '3000', 'center').subscribe();
      this.nav.pop();
    }, (err) => {
      loader.dismiss();
      this.alertCtrl.create({
        title: 'Could not create the ticket',
        subTitle: this.svt.errorMessage(err, 'The server did not accept the ticket.'),
        buttons: ['OK'],
      }).present();
    });
  }
}
