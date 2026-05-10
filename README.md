# modal-lib2

A lightweight, standalone, SSR-safe modal system for Angular 17+.

`modal-lib2` provides a simple service-based API for rendering any standalone Angular component as a modal.

Designed to be:
- headless
- predictable
- Signals-friendly
- Angular-aligned
- SSR-safe

---

## Live Demo

- Angular 21 StackBlitz Demo: https://stackblitz.com/edit/stackblitz-starters-hc7sjvnm?file=src%2Fmain.ts

---

## Features

- Angular 17+ standalone component support
- Angular 21 compatible
- Simple `ModalService.open()` API
- Pass data into modal components via `@Input()`
- Signal-friendly data assignment support
- Strongly typed modal results via `ModalRef<TResult>`
- Optional backdrop support
- Optional ESC-to-close behavior
- Optional body scroll locking
- Programmatic close support
- Idempotent cleanup (`close()` is safe to call multiple times)
- SSR-safe design
- Avoids DOM access during server rendering
- Headless by design (bring your own styles/UI)

---

## Installation

```bash
npm install modal-lib2
```

---

# Basic Usage

## Modal Content Component

```ts
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

  private modalRef =
    inject<ModalRef<LoginResult>>(ModalRef);

  ok() {
    this.modalRef.close({
      success: true,
      token: '123'
    });
  }

  cancel() {
    this.modalRef.close({
      success: false
    });
  }
}
```

---

## Open Modal

```ts
import { Component, inject } from '@angular/core';
import { ModalService } from 'modal-lib2';

import {
  LoginModalComponent,
  LoginResult
} from './login-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <button (click)="open()">
      Open Login
    </button>
  `,
})
export class AppComponent {

  private modal = inject(ModalService);

  open() {

    const { ref, instance } =
      this.modal.open<LoginModalComponent, LoginResult>(
        LoginModalComponent,
        {
          username: 'Burt'
        },
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

---

# API

## ModalService.open\<T, TResult\>()

```ts
open<T, TResult>(
  component: Type<T>,
  data?: Partial<T>,
  options?: ModalOptions
)
```

---

## Parameters

### `component`

Standalone Angular component to render inside the modal.

---

### `data`

Partial object assigned to the component instance.

Supports standard assignment:

```ts
{
  username: 'burt'
}
```

Supports signal-friendly nested structures:

```ts
{
  data: {
    stuff: {
      moreStuff: {
        hi: 'there'
      }
    }
  }
}
```

---

### `options`

```ts
export type ModalOptions = {
  backdrop?: boolean;
  closeOnEsc?: boolean;
  lockScroll?: boolean;
};
```

| Option | Default |
|---|---|
| backdrop | `true` |
| closeOnEsc | `true` |
| lockScroll | `false` |

---

## Return Value

```ts
{
  ref: ModalRef<TResult>;
  instance: T | undefined;
  close: () => void;
}
```

### Notes

- `instance` is `undefined` during SSR/server rendering
- `close()` is always safe to call

---

# ModalRef

```ts
class ModalRef<TResult> {

  afterClosed:
    Observable<TResult | undefined>;

  close(result?: TResult): void;
}
```

### Notes

- `afterClosed` emits once and completes
- `close()` is idempotent
- Calling `close()` multiple times has no additional effect

---

# SSR Notes

`modal-lib2` avoids direct DOM access during server rendering
and is designed to work safely in Angular SSR environments.

Modal rendering occurs only in browser environments.

---

# Design Notes

- Modal options are non-sticky
- Each `open()` call is evaluated independently
- Scroll locking is opt-in
- ESC closing is configurable per modal
- Layout/styling is intentionally left to consumers

The library owns:
- overlay lifecycle
- centering
- stacking
- viewport behavior
- cleanup
- SSR safety

Consumers own:
- modal appearance
- animations
- themes
- internal layout/UI

---

# Changelog Highlights

## 1.1.0

- Angular 21 compatibility
- Improved modal container positioning/layering
- Updated packaging/type definitions
- Public StackBlitz demo added

## 1.0.0

- Service-based modal API
- Strongly typed modal results
- Signal-friendly data handling
- ESC, backdrop, and scroll-lock options
- Idempotent cleanup behavior
- SSR-safe design
