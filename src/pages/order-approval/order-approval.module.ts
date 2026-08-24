import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderApprovalPage } from './order-approval';

@NgModule({
  declarations: [
    OrderApprovalPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderApprovalPage),
  ],
})
export class OrderApprovalPageModule {}
