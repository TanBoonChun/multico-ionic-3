import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdvancePage } from './advance';

@NgModule({
  declarations: [
    AdvancePage,
  ],
  imports: [
    IonicPageModule.forChild(AdvancePage),
  ],
})
export class AdvancePageModule {}
