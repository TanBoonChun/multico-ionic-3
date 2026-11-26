import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';

/**
 * Logistics home: stock check, scan serial, item history and stock take.
 */
@IonicPage()
@Component({
  selector: 'page-whhome',
  templateUrl: 'whhome.html',
})
export class WhhomePage {

  constructor(private nav: NavController) {}

  stockCheck() {
    this.nav.push('WhstockcheckPage');
  }

  scanSerial() {
    this.nav.push('WhserialPage');
  }

  itemHistory() {
    this.nav.push('WhstockcheckPage', { mode: 'history' });
  }

  stockTake() {
    this.nav.push('WhstocktakelistPage');
  }
}
