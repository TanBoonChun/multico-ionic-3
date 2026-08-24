import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { IonicSelectableModule } from "ionic-selectable";
import { StoformPage } from "./stoform";

@NgModule({
  declarations: [StoformPage],
  imports: [IonicPageModule.forChild(StoformPage), IonicSelectableModule],
})
export class StoformPageModule {}
