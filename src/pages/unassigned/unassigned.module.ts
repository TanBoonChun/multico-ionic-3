import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UnassignedPage } from './unassigned';

@NgModule({
  declarations: [
    UnassignedPage,
  ],
  imports: [
    IonicPageModule.forChild(UnassignedPage),
  ],
})
export class UnassignedPageModule {}
