import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { SERVER_URL, SERVER_URL_WITHOUT_API } from '../../environment';
import 'rxjs/add/operator/toPromise';

/**
 * Small helper shared by the Service Management redesign pages (list, details, complete,
 * completion report, asset search/profile, create ticket).
 *
 * Every API call needs the JWT as ?token=, which is kept in Storage under 'token'. Calls
 * return promises that resolve with the JSON body.
 */
@Injectable()
export class SvtProvider {

  constructor(private http: HttpClient, private storage: Storage) {}

  /** The logged-in user's JWT, or '' when nobody is logged in. */
  token(): Promise<string> {
    return this.storage.get('token').then((val) => (val && val.token) ? val.token : '');
  }

  get(path: string, params?: any): Promise<any> {
    return this.token().then((token) => {
      const all: any = { token: token };
      if (params) {
        for (const key in params) {
          if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
            all[key] = String(params[key]);
          }
        }
      }
      return this.http.get(SERVER_URL + path, { params: all }).toPromise();
    });
  }

  post(path: string, body?: any): Promise<any> {
    return this.token().then((token) => {
      return this.http.post(SERVER_URL + path + '?token=' + token, body || {}).toPromise();
    });
  }

  /** Full web URL of a file the server stored (photos, signatures). */
  fileUrl(webPath: string): string {
    if (!webPath) { return ''; }
    return SERVER_URL_WITHOUT_API + webPath;
  }

  /** Signed Completion Report PDF for a ticket (the browser downloads/opens it). */
  pdfUrl(ticketId: any): Promise<string> {
    return this.token().then((token) => SERVER_URL + '/serviceticket/completion/' + ticketId + '/pdf?token=' + token);
  }

  /** The message the API sent back with an error (422 etc.), or a fallback. */
  errorMessage(err: any, fallback: string): string {
    if (err && err.error) {
      if (err.error.message) { return err.error.message; }
      if (typeof err.error === 'string' && err.error.length < 200) { return err.error; }
    }
    if (err && err.status === 404) { return 'Not available on the server yet.'; }
    return fallback;
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Pure helpers (dates, ticket badges, progress) used by several pages. */
export class SvtUtil {

  /** '20-Oct-2026' or '2026-10-20' (optionally with a time) -> Date, or null. */
  static parseDate(value: any): Date {
    if (!value) { return null; }
    const s = String(value).trim().split(' ')[0];
    let m = /^(\d{1,2})-([A-Za-z]{3})[a-z]*-(\d{4})$/.exec(s);
    if (m) {
      const mi = MONTHS.indexOf(m[2].charAt(0).toUpperCase() + m[2].substr(1, 2).toLowerCase());
      if (mi >= 0) { return new Date(parseInt(m[3], 10), mi, parseInt(m[1], 10)); }
    }
    m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) { return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)); }
    return null;
  }

  static today(): Date {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  /** Whole days from today to the date (negative = in the past). */
  static daysFromToday(d: Date): number {
    if (!d) { return null; }
    return Math.round((d.getTime() - SvtUtil.today().getTime()) / 86400000);
  }

  /** 20-Oct-2026 (the app and the web both use this form for dates). */
  static dmy(d: Date): string {
    if (!d) { return ''; }
    return (d.getDate() < 10 ? '0' : '') + d.getDate() + '-' + MONTHS[d.getMonth()] + '-' + d.getFullYear();
  }

  /** 2026-10-20 */
  static ymd(d: Date): string {
    if (!d) { return ''; }
    const mm = d.getMonth() + 1;
    return d.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (d.getDate() < 10 ? '0' : '') + d.getDate();
  }

  /** TUESDAY, 20 OCT 2026 */
  static heading(d: Date): string {
    if (!d) { return 'NO DATE'; }
    return (DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear()).toUpperCase();
  }

  /** "12 Mar 2025" from a date string, or '-' when empty. */
  static pretty(value: any): string {
    const d = SvtUtil.parseDate(value);
    if (!d) { return '-'; }
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  static isWarranty(t: any): boolean {
    return !!t && parseInt(t.warranty_active_count, 10) > 0;
  }

  static isOverdue(t: any): boolean {
    if (!t || t.Status === 'Completed') { return false; }
    const d = SvtUtil.parseDate(t.service_date);
    return !!d && SvtUtil.daysFromToday(d) < 0;
  }

  /** Label for the status pill on a ticket card. */
  static statusLabel(t: any): string {
    if (SvtUtil.isOverdue(t)) { return 'Overdue'; }
    switch (t.Status) {
      case 'In-Progress': return 'In progress';
      case 'Completed': return 'Completed';
      case 'Repair': return 'Repair';
      case 'Pending': return 'Assigned';
      default: return t.Status ? t.Status : 'Assigned';
    }
  }

  static statusClass(t: any): string {
    const label = SvtUtil.statusLabel(t);
    if (label === 'Overdue') { return 'svt-pill-red'; }
    if (label === 'In progress') { return 'svt-pill-orange'; }
    if (label === 'Completed') { return 'svt-pill-green'; }
    if (label === 'Repair') { return 'svt-pill-red'; }
    return 'svt-pill-blue';
  }

  /**
   * Five-step progress of a ticket: Assigned, Visit, Quotation, Repair, Closed. The counts
   * come from the ticket list API (quotation accepted, repair completed, ticket closed).
   */
  static progress(t: any): any {
    const visitDone = !!t.timeIn || t.Status === 'In-Progress' || t.Status === 'Repair' || t.Status === 'Completed';
    const done = [
      true,
      visitDone,
      parseInt(t.quotation_accepted_count, 10) > 0,
      parseInt(t.repair_completed_count, 10) > 0,
      parseInt(t.closed_count, 10) > 0,
    ];
    let current = done.indexOf(false);
    if (current < 0) { current = 5; }
    const doneText = ['Assigned', 'Visit started', 'Quotation accepted', 'Repair completed', 'Closed'];
    const nextText = ['', 'visit', 'quotation', 'repair', 'closing'];
    let caption = 'Closed';
    if (current < 5) {
      caption = doneText[current - 1] + ' · next: ' + nextText[current];
    }
    return { done: done, current: current, caption: caption };
  }

  /** { text, level } for the SLA line, or null when the ticket has no SLA. */
  static sla(t: any): any {
    let days: number = null;
    const due = SvtUtil.parseDate(t.sla_due_date);
    if (due) {
      days = SvtUtil.daysFromToday(due);
    } else {
      return null;
    }
    if (days < 0) {
      return { text: 'SLA overdue ' + (-days) + ' day' + (days === -1 ? '' : 's'), level: 'danger' };
    }
    if (days === 0) { return { text: 'SLA due today', level: 'danger' }; }
    return { text: 'SLA due in ' + days + ' day' + (days === 1 ? '' : 's'), level: days <= 2 ? 'danger' : 'normal' };
  }

  /** "2h 15m" between two HH:mm times on the same day (past midnight counts as next day). */
  static duration(start: string, stop: string): string {
    const a = SvtUtil.minutes(start);
    const b = SvtUtil.minutes(stop);
    if (a === null || b === null) { return ''; }
    return SvtUtil.formatMinutes(b >= a ? b - a : b + 1440 - a);
  }

  static minutes(hhmm: string): number {
    if (!hhmm) { return null; }
    const m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm));
    if (!m) { return null; }
    return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  }

  static formatMinutes(total: number): string {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h + 'h ' + (m < 10 ? '0' : '') + m + 'm';
  }
}
