import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {  IonicSelectableModule } from 'ionic-selectable';
import { AttendancePage } from './attendance';

@NgModule({
  declarations: [
    AttendancePage,
  ],
  imports: [
    IonicPageModule.forChild(AttendancePage),
    IonicSelectableModule
  ],
})
export class AttendancePageModule {}
