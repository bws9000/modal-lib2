import { ComponentRef, Injectable, ViewContainerRef } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { ModalContainerComponent } from "./modal-container/modal-container.component";

interface IModal {
  data: any;
  popupComponent: any;
  isBackdropEnabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalServiceService {
  public modalHost: ViewContainerRef | undefined;
  public activeModal: ComponentRef<ModalContainerComponent> | undefined;
  public data: any;
  private popup: any;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.close();
      }
    });
  }

  setModalHost(modalHost: ViewContainerRef): void {
    this.modalHost = modalHost;
  }

  private async setContainerHost(modal: IModal) {
    this.modalHost?.clear();
    this.activeModal = this.modalHost?.createComponent(ModalContainerComponent);
    if (this.activeModal) {
      this.activeModal.instance.isBackdropEnabled = modal.isBackdropEnabled ?? true;
    }
  }

  open(modal: IModal): Promise<{ child: any, container: ModalContainerComponent }> {
    const data = modal.data ?? {};

    if ('title' in data) {
      if (typeof data.title !== 'string' || data.title.length > 1000) {
        throw new Error('invalid or too long modal title!');
      }
    }

    if ('message' in data) {
      if (typeof data.message !== 'string' || data.message.length > 10000) {
        throw new Error('Invalid or too long  modal message');
      }

      if (/<script|onerror|onload/i.test(data.message)) {
        throw new Error('unsafe HTML content in modal message');
      }
    }

    return new Promise(async (resolve, reject) => {
      this.data = data;
      this.popup = modal.popupComponent;
      await this.setContainerHost(modal);

      const containerInstance = this.activeModal?.instance;
      if (containerInstance) {
        containerInstance.open(this.popup, this.data);
        const childInstance = containerInstance.getLoadedComponentInstance();
        resolve({ child: childInstance, container: containerInstance });
      } else {
        reject(new Error("modal-lib2 instance not created."));
      }
    });
  }

  getComponentInstance() {
    return this.activeModal?.instance;
  }

  public close(result?: any): void {
    if (result !== undefined && this.activeModal?.instance?.onClose) {
      this.activeModal.instance.onClose(result);
    }
    this.data = {};
    this.activeModal?.destroy();
  }

}
