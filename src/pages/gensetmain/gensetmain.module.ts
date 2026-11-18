import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GensetmainPage } from './gensetmain';

@NgModule({
  declarations: [
    GensetmainPage,
  ],
  imports: [
    IonicPageModule.forChild(GensetmainPage),
  ],
})
export class GensetmainPageModule {}
