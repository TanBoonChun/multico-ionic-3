import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { IonicSelectableModule } from "ionic-selectable";
import { StoformnewPage } from "./stoformnew";

@NgModule({
  declarations: [StoformnewPage],
  imports: [IonicPageModule.forChild(StoformnewPage), IonicSelectableModule],
})
export class StoformnewPageModule {}
