# modal-lib2

Lightweight, standalone Angular modal system built for Angular 17+. This library provides a dynamic, service-based modal mechanism designed for use in modern Angular standalone applications.

✨ Features
- Angular 17+ standalone component support
- Service-driven API for opening modals
- Load any component as modal content
- Pass data to modal components via @Input()
- Optional backdrop
- onClose callback for data transfer
- Programmatic close support (manual or timed)
- Basic input sanitization
- Supports Angular animations (@flyInOut)
- Emits animationDone for post-animation logic
- Advanced API returns modal container + child component references

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

## Quick Example

```ts
import { Component, inject } from '@angular/core';
import { ModalLib2Service } from 'modal-lib2';

@Component({
  selector: 'app-test-modal-content',
  standalone: true,
  template: `
    <div class="modal-body">
      <h3>Test Modal</h3>
      <p>This came from modal-lib2!</p>
      <button (click)="close()">Close</button>
    </div>
  `,
})
export class TestModalContentComponent {
  private modalService = inject(ModalLib2Service);

  close() {
    this.modalService.close({ success: true });
  }
}
```

### Register Modal Host (in AppComponent)

```ts
import { Component, ViewContainerRef, inject } from '@angular/core';
import { ModalLib2Service } from 'modal-lib2';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<router-outlet />`,
})
export class AppComponent {
  private viewContainerRef = inject(ViewContainerRef);
  private modalService = inject(ModalLib2Service);

  constructor() {
    this.modalService.setModalHost(this.viewContainerRef);
  }
}
```

### Open the Modal Anywhere
```ts
import { Component, inject } from '@angular/core';
import { ModalLib2Service } from 'modal-lib2';
import { TestModalContentComponent } from './test-modal-content.component';

@Component({
  selector: 'app-main',
  standalone: true,
  template: `<button (click)="openModal()">Open Modal</button>`,
})
export class MainComponent {
  private modalService = inject(ModalLib2Service);

  openModal() {
    this.modalService.open({
      popupComponent: TestModalContentComponent,
      data: { title: 'Modal Title' },
      isBackdropEnabled: true
    }).then(({ container, child }) => {
      if (child) {
        child.onClose = (result: any) => {
          console.log('Closed with:', result);
        };
      }

      container?.animationDone.subscribe(() => {
        console.log('Animation complete.');
      });

      //  auto-close example:
      setTimeout(() => {
        container?.closeWithData({ success: true });
      }, 5000);
    });
  }
}
```

### Notes

- popupComponent must be a standalone component.
- data passed via data: { ... } binds to @Input()s.
- close() and closeWithData() support manual modal control.
- Advanced control provided via .then(({ container, child }) => ...).

### Changelog Highlights (0.1.24)

- Renamed ModalServiceService → ModalLib2Service
- Fixed test coverage for Object.assign(...) based dynamic binding
- Improved injection and animation setup
- Tests now support shallow rendering of modal content




