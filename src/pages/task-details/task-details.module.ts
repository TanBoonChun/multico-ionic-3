import { NgModule } from '@angular/core';
import { FileChooser } from '@ionic-native/file-chooser';
import { IOSFilePicker } from '@ionic-native/file-picker';
import { IonicPageModule } from 'ionic-angular';
import { TaskDetailsPage } from './task-details';

@NgModule({
  declarations: [
    TaskDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(TaskDetailsPage),
  ],
  providers: [
    FileChooser,
    IOSFilePicker
  ]
})
export class TaskDetailsPageModule { }
