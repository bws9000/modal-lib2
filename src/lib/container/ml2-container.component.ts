import {
  Component,
  ElementRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  signal,
  input,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ml2-container',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div
      *ngIf="showBackdrop()"
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
})
export class Ml2ContainerComponent {
  showBackdrop = input(true);
  private readonly _backdropClicked = signal(false);
  readonly backdropClicked = this._backdropClicked.asReadonly();

  private readonly _escPressed = signal(false);
  readonly escPressed = this._escPressed.asReadonly();

  @HostListener('document:keydown.escape')
  onEsc() {
    this._escPressed.set(true);
  }

  @ViewChild('vc', { read: ViewContainerRef, static: true })
  vcTpl!: ViewContainerRef;

  @ViewChild('panel', { static: true })
  panel!: ElementRef<HTMLDivElement>;

  onBackdrop() {
    this._backdropClicked.set(true);
  }
}

