import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[dialogHost]',
  standalone: true
})
export class ModalDialogDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

