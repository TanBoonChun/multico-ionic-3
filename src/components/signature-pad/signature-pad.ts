import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

/**
 * A plain canvas the user draws a signature on with a finger (or the mouse in a browser).
 * No third-party library: works on the old Ionic 3 / Angular 5 build.
 *
 *   <signature-pad #sig [height]="140" (changed)="hasSig = $event"></signature-pad>
 *   sig.toDataURL()  -> 'data:image/png;base64,...'  (null when nothing is drawn)
 *   sig.clear()
 */
@Component({
  selector: 'signature-pad',
  template: '<canvas #cv class="svt-sig-canvas" [style.height.px]="height" ' +
    '(touchstart)="start($event)" (touchmove)="move($event)" (touchend)="end($event)" ' +
    '(mousedown)="start($event)" (mousemove)="move($event)" (mouseup)="end($event)" (mouseleave)="end($event)"></canvas>',
})
export class SignaturePadComponent {

  @ViewChild('cv') cv: ElementRef;
  @Input() height: number = 140;
  @Output() changed = new EventEmitter<boolean>();

  private drawing = false;
  private dirty = false;

  private canvas(): HTMLCanvasElement {
    return this.cv.nativeElement as HTMLCanvasElement;
  }

  /** Match the drawing buffer to the size the canvas is shown at (also done on first touch). */
  private fit() {
    const c = this.canvas();
    const w = c.clientWidth;
    if (w > 0 && (c.width !== w || c.height !== this.height)) {
      c.width = w;
      c.height = this.height;
      this.dirty = false;
    }
  }

  private point(ev: any): { x: number, y: number } {
    const c = this.canvas();
    const rect = c.getBoundingClientRect();
    const src = ev.touches && ev.touches.length ? ev.touches[0] : ev;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  start(ev: any) {
    ev.preventDefault();
    this.fit();
    const ctx = this.canvas().getContext('2d');
    const p = this.point(ev);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1d2a8a';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
    this.drawing = true;
    this.setDirty(true);
  }

  move(ev: any) {
    if (!this.drawing) { return; }
    ev.preventDefault();
    const ctx = this.canvas().getContext('2d');
    const p = this.point(ev);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  end(ev: any) {
    if (!this.drawing) { return; }
    ev.preventDefault();
    this.drawing = false;
  }

  private setDirty(value: boolean) {
    if (this.dirty !== value) {
      this.dirty = value;
      this.changed.emit(value);
    }
  }

  clear() {
    const c = this.canvas();
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    this.setDirty(false);
  }

  isEmpty(): boolean {
    return !this.dirty;
  }

  toDataURL(): string {
    return this.dirty ? this.canvas().toDataURL('image/png') : null;
  }
}
