import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GensetnotePage } from './gensetnote';

@NgModule({
  declarations: [
    GensetnotePage,
  ],
  imports: [
    IonicPageModule.forChild(GensetnotePage),
  ]
})
export class GensetnotePageModule {}
