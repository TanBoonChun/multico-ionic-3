import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { IonicSelectableModule } from "ionic-selectable";
import { AdvancesitePage } from "./advancesite";

@NgModule({
  declarations: [AdvancesitePage],
  imports: [IonicPageModule.forChild(AdvancesitePage), IonicSelectableModule],
})
export class AdvancesitePageModule {}
