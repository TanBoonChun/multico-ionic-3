import { Injectable } from '@angular/core';
import { SvtProvider } from '../svt/svt';
import { WhPermissions, WhLocation, WhItem, WhItemLocation, WhHistory, WhSerialLookup, WhSerialEvent, WhStocktake, WhStocktakeLine } from '../../models/stock';

/**
 * Typed wrapper over SvtProvider for the Logistics (api/wh/*) calls: stock check and stock take.
 * Every call resolves with the JSON body or rejects with the HttpErrorResponse (use
 * SvtProvider.errorMessage() to show it).
 */
@Injectable()
export class WarehouseProvider {

  constructor(private svt: SvtProvider) {}

  /** What the logged-in user may do (count / post a stock take). */
  me(): Promise<WhPermissions> {
    return this.svt.get('/wh/me');
  }

  locations(): Promise<WhLocation[]> {
    return this.svt.get('/wh/locations').then((res) => res && res.locations ? res.locations : []);
  }

  /** Search by part number or name. */
  searchItems(text: string): Promise<WhItem[]> {
    return this.svt.get('/wh/items', { q: text }).then((res) => res && res.items ? res.items : []);
  }

  /** Items whose code, item no or barcode equals what the scanner read. */
  itemsByCode(code: string): Promise<WhItem[]> {
    return this.svt.get('/wh/items', { barcode: code }).then((res) => res && res.items ? res.items : []);
  }

  /** One item with its on hand per location. */
  itemStock(itemId: number): Promise<{ item: WhItem, locations: WhItemLocation[] }> {
    return this.svt.get('/wh/items/' + itemId + '/stock');
  }

  /** Look a serial number up. Rejects with a 422 message for an empty or blank ('0') serial. */
  serial(code: string): Promise<WhSerialLookup> {
    return this.svt.get('/wh/serial', { code: code });
  }

  /** The life of one unit (id from serial()). */
  serialHistory(id: number): Promise<{ events: WhSerialEvent[] }> {
    return this.svt.get('/wh/serial/' + id + '/history');
  }

  /** params: room_id, from, to (Y-m-d), dir ('IN' | 'OUT'), page, per_page. */
  itemHistory(itemId: number, params: any): Promise<WhHistory> {
    return this.svt.get('/wh/items/' + itemId + '/history', params);
  }

  /** Locations the item has moved through (for the history filter). */
  historyLocations(itemId: number): Promise<WhLocation[]> {
    return this.svt.get('/wh/items/' + itemId + '/history/locations').then((res) => Array.isArray(res) ? res : []);
  }

  /** status: comma separated statuses, e.g. 'Open,Recount', or empty for all. */
  stocktakes(status?: string): Promise<WhStocktake[]> {
    return this.svt.get('/wh/stocktakes', { status: status }).then((res) => res && res.stocktakes ? res.stocktakes : []);
  }

  stocktake(id: number): Promise<{ stocktake: WhStocktake, lines: WhStocktakeLine[] }> {
    return this.svt.get('/wh/stocktakes/' + id);
  }

  /** scope 'location' needs room_id; scope 'part' needs parts (comma separated part numbers). */
  createStocktake(body: any): Promise<any> {
    return this.svt.post('/wh/stocktakes', body);
  }

  /** counted: { lineId: qty }. Sending a count again is harmless. */
  saveCounts(id: number, counted: any): Promise<any> {
    return this.svt.post('/wh/stocktakes/' + id + '/counts', { counted: counted });
  }

  /** Counting finished for this round. The stock take goes to Review; approval and posting are on the web. */
  submitCounts(id: number): Promise<any> {
    return this.svt.post('/wh/stocktakes/' + id + '/submit', {});
  }
}
