import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehiclehomePage } from './vehiclehome';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    VehiclehomePage,
  ],
  imports: [
    IonicPageModule.forChild(VehiclehomePage),
    QRCodeModule
  ],
})
export class VehiclehomePageModule {}
