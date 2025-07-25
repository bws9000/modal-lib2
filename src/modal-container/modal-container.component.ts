import { AfterViewInit, Component, ComponentRef, EventEmitter, Input, OnInit, Output, Type, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  animate,
  state,
  trigger,
  style,
  transition,
} from "@angular/animations";
import { Subject } from "rxjs";
import { ModalDialogDirective } from "../modal-dialog.directive";
import { ModalLib2Service } from "../modal-lib2-service.service";

@Component({
  selector: "app-dialog-container",
  templateUrl: "./modal-container.component.html",
  styleUrls: ["./modal-container.component.scss"],
  animations: [
    trigger("flyInOut", [
      state("in", style({ transform: "translateY(0)" })),
      transition("void => *", [
        style({ transform: "translateY(-100%)" }),
        animate(250),
      ]),
      transition("* => void", [
        animate(100, style({ transform: "translateY(100%)" })),
      ]),
    ]),
  ],
  standalone: true,
  imports: [ModalDialogDirective],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ModalContainerComponent implements AfterViewInit {
  //Optional close callback set by modal service
  onClose: ((result: any) => void) | null = null;

  @Input() isBackdropEnabled: boolean = true;
  @Output() animationDone = new EventEmitter<void>();

  // Placeholder for dynamically loaded component
  @ViewChild(ModalDialogDirective, { static: true })

  dialogHost!: ModalDialogDirective;

  private componentToLoad!: Type<unknown>;
  private componentData!: Record<string, unknown>;
  public closeSubject = new Subject<any>();
  private loadedComponentRef: ComponentRef<any> | null = null;

  constructor(private modalService: ModalLib2Service) { }


  onAnimationDone(): void {
    this.animationDone.emit();
  }


  ngAfterViewInit(): void {
    if (this.componentToLoad) {
      this.loadComponent();
    }
  }

  /**
   * Called by the ModalService to pass in the component and data
   */
  open(component: Type<unknown>, data: Record<string, unknown>): void {
    this.componentToLoad = component;
    this.componentData = data;
    if (this.dialogHost?.viewContainerRef) {
      this.loadComponent();
    }
  }

/**
 *  Dynamically creates the injected modal component and passes data to it.
 * 
 * - The component is created inside the <ng-template> via the ViewContainerRef.
 * - Inputs are manually bound via Object.assign, since Angular doesn't automatically
 *  wire @Input() bindings for dynamically created components
 * 
 */
private loadComponent(): void {
  const viewContainerRef = this.dialogHost.viewContainerRef;
  viewContainerRef.clear();
  this.loadedComponentRef = viewContainerRef.createComponent(this.componentToLoad);
  if (this.loadedComponentRef && this.componentData) {
    // Dynamically assign input values to the newly created component instance.
    Object.assign(this.loadedComponentRef.instance, this.componentData);
  }
}


  public getLoadedComponentInstance(): any {
    return this.loadedComponentRef?.instance;
  }

  public closeWithData(data: any): void {
    this.onClose?.(data);
    this.modalService.close();
  }


}
