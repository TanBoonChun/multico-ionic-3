import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";

@Injectable()
export class GlobalProvider {
  constructor(public http: HttpClient, public storage: Storage) {
  }

  async getStorageData()
  {
    return Promise.all([
      this.storage.get("user"),
      this.storage.get("token"),
    ]);
  }
}
