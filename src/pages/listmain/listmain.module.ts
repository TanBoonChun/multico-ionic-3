import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListmainPage } from './listmain';

@NgModule({
  declarations: [
    ListmainPage,
  ],
  imports: [
    IonicPageModule.forChild(ListmainPage),
  ],
})
export class ListmainPageModule {}
