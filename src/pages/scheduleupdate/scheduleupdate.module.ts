import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { ScheduleupdatePage } from './scheduleupdate';

@NgModule({
  declarations: [
    ScheduleupdatePage,
  ],
  imports: [
    IonicPageModule.forChild(ScheduleupdatePage),
    IonicSelectableModule,
  ],
})
export class ScheduleupdatePageModule {}
