import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { AdvanceredirectPage } from './advanceredirect';

@NgModule({
  declarations: [
    AdvanceredirectPage,
  ],
  imports: [
    IonicPageModule.forChild(AdvanceredirectPage),
    IonicSelectableModule
  ],
})
export class AdvanceredirectPageModule {}
