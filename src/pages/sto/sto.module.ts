import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StoPage } from './sto';

@NgModule({
  declarations: [
    StoPage,
  ],
  imports: [
    IonicPageModule.forChild(StoPage),
  ],
})
export class StoPageModule {}
