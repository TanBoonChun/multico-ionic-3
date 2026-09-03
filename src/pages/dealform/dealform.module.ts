import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { DealformPage } from './dealform';

@NgModule({
  declarations: [
    DealformPage,
  ],
  imports: [
    IonicPageModule.forChild(DealformPage),
    IonicSelectableModule,
  ],
})
export class DealformPageModule {}
