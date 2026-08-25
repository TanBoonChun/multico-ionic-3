import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { AttendancewoPage } from './attendancewo';

@NgModule({
  declarations: [
    AttendancewoPage,
  ],
  imports: [
    IonicPageModule.forChild(AttendancewoPage),
    IonicSelectableModule
  ],
})
export class AttendancewoPageModule {}
