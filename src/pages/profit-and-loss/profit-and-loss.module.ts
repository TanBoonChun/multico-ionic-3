import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfitAndLossPage } from './profit-and-loss';

@NgModule({
  declarations: [
    ProfitAndLossPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfitAndLossPage),
  ],
})
export class ProfitAndLossPageModule {}
