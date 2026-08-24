import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FilePopoverPage } from './file-popover';

@NgModule({
  declarations: [
    FilePopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(FilePopoverPage),
  ],
})
export class FilePopoverPageModule {}
