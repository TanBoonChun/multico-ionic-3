import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FullCalendarModule } from 'ng-fullcalendar';
import { SchedulePage } from './schedule';

@NgModule({
  declarations: [
    SchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulePage),
    FullCalendarModule,
  ],
})
export class SchedulePageModule {}
