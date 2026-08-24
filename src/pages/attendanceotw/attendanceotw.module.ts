import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {  AttendanceotwPage } from './attendanceotw';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    AttendanceotwPage,
  ],
  imports: [
    IonicPageModule.forChild(AttendanceotwPage),
    IonicSelectableModule
  ],
})
export class AttendanceotwPageModule {}
