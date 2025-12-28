# modal-lib2

A lightweight, standalone, SSR-safe modal system for Angular 17+.  
Provides a simple service-based API for rendering any standalone component as a modal.

Designed to be headless, predictable, and framework-aligned (Signals-friendly).

---

## Features

- Angular 17+ standalone component support
- Fully tested
- Simple `ModalService.open()` API
- Pass data into modal components via `@Input()`
- Signal-friendly data assignment (`{ data: ... }` supported)
- Strongly typed modal results via `ModalRef<TResult>`
- Optional backdrop
- Optional ESC-to-close behavior
- Optional body scroll locking
- Programmatic close support
- Idempotent cleanup (`close()` is safe to call multiple times)
- SSR-safe:
  - queues modal opens on the server
  - flushes automatically on the client once stable

---

## Installation

```bash
npm install modal-lib2
```

## Modal Content Component
```bash
import { Component, inject, Input } from '@angular/core';
import { ModalRef } from 'modal-lib2';

export interface LoginResult {
  success: boolean;
  token?: string;
}

@Component({
  selector: 'app-login-modal',
  standalone: true,
  template: `
    <h3>Login</h3>
    <p>Hello, {{ username }}</p>

    <button (click)="ok()">OK</button>
    <button (click)="cancel()">Cancel</button>
  `,
})
export class LoginModalComponent {
  @Input() username = '';

  private modalRef = inject<ModalRef<LoginResult>>(ModalRef);

  ok() {
    this.modalRef.close({ success: true, token: '123' });
  }

  cancel() {
    this.modalRef.close({ success: false });
  }
}
```

## Open Modal
```bash
import { Component, inject } from '@angular/core';
import { ModalService } from 'modal-lib2';
import { LoginModalComponent, LoginResult } from './login-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<button (click)="open()">Open Login</button>`,
})
export class AppComponent {
  private modal = inject(ModalService);

  open() {
    const { ref, instance } =
      this.modal.open<LoginModalComponent, LoginResult>(
        LoginModalComponent,
        { username: 'Burt' },
        {
          backdrop: true,
          closeOnEsc: true,
          lockScroll: true,
        }
      );

    ref.afterClosed.subscribe(result => {
      console.log('Modal closed with:', result);
    });

    console.log('Modal instance:', instance);
  }
}
```

## API

### ModalService.open\<T, TResult\>(component, data?, options?)

#### Parameters

**component**  
Standalone component to render inside the modal.

---

**data**  
Partial object assigned to the component instance.

Supports both styles:

```ts
{ username: 'burt' }
```
**signal friendly**
```ts
{ data: { stuff :{moreStuff:{hi:'there'}} } }
```

**options***
```ts
export type ModalOptions = {
  backdrop?: boolean;   // default: true
  closeOnEsc?: boolean; // default: true
  lockScroll?: boolean; // default: false
};
```
**retrun value**
```ts
{
  ref: ModalRef<TResult>;
  instance: T | undefined;
  close: () => void;
}

- instance is undefined when called on the server
- close() is always safe to call
```

## Modal T ref ##
```ts
class ModalRef<TResult> {
  afterClosed: Observable<TResult | undefined>;
  close(result?: TResult): void;
}
**note**
- afterClosed emits once and then completes
- close() is idempotent
- Calling close() multiple times has no additional effect
```

## SSR Behavior

### On the server

- `open()` queues the modal request
- No DOM access occurs

### On the client

- Queued modals render automatically once Angular becomes stable

### If `close()` is called on the server before hydration

- Nothing is rendered on the client

---

## Design Notes

- Modal options are **non-sticky**  
  Each `open()` call is evaluated independently.

- Defaults are explicit and predictable:
  - Scroll is not locked unless requested
  - ESC closing is opt-in per modal

- The library is intentionally **headless**:
  - No styles, animations, or layout opinions imposed

---

## Changelog Highlights (1.0.0)

- Service-based modal API (`ModalService.open`)
- Strongly typed modal results
- Signal-friendly data handling
- ESC, backdrop, and scroll-lock options
- Idempotent cleanup and leak-free lifecycle
- Fully SSR-safe behavior

