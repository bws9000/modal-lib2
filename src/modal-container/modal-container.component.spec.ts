import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Type, ViewContainerRef, Directive } from '@angular/core';
import { ModalContainerComponent } from './modal-container.component';
import { ModalLib2Service } from '../modal-lib2-service.service';
import { provideAnimations } from '@angular/platform-browser/animations';


@Component({
  selector: 'app-dummy',
  template: `<p>u bigdummy</p>`,
  standalone: true
})
class DummyModalComponent {
  someInput?: string;
}

@Directive({
  selector: '[modalDialogHost]',
})
class MockModalDialogDirective {
  viewContainerRef: ViewContainerRef;
  constructor(vcr: ViewContainerRef) {
    this.viewContainerRef = vcr;
  }
}

describe('ModalContainerComponent', () => {
  let component: ModalContainerComponent;
  let fixture: ComponentFixture<ModalContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ModalContainerComponent,
        DummyModalComponent,
        MockModalDialogDirective
      ],
      providers: [
        provideAnimations(),
        {
          provide: ModalLib2Service,
          useValue: { close: jest.fn() }
        }
      ]
    })
      .overrideComponent(ModalContainerComponent, {
        set: {
          imports: [MockModalDialogDirective]
        }
      }).compileComponents();

    fixture = TestBed.createComponent(ModalContainerComponent);
    component = fixture.componentInstance;

    //simulate @ViewChild ref
    const dialogHostEl = fixture.debugElement.nativeElement.querySelector('[modalDialogHost]');
    if (dialogHostEl) {
      component['dialogHost'] = dialogHostEl;
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load a component and assign inputs', () => {
    const data = { someInput: 'test value' };
    component['dialogHost'] = {
      viewContainerRef: {
        clear: jest.fn(),
        createComponent: jest.fn().mockReturnValue({
          instance: {}
        })
      }
    } as any;


    component.open(DummyModalComponent as Type<unknown>, data);

    const instance = component.getLoadedComponentInstance();
    expect(instance.someInput).toBe('test value');
  });

  it('should emit animationDone', () => {
    const spy = jest.spyOn(component.animationDone, 'emit');
    component.onAnimationDone();
    expect(spy).toHaveBeenCalled();
  });

  it('should call onClose and close modal', () => {
    const onCloseMock = jest.fn();
    const modalService = TestBed.inject(ModalLib2Service);
    component.onClose = onCloseMock;

    component.closeWithData({ result: 42 });

    expect(onCloseMock).toHaveBeenCalledWith({ result: 42 });
    expect(modalService.close).toHaveBeenCalled();
  });
});
