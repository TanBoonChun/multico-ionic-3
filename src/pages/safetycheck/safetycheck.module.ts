import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { SafetyCheckPage } from "./safetycheck";

@NgModule({
  declarations: [SafetyCheckPage],
  imports: [IonicPageModule.forChild(SafetyCheckPage)],
})
export class SafetyCheckPageModule {}
