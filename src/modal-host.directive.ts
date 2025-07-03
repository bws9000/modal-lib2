import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[modalHost]',
  standalone: true
})
export class ModalHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
