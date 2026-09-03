import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CrmPage } from './crm';

@NgModule({
  declarations: [
    CrmPage,
  ],
  imports: [
    IonicPageModule.forChild(CrmPage),
  ],
})
export class CrmPageModule {}
