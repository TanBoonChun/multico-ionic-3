import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaskRejectModalPage } from './task-reject-modal';

@NgModule({
  declarations: [
    TaskRejectModalPage,
  ],
  imports: [
    IonicPageModule.forChild(TaskRejectModalPage),
  ],
})
export class TaskRejectModalPageModule {}
