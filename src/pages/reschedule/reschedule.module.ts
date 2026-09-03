import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReschedulePage } from './reschedule';

@NgModule({
  declarations: [
    ReschedulePage,
  ],
  imports: [
    IonicPageModule.forChild(ReschedulePage),
  ],
})
export class ReschedulePageModule {}
