import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ml2-container',
  template: `
    <div
      *ngIf="showBackdrop"
      class="ml2-overlay"
      (click)="onBackdrop()"
    ></div>
    <div class="ml2-panel" tabindex="-1" #panel>
      <ng-template #vc></ng-template>
    </div>
  `,
  styles: [`
    :host { position: fixed; inset: 0; display: block; }
    .ml2-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,.5);
    }
    .ml2-panel {
      background: transparent;
      color: inherit;
      padding: 0;
    }
  `],
  encapsulation: ViewEncapsulation.Emulated,
  imports: [CommonModule],
  standalone: true,
})
export class Ml2ContainerComponent {
  @Input() showBackdrop = true;
  @Output() backdropClick = new EventEmitter<void>();
  onBackdrop() {
    this.backdropClick.emit();
  }
  @ViewChild('vc', { read: ViewContainerRef, static: true }) vcTpl!: ViewContainerRef;
  @ViewChild('panel', { static: true }) panel!: ElementRef<HTMLDivElement>;

}