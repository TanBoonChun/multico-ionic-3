import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { CustomernewPage } from './customernew';

@NgModule({
  declarations: [
    CustomernewPage,
  ],
  imports: [
    IonicPageModule.forChild(CustomernewPage),
    IonicSelectableModule,
  ],
})
export class CustomernewPageModule {}
