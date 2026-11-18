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
    this.applyFilter();
  }

  private sameWeek(d: Date): boolean {
    const t = SvtUtil.today();
    const start = new Date(t.getFullYear(), t.getMonth(), t.getDate() - ((t.getDay() + 6) % 7));
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    return d >= start && d <= end;
  }

  private applyFilter() {
    const visible = this.tickets.filter((t) => {
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
