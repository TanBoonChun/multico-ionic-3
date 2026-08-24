import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdvancesitenewPage } from './advancesitenew';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    AdvancesitenewPage,
  ],
  imports: [
    IonicPageModule.forChild(AdvancesitenewPage), IonicSelectableModule
  ],
})
export class AdvancesitenewPageModule {}
