import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScheduledetailsPage } from './scheduledetails';

@NgModule({
  declarations: [
    ScheduledetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ScheduledetailsPage),
  ],
})
export class ScheduledetailsPageModule {}
