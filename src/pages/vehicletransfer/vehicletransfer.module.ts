import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehicletransferPage } from './vehicletransfer';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    VehicletransferPage,
  ],
  imports: [
    IonicPageModule.forChild(VehicletransferPage),
    IonicSelectableModule
  ],
})
export class VehicletransferPageModule {}
