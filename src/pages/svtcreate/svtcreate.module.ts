import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { SvtCreatePage } from './svtcreate';

@NgModule({
  declarations: [
    SvtCreatePage,
  ],
  imports: [
    IonicPageModule.forChild(SvtCreatePage),
    IonicSelectableModule,
  ],
})
export class SvtCreatePageModule {}
