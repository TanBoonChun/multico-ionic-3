import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CustomerdetailsPage } from './customerdetails';

@NgModule({
  declarations: [
    CustomerdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomerdetailsPage),
  ],
})
export class CustomerdetailsPageModule {}
