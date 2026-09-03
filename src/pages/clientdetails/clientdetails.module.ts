import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ClientdetailsPage } from './clientdetails';

@NgModule({
  declarations: [
    ClientdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ClientdetailsPage),
  ],
})
export class ClientdetailsPageModule {}
