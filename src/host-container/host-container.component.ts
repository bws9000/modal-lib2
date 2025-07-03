import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalHostDirective } from '../modal-host.directive';

@Component({
  selector: 'app-host-container',
  template: `
    <ng-container modalHost></ng-container>
  `
})
export class HostContainerComponent {
  @ViewChild(ModalHostDirective, { static: true }) modalHost!: ModalHostDirective;
  modalHostView: ViewContainerRef | undefined;
}
