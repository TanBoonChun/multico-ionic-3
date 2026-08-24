import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListformPage } from './listform';

@NgModule({
  declarations: [
    ListformPage,
  ],
  imports: [
    IonicPageModule.forChild(ListformPage),
  ],
})
export class ListformPageModule {}
