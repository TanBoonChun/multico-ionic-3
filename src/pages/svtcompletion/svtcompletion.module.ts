import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SvtCompletionPage } from './svtcompletion';
import { ComponentsModule } from '../../components/components.module';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  declarations: [
    SvtCompletionPage,
  ],
  imports: [
    IonicPageModule.forChild(SvtCompletionPage),
    ComponentsModule,
    IonicSelectableModule,
  ],
})
export class SvtCompletionPageModule {}
