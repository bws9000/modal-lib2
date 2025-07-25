import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalHostDirective } from '../modal-host.directive';

@Component({
  selector: 'app-host-container',
  template: `
    <ng-container modalHost></ng-container>
  `
})
export class HostContainerComponent {
  // Binds to the modalHost directive instance, which exposes a ViewContainerRef
  // used for injecting modal components at runtime.
  @ViewChild(ModalHostDirective, { static: true }) modalHost!: ModalHostDirective;

  // Reference to the ViewContainerRef from the modalHost directive.
  //  this is used during runtime to dynamically create modal components.
  modalHostView!: ViewContainerRef;
}

