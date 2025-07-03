# modal-lib2

Lightweight, standalone Angular modal system built for Angular 17+. This library provides a dynamic, service-based modal mechanism designed for use in modern Angular standalone applications.

## Features

- Angular 17+ standalone component support  
- Service-driven API for opening modals  
- Load any component as modal content  
- Pass data to modal components via `@Input()` 
- Optional backdrop support  
- `onClose` callback for data transfer back to parent  
- Auto-close support (manual or timed)  
- Basic data validation and script injection protection  
- Supports Angular animations (`@flyInOut`)  
- Emits `animationDone` event for post-animation logic  
- Custom data objects supported (e.g. `{ myStuff: true }`)
- Access to both the modal container and child component instance after opening, enabling advanced interactions

## Installation

```bash
npm install modal-lib2
```

## Setup

To enable Angular animations (required for modal transitions), add `provideAnimations()` to your `bootstrapApplication` call in `main.ts`:

```ts
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [provideAnimations()]
});
```

If you prefer to disable animations (but still avoid runtime errors), you can use `provideNoopAnimations()` instead:

```ts
import { provideNoopAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [provideNoopAnimations()]
});
```

---

## Usage Example

### 1. Create a component to be used as modal content:

```ts
import { Component, inject } from '@angular/core';
import { ModalServiceService } from 'modal-lib2';

@Component({
  selector: 'app-test-modal-content',
  standalone: true,
  template: `
    <div style="background: white; padding: 1rem;">
      <h3>Test Modal Content</h3>
      <p>This came from modal-lib2!</p>
      <small>Rendered at: {{ now }}</small>
      <br />
      <button (click)="close()" style="margin-top: 1rem;">Close</button>
    </div>
  `
})
export class DummyModalComponent {
  now = new Date().toLocaleTimeString();
  private modalService = inject(ModalServiceService);

  close() {
    this.modalService.close();
  }
}
```

### 2. Configure the modal in your `AppComponent`:

> This is required once in your root component to register the modal host container.
After setup, you can trigger modals from any other component using the ModalServiceService.

```ts
import { Component, inject, ViewContainerRef } from '@angular/core';
import { ModalServiceService } from 'modal-lib2';
import { DummyModalComponent } from './dummy-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  template: `
    <h1>Test Modal</h1>
    <button (click)="open()">Open Modal</button>
  `,
})
export class AppComponent implements OnInit {
  private viewContainerRef = inject(ViewContainerRef);
  private modalService = inject(ModalServiceService);

  ngOnInit(): void {
    //register the host once in your root component
    this.modalService.setModalHost(this.viewContainerRef);
  }

  //*** this can be used in any component after host 
  // registration or here in app comp
  open() {
    this.modalService.open({
      popupComponent: DummyModalComponent,
      data: {
        title: 'Hello!',
        message: 'Modal-lib2 test is working!',
      },
    });
  }

  //*** this can be used in any component after host 
  // registration or here in app comp
//another open() but sending data back and fourth:
  private openWithTwoWayCommunication(): void {
  this.modalService.open({
    popupComponent: DummyModalComponent,
    data: {
      title: "Standalone Modal Test",
      message: "Modal content rendered from modal-lib2.",
    },
    //or data:{} for no data...
    // or data:{mystuff:'stuff'}
    isBackdropEnabled: false
  }).then(instance => {
    //handle the result returned from the modal
    if (instance) {
      instance.onClose = (result: any) => {
        console.log("Modal closed with result:", result);
      };
    }

    //also get a notification when animation complete
    instance.animationDone.subscribe(() => {
        console.log("Modal animation completed.");
    });
    
  setTimeout(() => {
    //example: automatically close the modal after 5 
    // seconds to test onClose logic...
    //instance.closeWithData({ success: true });  //<-- valid if you want 
    // to call directly on the instance to test
    
    //but use this
    this.modalService.close({ success: true });
  }, 5000);

  });

}

//*** advanced usage with access to both container and child, and @Input() data binding:
private openLoginCheckWebPopup(): void {
  this.modalService.open({
    popupComponent: DummyModalComponent,
    data: {
      isRobot$: this.robotSubject //auto-binds to @Input() isRobot$ in modal component
    },
    isBackdropEnabled: false
  }).then(({ container, child }) => {
    //child = instance of DummyModalComponent
    //container = instance of ModalContainerComponent

    if (child) {
      child.onClose = (result: any) => {
        console.log("Modal closed with result:", result);
      };
    }

    container?.animationDone.subscribe(() => {
      console.log("Modal animation completed.");
      //trigger something 
    });
  });
}

}

```




