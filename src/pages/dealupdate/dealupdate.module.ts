import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { DealupdatePage } from './dealupdate';

@NgModule({
  declarations: [
    DealupdatePage,
  ],
  imports: [
    IonicPageModule.forChild(DealupdatePage),
    IonicSelectableModule,
  ],
})
export class DealupdatePageModule {}
