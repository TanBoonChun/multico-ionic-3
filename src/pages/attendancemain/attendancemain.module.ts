import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { AttendancemainPage } from './attendancemain';

@NgModule({
  declarations: [
    AttendancemainPage,
  ],
  imports: [
    IonicPageModule.forChild(AttendancemainPage),
    IonicSelectableModule
  ],
})
export class AttendancemainPageModule {}
