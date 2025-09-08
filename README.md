# modal-lib2

Lightweight, standalone Angular SSR-Safe modal system for Angular 17+.
A service-based API to open any standalone component as a modal.

✨ Features
- Angular 17+ standalone component support
- Simple ModalService.open() API
- Pass data into modal components via @Input()
- Strongly typed result via ModalRef.afterClosed
- Optional backdrop (opts.backdrop)
- Programmatic close support
- SSR-safe: queues on server, flushes on client

## Installation

```bash
npm install modal-lib2
```

---

## Quick Example
### Modal Content Component

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
    <p>Hello, {{username}}</p>
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

## Open From Anywhere

```ts
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
    const { ref, instance } = this.modal.open<LoginModalComponent, LoginResult>(
      LoginModalComponent,
      { username: 'Burt' },
      { backdrop: true }
    );

    ref.afterClosed.subscribe(result => {
      console.log('Closed with:', result);
    });

    console.log('Modal instance', instance);
  }
}
```

## API

### ModalService.open<T, TResult>(component, data?, opts?)
- component – standalone component to render inside modal
- data – partial object assigned to component’s @Input()s
- opts – { backdrop?: boolean } (default: true)

Returns:
```ts
{
  ref: ModalRef<TResult>,
  instance: T | undefined,
  close: () => void
}
```

### ModalRef<TResult>
- afterClosed: Observable<TResult | undefined>
- close(result?: TResult): void

## SSR NOTES
- On the server, open() queues the request without touching the DOM.
- On the client, it flushes once Angular is stable.
- If you call close() on the server before hydration, nothing is rendered.

## Changelog Highlights (1.0.0)
- New API: ModalService.open<T, TResult>()
- Strongly typed ModalRef<TResult>.afterClosed
- Removed host requirement (setModalHost)
- Optional backdrop (opts.backdrop)
- SSR-safe queuing








