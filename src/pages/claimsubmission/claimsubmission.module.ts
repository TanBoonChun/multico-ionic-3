import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { ClaimsubmissionPage } from './claimsubmission';

@NgModule({
  declarations: [
    ClaimsubmissionPage,
  ],
  imports: [
    IonicPageModule.forChild(ClaimsubmissionPage),
    IonicSelectableModule
  ],
})
export class ClaimsubmissionPageModule {}
