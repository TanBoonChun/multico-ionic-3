import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfitAndLossDetailsPage } from './profit-and-loss-details';

@NgModule({
  declarations: [
    ProfitAndLossDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfitAndLossDetailsPage)
  ],
})
export class ProfitAndLossDetailsPageModule {}
