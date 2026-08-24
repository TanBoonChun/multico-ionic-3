import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyleavePage } from './myleave';

@NgModule({
  declarations: [
    MyleavePage,
  ],
  imports: [
    IonicPageModule.forChild(MyleavePage),
  ],
})
export class MyleavePageModule {}
