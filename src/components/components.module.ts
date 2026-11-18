import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignaturePadComponent } from './signature-pad/signature-pad';

/** Import this in a lazy page's module to use <signature-pad>. */
@NgModule({
  declarations: [SignaturePadComponent],
  imports: [CommonModule],
  exports: [SignaturePadComponent],
})
export class ComponentsModule {}
