import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { WarehouseProvider } from './warehouse';
import { WhQueuedCount } from '../../models/stock';

const KEY = 'wh_count_queue';

export interface FlushResult {
  sent: number;
  waiting: number;
  message: string;
}

/**
 * Stock take counts typed on the phone are kept here until the server has them, so a count is not
 * lost when the signal drops in the store room. Saving a count twice on the server is harmless, so
 * a retry after a half-finished upload is safe.
 */
@Injectable()
export class CountQueue {

  constructor(private storage: Storage, private wh: WarehouseProvider) {}

  all(): Promise<WhQueuedCount[]> {
    return this.storage.get(KEY).then((val) => Array.isArray(val) ? val : [], () => []);
  }

  /** Counts of one stock take that have not been uploaded yet. */
  pending(stocktakeId: number): Promise<WhQueuedCount[]> {
    return this.all().then((list) => list.filter((q) => q.stocktakeId === stocktakeId));
  }

  /** Remember a count; a newer count of the same line replaces the older one. */
  add(stocktakeId: number, lineId: number, qty: number): Promise<any> {
    return this.all().then((list) => {
      const rest = list.filter((q) => !(q.stocktakeId === stocktakeId && q.lineId === lineId));
      rest.push({ stocktakeId: stocktakeId, lineId: lineId, qty: qty, at: Date.now() });
      return this.storage.set(KEY, rest);
    });
  }

  /**
   * Upload what is waiting for one stock take. Resolves with how many counts were sent and how many
   * are still waiting. A refusal from the server (stock take closed, no permission) drops the counts
   * and reports its message; a network or server error keeps them for the next try.
   */
  flush(stocktakeId: number): Promise<FlushResult> {
    return this.pending(stocktakeId).then((items: WhQueuedCount[]): Promise<FlushResult> => {
      if (items.length === 0) {
        return Promise.resolve<FlushResult>({ sent: 0, waiting: 0, message: '' });
      }
      const counted: any = {};
      for (let i = 0; i < items.length; i++) {
        counted[items[i].lineId] = items[i].qty;
      }
      return this.wh.saveCounts(stocktakeId, counted).then((): Promise<FlushResult> => {
        return this.remove(items).then((): FlushResult => ({ sent: items.length, waiting: 0, message: '' }));
      }, (err: any): Promise<FlushResult> => {
        const refused = !!err && err.status >= 400 && err.status < 500 && err.status !== 401;
        if (refused) {
          const message: string = err.error && err.error.message ? err.error.message : 'The server refused the counts.';
          return this.remove(items).then((): FlushResult => ({ sent: 0, waiting: 0, message: message }));
        }
        return Promise.resolve<FlushResult>({ sent: 0, waiting: items.length, message: '' });
      });
    });
  }

  /** Remove exactly the entries that were uploaded (a count typed meanwhile stays). */
  private remove(done: WhQueuedCount[]): Promise<any> {
    return this.all().then((list) => {
      const rest = list.filter((q) => {
        for (let i = 0; i < done.length; i++) {
          if (done[i].stocktakeId === q.stocktakeId && done[i].lineId === q.lineId && done[i].at === q.at) {
            return false;
          }
        }
        return true;
      });
      return this.storage.set(KEY, rest);
    });
  }
}
