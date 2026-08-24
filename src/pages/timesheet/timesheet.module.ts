import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimesheetPage } from './timesheet';

@NgModule({
  declarations: [
    TimesheetPage,
  ],
  imports: [
    IonicPageModule.forChild(TimesheetPage),
  ],
})
export class TimesheetPageModule {}
