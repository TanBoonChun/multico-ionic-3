import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FullCalendarModule } from 'ng-fullcalendar';
import { MyteamschedulePage } from './myteamschedule';

@NgModule({
  declarations: [
    MyteamschedulePage,
  ],
  imports: [
    IonicPageModule.forChild(MyteamschedulePage),
    FullCalendarModule,
  ],
})
export class MyteamschedulePageModule {}
