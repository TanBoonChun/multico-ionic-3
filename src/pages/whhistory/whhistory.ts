import { Component } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { SvtProvider } from '../../providers/svt/svt';
import { WarehouseProvider } from '../../providers/warehouse/warehouse';
import { WhLocation, WhMovement, WhHistory } from '../../models/stock';

/**
 * Item history: every stock movement of one part (the same ledger the web shows), newest first,
 * with the balance after each movement. Filter by location, IN / OUT and date. More rows load
 * while scrolling.
 *
 * Page params: itemId (required), itemCode, partName, roomId (start with one location).
 * API: GET wh/items/{id}/history, GET wh/items/{id}/history/locations
 */
@IonicPage()
@Component({
  selector: 'page-whhistory',
  templateUrl: 'whhistory.html',
})
export class WhhistoryPage {

  itemId: number;
  itemCode: string = '';
  partName: string = '';
  unit: string = '';

  rows: WhMovement[] = [];
  locations: WhLocation[] = [];
  roomId: any = '';             // '' = all locations
  dir: string = '';             // '' = in and out, 'IN', 'OUT'
  from: string = '';            // yyyy-mm-dd
  to: string = '';

  page = 0;
  pages = 1;
  total = 0;
  opening = 0;
  closing = 0;
  totalIn = 0;
  totalOut = 0;

  busy = false;
  message = '';
  private timer: any;
  private generation = 0;

  constructor(
    private params: NavParams,
    private svt: SvtProvider,
    private wh: WarehouseProvider,
  ) {}

  ionViewDidLoad() {
    this.itemId = Number(this.params.get('itemId'));
    this.itemCode = this.params.get('itemCode') || '';
    this.partName = this.params.get('partName') || '';
    const room = this.params.get('roomId');
    if (room) { this.roomId = room; }

    this.wh.historyLocations(this.itemId).then((list) => {
      this.locations = list;
    }, () => { this.locations = []; });

    this.reload();
  }

  /** A filter changed: wait a moment (several controls may fire together), then start again from page 1. */
  filterChanged() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.reload(), 150);
  }

  setDir(dir: string) {
    this.dir = dir;
    this.reload();
  }

  clearDates() {
    this.from = '';
    this.to = '';
    this.reload();
  }

  reload() {
    this.generation++;            // an answer to an older filter is thrown away
    this.rows = [];
    this.page = 0;
    this.pages = 1;
    this.message = '';
    this.busy = false;
    this.loadPage();
  }

  /** Called by the infinite scroll when the user reaches the end of the list. */
  more(scroll: any) {
    this.loadPage().then(() => scroll.complete(), () => scroll.complete());
  }

  private loadPage(): Promise<any> {
    if (this.busy) { return Promise.resolve(null); }
    this.busy = true;
    const generation = this.generation;

    const query: any = { page: this.page + 1, per_page: 30 };
    if (this.roomId) { query.room_id = this.roomId; }
    if (this.dir) { query.dir = this.dir; }
    if (this.from) { query.from = this.from; }
    if (this.to) { query.to = this.to; }

    return this.wh.itemHistory(this.itemId, query).then((res: WhHistory) => {
      if (generation !== this.generation) { return; }
      this.busy = false;
      if (res.item) {
        this.itemCode = res.item.Item_Code;
        this.partName = res.item.Part_Name;
        this.unit = res.item.Unit;
      }
      this.page = res.page;
      this.pages = res.pages;
      this.total = res.total;
      this.opening = res.opening;
      this.closing = res.closing;
      this.totalIn = res.total_in;
      this.totalOut = res.total_out;
      this.rows = this.rows.concat(res.data || []);
      if (this.rows.length === 0) { this.message = 'No movement found.'; }
    }, (err) => {
      if (generation !== this.generation) { return; }
      this.busy = false;
      this.message = this.svt.errorMessage(err, 'Could not load the history.');
    });
  }

  hasMore(): boolean {
    return this.page < this.pages;
  }

  /** '+5' or '-2' */
  signed(qty: number): string {
    return (qty > 0 ? '+' : '') + qty;
  }

  /** '2026-11-26 14:05:00' -> '2026-11-26 14:05' */
  when(date: string): string {
    return date ? String(date).substr(0, 16) : '';
  }
}
