import { TestBed } from '@angular/core/testing';
import { ApplicationRef, Component, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from './modal.service';
import { ModalRef } from './modal-ref';


import { BehaviorSubject } from 'rxjs';
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
    template: `<div class="dialog-body">{{label}}</div>`,
})
class TestDialogComponent {
    label = 'default';
    constructor(public modalRef: ModalRef<{ ok: boolean }>) { }
}

function getOverlayRoot(): HTMLElement | null {
    return document.querySelector('#ml2-overlay-root') as HTMLElement | null;
}
function query(selector: string): Element | null {
    return document.querySelector(selector);
}

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
        service.close();
    });


    it('creates overlay root on first open', () => {
        expect(getOverlayRoot()).toBeNull();
        const { instance } = service.open<TestDialogComponent, unknown>(TestDialogComponent);
        expect(getOverlayRoot()).not.toBeNull();
        expect(instance).toBeTruthy();
    });

    it('passes data into child instance', () => {
        const { instance } = service.open<TestDialogComponent, unknown>(
            TestDialogComponent,
            { label: 'howdy' }
        );
        expect(instance!.label).toBe('howdy');
        expect(query('.dialog-body')!.textContent).toContain('howdy');
    });

    it('injects ModalRef into child and emits afterClosed payload', (done) => {
        const { ref, instance } = service.open<TestDialogComponent, { ok: boolean }>(TestDialogComponent);
        expect(instance!.modalRef).toBeTruthy();
        ref.afterClosed.subscribe((res) => {
            expect(res).toEqual({ ok: true });
            done();
        });
        instance!.modalRef.close({ ok: true });
    });

    it('honors replace policy (close previous before opening new)', () => {
        const first = service.open<TestDialogComponent, unknown>(TestDialogComponent, { label: 'one' });
        const rootBefore = getOverlayRoot();
        expect(rootBefore).toBeTruthy();
        const second = service.open<TestDialogComponent, unknown>(TestDialogComponent, { label: 'two' });
        const rootAfter = getOverlayRoot();
        expect(rootAfter).toBeTruthy();
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
        service.open<TestDialogComponent, unknown>(TestDialogComponent, undefined, { backdrop: false });
        expect(query('.ml2-overlay')).toBeNull();
    });


    function getOverlayRoot(): HTMLElement | null {
        return document.querySelector('#ml2-overlay-root');
    }
    function getOverlayRootCount(): number {
        return document.querySelectorAll('#ml2-overlay-root').length;
    }

    it('reuses a single overlay root across multiple opens (no duplicates)', () => {
        service.open<TestDialogComponent, unknown>(TestDialogComponent);
        expect(getOverlayRootCount()).toBe(1);
        const firstRoot = getOverlayRoot();
        expect(firstRoot).toBeTruthy();


        service.open<TestDialogComponent, unknown>(TestDialogComponent);
        expect(getOverlayRootCount()).toBe(1);
        const secondRoot = getOverlayRoot();
        expect(secondRoot).toBeTruthy();
        service.close();
        expect(getOverlayRoot()).toBeNull();
    });

});

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
        const { instance } = service.open<TestDialogComponent, unknown>(TestDialogComponent, { label: 'server' });
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
        const clientSvc = TestBed.inject(ModalService);
        expect(getOverlayRoot()).toBeNull();
    });
});
