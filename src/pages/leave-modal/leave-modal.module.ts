import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LeaveModalPage } from './leave-modal';

@NgModule({
  declarations: [
    LeaveModalPage,
  ],
  imports: [
    IonicPageModule.forChild(LeaveModalPage),
  ],
})
export class LeaveModalPageModule {}
