import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FullCalendarModule } from 'ng-fullcalendar';
import { GensetmainPage } from './gensetmain';

@NgModule({
  declarations: [
    GensetmainPage,
  ],
  imports: [
    IonicPageModule.forChild(GensetmainPage),
    FullCalendarModule,
  ],
})
export class GensetmainPageModule {}