import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PendingleavePage } from './pendingleave';

@NgModule({
  declarations: [
    PendingleavePage,
  ],
  imports: [
    IonicPageModule.forChild(PendingleavePage),
  ],
})
export class PendingleavePageModule {}
