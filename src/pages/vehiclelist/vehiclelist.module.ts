import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehiclelistPage } from './vehiclelist';

@NgModule({
  declarations: [
    VehiclelistPage,
  ],
  imports: [
    IonicPageModule.forChild(VehiclelistPage),
  ],
})
export class VehiclelistPageModule {}
