import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddclaimPage } from './addclaim';

@NgModule({
  declarations: [
    AddclaimPage,
  ],
  imports: [
    IonicPageModule.forChild(AddclaimPage),
  ],
})
export class AddclaimPageModule {}
