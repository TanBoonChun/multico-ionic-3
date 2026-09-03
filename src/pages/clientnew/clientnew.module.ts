import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IonicSelectableModule } from 'ionic-selectable';
import { ClientnewPage } from './clientnew';

@NgModule({
  declarations: [
    ClientnewPage,
  ],
  imports: [
    IonicPageModule.forChild(ClientnewPage),
    IonicSelectableModule,
  ],
})
export class ClientnewPageModule {}
