import { TestBed } from '@angular/core/testing';
import { ApplicationRef, Component, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';
import { ModalRef } from './modal-ref';
import { BehaviorSubject } from 'rxjs';

//components
@Component({
  selector: 'obs-dialog',
  imports: [CommonModule],
  template: `<div class="count">{{ (count$ | async) ?? 'n/a' }}</div>`,
})
class ObsDialogComponent {
  count$ = new BehaviorSubject<number>(0);
}

@Component({
  selector: 'test-dialog',
  imports: [CommonModule],
  template: `<div class="dialog-body">{{ label }}</div>`,
})
class TestDialogComponent {
  label = 'default';
  constructor(public modalRef: ModalRef<{ ok: boolean }>) {}
}

//dom helpers
function getOverlayRoot(): HTMLElement | null {
  return document.querySelector('#ml2-overlay-root') as HTMLElement | null;
}

function query(selector: string): Element | null {
  return document.querySelector(selector);
}

function pressEsc() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

//browser tests
describe('ModalService (browser)', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    service = TestBed.inject(ModalService);
  });

  afterEach(() => {
    service.close();
    const root = getOverlayRoot();
    root?.parentElement?.removeChild(root);
    document.body.style.overflow = '';
  });

  function text(sel: string): string {
    return (document.querySelector(sel)?.textContent || '').trim();
  }

  it('updates when an Observable input emits (async pipe)', async () => {
    const subj = new BehaviorSubject<number>(1);
    const appRef = TestBed.inject(ApplicationRef);

    service.open<ObsDialogComponent, unknown>(
      ObsDialogComponent,
      { count$: subj } as Partial<ObsDialogComponent>
    );

    expect(text('.count')).toBe('1');
    subj.next(42);
    appRef.tick();
    await Promise.resolve();

    expect(text('.count')).toBe('42');
  });

  it('creates overlay root on first open', () => {
    expect(getOverlayRoot()).toBeNull();
    const { instance } =
      service.open<TestDialogComponent, unknown>(TestDialogComponent);
    expect(getOverlayRoot()).not.toBeNull();
    expect(instance).toBeTruthy();
  });

  it('passes data into child instance', () => {
    const { instance } =
      service.open<TestDialogComponent, unknown>(
        TestDialogComponent,
        { label: 'howdy' }
      );

    expect(instance!.label).toBe('howdy');
    expect(query('.dialog-body')!.textContent).toContain('howdy');
  });

  it('passes data object via data input (signal-friendly)', () => {
    const { instance } =
      service.open<TestDialogComponent, unknown>(
        TestDialogComponent,
        { data: { label: 'from-data' } } as any
      );

    expect(instance!.label).toBe('from-data');
  });

  it('injects ModalRef into child and emits afterClosed payload', (done) => {
    const { instance, ref } =
      service.open<TestDialogComponent, { ok: boolean }>(TestDialogComponent);

    ref.afterClosed.subscribe(res => {
      expect(res).toEqual({ ok: true });
      done();
    });

    instance!.modalRef.close({ ok: true });
  });

  it('honors replace policy (close previous before opening new)', () => {
    service.open<TestDialogComponent, unknown>(TestDialogComponent, { label: 'one' });
    expect(getOverlayRoot()).toBeTruthy();

    const second =
      service.open<TestDialogComponent, unknown>(TestDialogComponent, { label: 'two' });

    expect(second.instance!.label).toBe('two');
  });

  it('removes DOM on close()', () => {
    service.open<TestDialogComponent, unknown>(TestDialogComponent);
    expect(getOverlayRoot()).toBeTruthy();

    service.close();
    expect(getOverlayRoot()).toBeNull();
  });

  it('renders backdrop by default', () => {
    service.open<TestDialogComponent, unknown>(TestDialogComponent);
    expect(query('.ml2-overlay')).toBeTruthy();
  });

  it('omits backdrop when opts.backdrop === false', () => {
    service.open<TestDialogComponent, unknown>(
      TestDialogComponent,
      undefined,
      { backdrop: false }
    );
    expect(query('.ml2-overlay')).toBeNull();
  });

  it('closes modal on ESC by default', () => {
    service.open<TestDialogComponent, unknown>(TestDialogComponent);
    pressEsc();
    expect(getOverlayRoot()).toBeNull();
  });

  it('does not close modal on ESC when closeOnEsc is false', () => {
    service.open<TestDialogComponent, unknown>(
      TestDialogComponent,
      undefined,
      { closeOnEsc: false }
    );
    pressEsc();
    expect(getOverlayRoot()).toBeTruthy();
  });

  it('locks body scroll when lockScroll is true', () => {
    service.open<TestDialogComponent, unknown>(
      TestDialogComponent,
      undefined,
      { lockScroll: true }
    );

    expect(document.body.style.overflow).toBe('hidden');

    service.close();
    expect(document.body.style.overflow).toBe('');
  });

  it('does not lock body scroll when lockScroll is false', () => {
    service.open<TestDialogComponent, unknown>(
      TestDialogComponent,
      undefined,
      { lockScroll: false }
    );

    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('reuses a single overlay root across multiple opens (no duplicates)', () => {
    service.open<TestDialogComponent, unknown>(TestDialogComponent);
    expect(document.querySelectorAll('#ml2-overlay-root').length).toBe(1);

    service.open<TestDialogComponent, unknown>(TestDialogComponent);
    expect(document.querySelectorAll('#ml2-overlay-root').length).toBe(1);

    service.close();
    expect(getOverlayRoot()).toBeNull();
  });

  it('close() is idempotent (safe to call multiple times)', () => {
    service.open<TestDialogComponent, unknown>(TestDialogComponent);

    service.close();
    service.close();

    expect(getOverlayRoot()).toBeNull();
  });

  it('afterClosed emits once and completes', (done) => {
    const { instance, ref } =
      service.open<TestDialogComponent, { ok: boolean }>(TestDialogComponent);

    let count = 0;

    ref.afterClosed.subscribe({
      next: () => count++,
      complete: () => {
        expect(count).toBe(1);
        done();
      }
    });

    instance!.modalRef.close({ ok: true });
  });

  it('options do not leak between modal opens', () => {
    service.open<TestDialogComponent, unknown>(
      TestDialogComponent,
      undefined,
      { backdrop: false, closeOnEsc: false, lockScroll: true }
    );

    expect(query('.ml2-overlay')).toBeNull();
    expect(document.body.style.overflow).toBe('hidden');

    service.close();

    service.open<TestDialogComponent, unknown>(TestDialogComponent);

    expect(query('.ml2-overlay')).toBeTruthy();
    expect(document.body.style.overflow).toBe('');

    pressEsc();
    expect(getOverlayRoot()).toBeNull();
  });
});

//server tests
describe('ModalService (server)', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    service = TestBed.inject(ModalService);
  });

  it('queues open on server and does not touch DOM', () => {
    const { instance } =
      service.open<TestDialogComponent, unknown>(TestDialogComponent, { label: 'server' });

    expect(instance).toBeUndefined();
    expect(getOverlayRoot()).toBeNull();

    service.close();
    expect(getOverlayRoot()).toBeNull();
  });
});

describe('server close cancels pending', () => {
  let serverSvc: ModalService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
    serverSvc = TestBed.inject(ModalService);
  });

  it('does not open on client when pending was closed on server', () => {
    serverSvc.open<TestDialogComponent, unknown>(TestDialogComponent, { label: 'server' });
    serverSvc.close();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ModalService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    TestBed.inject(ModalService);
    expect(getOverlayRoot()).toBeNull();
  });
});


