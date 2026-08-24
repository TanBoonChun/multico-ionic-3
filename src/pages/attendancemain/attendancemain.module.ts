import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AttendancemainPage } from './attendancemain';

@NgModule({
  declarations: [
    AttendancemainPage,
  ],
  imports: [
    IonicPageModule.forChild(AttendancemainPage),
  ],
})
export class AttendancemainPageModule {}
