import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaskCompleteModalPage } from './task-complete-modal';

@NgModule({
  declarations: [
    TaskCompleteModalPage,
  ],
  imports: [
    IonicPageModule.forChild(TaskCompleteModalPage),
  ],
})
export class TaskCompleteModalPageModule {}
