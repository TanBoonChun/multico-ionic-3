import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { SvtProvider, SvtUtil } from '../../providers/svt/svt';

/**
 * Service Management list (redesign section 2): the home of the Service Management part of
 * the app. Replaces the calendar with ticket cards that show the classification, warranty
 * cover, SLA and progress without opening the ticket.
 *
 * The server has no "all my tickets" endpoint, so the list is built from
 *   GET serviceticket/getServiceDatetest   (one row per service date that still has open tickets)
 *   GET serviceticket/getService?date=...  (the tickets of one date)
 * which are the two calls the old calendar and day list already used.
 */
@IonicPage()
@Component({
  selector: 'page-gensetmain',
  templateUrl: 'gensetmain.html',
})
export class GensetmainPage {

  filter: string = 'today';     // today | week | overdue | all
  q: string = '';               // search text
  resultCount = 0;
  tickets: any[] = [];
  groups: any[] = [];
  overdueCount = 0;
  loading = false;
  failed = false;

  progress = SvtUtil.progress;
  sla = SvtUtil.sla;
  statusLabel = SvtUtil.statusLabel;
  statusClass = SvtUtil.statusClass;
  isWarranty = SvtUtil.isWarranty;

  constructor(private nav: NavController, private svt: SvtProvider) {}

  ionViewWillEnter() {
    this.load();
  }

  refresh(refresher: any) {
    this.load(() => refresher.complete());
  }

  load(done?: () => void) {
    this.loading = true;
    this.failed = false;

    this.svt.get('/serviceticket/getServiceDatetest').then((rows) => {
      const dates: string[] = [];
      for (const r of (Array.isArray(rows) ? rows : [])) {
        if (r.service_date && dates.indexOf(r.service_date) < 0) { dates.push(r.service_date); }
      }
      return Promise.all(dates.map((d) =>
        this.svt.get('/serviceticket/getService', { date: d }).then((res) => (res && res.service) ? res.service : [], () => [])));
    }).then((lists) => {
      const seen: any = {};
      const all: any[] = [];
      for (const list of lists) {
        for (const t of list) {
          if (!seen[t.Id]) { seen[t.Id] = true; all.push(t); }
        }
      }
      this.tickets = all;
      this.overdueCount = all.filter((t) => SvtUtil.isOverdue(t)).length;
      this.applyFilter();
      this.loading = false;
      if (done) { done(); }
    }, () => {
      this.loading = false;
      this.failed = true;
      if (done) { done(); }
    });
  }

  setFilter(f: string) {
    this.filter = f;
    this.q = '';          // choosing a tab ends a search
    this.applyFilter();
  }

  /** True while the search box has text: the search looks through all open tickets, whatever tab was chosen. */
  get searching(): boolean {
    return this.q.trim() !== '';
  }

  clearSearch() {
    this.q = '';
    this.applyFilter();
  }

  /** Everything on the ticket card that a user may type: ticket no, customer, asset, site, type... Every word must match. */
  private matches(t: any, words: string[]): boolean {
    const hay = [
      t.service_id, t.customer_name, t.genset_no, t.Loc_Name, t.service_type, t.job_type, t.sub_job_type, t.order_type,
      t.scope_of_work, t.asset_type, t.model, t.brand, t.remarks, t.service_date, SvtUtil.statusLabel(t),
    ].join(' ').toLowerCase();
    return words.every((w) => hay.indexOf(w) >= 0);
  }

  private sameWeek(d: Date): boolean {
    const t = SvtUtil.today();
    const start = new Date(t.getFullYear(), t.getMonth(), t.getDate() - ((t.getDay() + 6) % 7));
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return d >= start && d <= end;
  }

  applyFilter() {
    const words = this.q.toLowerCase().split(/\s+/).filter((w) => w !== '');
    const visible = this.tickets.filter((t) => {
      if (words.length) { return this.matches(t, words); }
      const d = SvtUtil.parseDate(t.service_date);
      if (this.filter === 'all') { return true; }
      if (this.filter === 'overdue') { return SvtUtil.isOverdue(t); }
      if (!d) { return false; }
      if (this.filter === 'today') { return SvtUtil.daysFromToday(d) === 0; }
      return this.sameWeek(d);
    });

    visible.sort((a, b) => {
      const da = SvtUtil.parseDate(a.service_date);
      const db = SvtUtil.parseDate(b.service_date);
      return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
    });

    this.resultCount = visible.length;

    const groups: any[] = [];
    for (const t of visible) {
      const d = SvtUtil.parseDate(t.service_date);
      const heading = SvtUtil.heading(d);
      let g = groups.length ? groups[groups.length - 1] : null;
      if (!g || g.heading !== heading) {
        g = { heading: heading, items: [] };
        groups.push(g);
      }
      g.items.push(t);
    }
    this.groups = groups;
  }

  open(t: any) {
    if (t.service_type === 'Delivery' && (t.Status === 'In-Progress' || t.Status === 'Completed')) {
      this.nav.push('GensetdeliveryPage', t);
    } else {
      this.nav.push('GensetserviceDetailsPage', t);
    }
  }

  create() {
    this.nav.push('SvtCreatePage');
  }

  completed() {
    this.nav.push('GensetcompletePage');
  }

  scanAsset() {
    this.nav.push('SvtFindassetPage');
  }
}
