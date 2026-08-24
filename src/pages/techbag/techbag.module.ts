import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TechbagPage } from './techbag';

@NgModule({
  declarations: [
    TechbagPage,
  ],
  imports: [
    IonicPageModule.forChild(TechbagPage),
  ],
})
export class TechbagPageModule {}
