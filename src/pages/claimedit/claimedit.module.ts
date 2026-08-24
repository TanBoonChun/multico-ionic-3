import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { ClaimeditPage } from './claimedit';

@NgModule({
  declarations: [
    ClaimeditPage,
  ],
  imports: [
    IonicPageModule.forChild(ClaimeditPage),
    IonicSelectableModule
  ],
})
export class ClaimeditPageModule {}
