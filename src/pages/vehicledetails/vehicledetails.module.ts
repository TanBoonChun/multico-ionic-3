import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VehicledetailsPage } from './vehicledetails';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    VehicledetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(VehicledetailsPage),
    QRCodeModule
  ],
})
export class VehicledetailsPageModule {}
