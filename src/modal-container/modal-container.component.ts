import { AfterViewInit, Component, ComponentRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import {
  animate,
  state,
  trigger,
  style,
  transition,
} from "@angular/animations";
import { Subject } from "rxjs";
import { ModalDialogDirective } from "../modal-dialog.directive";
import { ModalServiceService } from "../modal-service.service";

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
  imports: [ModalDialogDirective]
})
export class ModalContainerComponent implements AfterViewInit {
  onClose: ((result: any) => void) | null = null;

  @Input() isBackdropEnabled: boolean = true;
  @Output() animationDone = new EventEmitter<void>();
  @ViewChild(ModalDialogDirective, { static: true })

  dialogHost!: ModalDialogDirective;

  private componentToLoad: any;
  private componentData: any;
  public closeSubject = new Subject<any>();
  private loadedComponentRef: ComponentRef<any> | null = null;

  constructor(private modalService: ModalServiceService) { }


  onAnimationDone(): void {
    this.animationDone.emit();
  }


  ngAfterViewInit(): void {
    if (this.componentToLoad) {
      this.loadComponent();
    }
  }

  open(component: any, data: any): void {
    this.componentToLoad = component;
    this.componentData = data;
    if (this.dialogHost?.viewContainerRef) {
      this.loadComponent();
    }
  }

  private loadComponent(): void {
    const viewContainerRef = this.dialogHost.viewContainerRef;
    viewContainerRef.clear();
    this.loadedComponentRef = viewContainerRef.createComponent(this.componentToLoad);
    //assign inputs manually using the stored data
    if (this.loadedComponentRef && this.componentData) {
      Object.assign(this.loadedComponentRef.instance, this.componentData);//todo:
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
