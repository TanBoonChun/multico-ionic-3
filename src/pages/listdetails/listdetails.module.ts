import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListdetailsPage } from './listdetails';

@NgModule({
  declarations: [
    ListdetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ListdetailsPage),
  ],
})
export class ListdetailsPageModule {}
