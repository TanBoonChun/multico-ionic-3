import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GensetserviceDetailsPage } from './gensetservicedetails';

@NgModule({
  declarations: [
    GensetserviceDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(GensetserviceDetailsPage),
  ],
})
export class GensetserviceDetailsPageModule {}
