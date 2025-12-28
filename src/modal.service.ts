import {
    ApplicationRef,
    EnvironmentInjector,
    Injectable,
    Type,
    createComponent,
    inject,
    PLATFORM_ID,
    Injector,
    signal,
    EffectRef,
    effect,
    runInInjectionContext,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { filter, take } from 'rxjs/operators';
import { Ml2ContainerComponent } from './public-api';
import { ModalRef } from './modal-ref';

export type ModalOptions = {
    backdrop?: boolean;
    closeOnEsc?: boolean;
    lockScroll?: boolean;
};

type PendingOpen = {
    component: Type<any>;
    data?: any;
    ref: ModalRef<any>;
    opts?: ModalOptions;
};

@Injectable({ providedIn: 'root' })
export class ModalService {
    // private currentOpts: {
    //     backdrop?: boolean;
    //     closeOnEsc?: boolean;
    //     lockScroll?: boolean;
    // } | null = null;

    private escListener?: (e: KeyboardEvent) => void;
    private scrollLocked = false;
    private backdropEffect: EffectRef | null = null;
    private overlayRootEl: HTMLElement | null = null;
    private containerRef: ReturnType<typeof createComponent<Ml2ContainerComponent>> | null = null;
    private childRef: any | null = null;
    private readonly _isOpen = signal(false);
    private readonly platformId = inject(PLATFORM_ID);
    private get isBrowser() { return isPlatformBrowser(this.platformId); }
    private pending: PendingOpen | null = null;
    private flushedOnce = false;

    constructor(
        private appRef: ApplicationRef,
        private envInjector: EnvironmentInjector
    ) {
        if (this.isBrowser) {
            this.appRef.isStable.pipe(filter(Boolean), take(1)).subscribe(() => {
                if (!this.flushedOnce && this.pending) {
                    const { component, data, ref, opts } = this.pending;
                    this.pending = null;
                    this.flushedOnce = true;
                    this._openBrowser(component as any, data, ref, opts);
                }
            });
        }
    }


    open<T, TResult = unknown>(
        component: Type<T>,
        data?: Partial<T>,
        opts?: ModalOptions
    ): { ref: ModalRef<TResult>; instance: T | undefined; close: () => void } {
        //this.currentOpts = opts ?? null;
        this.close();
        this._isOpen.set(true);

        const ref = new ModalRef<TResult>(() => this.close());

        if (!this.isBrowser) {
            this.pending = { component, data, ref, opts };
            return { ref, instance: undefined, close: () => { } };
        }

        const instance = this._openBrowser(component, data, ref, opts);
        return { ref, instance, close: () => this.close() };
    }

    private _openBrowser<T, TResult>(
        component: Type<T>,
        data: Partial<T> | undefined,
        ref: ModalRef<TResult>,
        opts?: ModalOptions
    ): T {
        this.ensureOverlayRoot();

        this.containerRef = createComponent(Ml2ContainerComponent, {
            environmentInjector: this.envInjector,
        });

        // lock scroll
        const lockScroll = opts?.lockScroll === true;

        if (lockScroll && !this.scrollLocked) {
            document.body.style.overflow = 'hidden';
            this.scrollLocked = true;
        }

        // close handling
        this.detachEscListener();

        const closeOnEsc = opts?.closeOnEsc !== false;
        const closeOnBackdrop = opts?.backdrop !== false;

        // container inputs
        if (this.containerRef.setInput) {
            this.containerRef.setInput('showBackdrop', closeOnBackdrop);
        }

        // single effect that respects options
        this.backdropEffect?.destroy();
        this.backdropEffect = runInInjectionContext(this.envInjector, () =>
            effect(() => {
                const inst = this.containerRef?.instance;
                if (!inst) return;

                if (closeOnBackdrop && inst.backdropClicked()) {
                    this.close();
                }

                if (closeOnEsc && inst.escPressed()) {
                    this.close();
                }
            })
        );


        this.appRef.attachView(this.containerRef.hostView);

        const hostEl = this.containerRef.location.nativeElement as HTMLElement;
        this.overlayRootEl!.appendChild(hostEl);

        this.containerRef.changeDetectorRef.detectChanges();

        const vc = this.containerRef.instance.vcTpl;

        const injector = Injector.create({
            providers: [{ provide: ModalRef, useValue: ref }],
            parent: this.envInjector,
        });

        this.childRef = vc.createComponent(component, {
            environmentInjector: this.envInjector,
            injector,
        });

        if (data) {
            //signal-friendly
            if ('data' in data && typeof (data as any).data === 'object') {
                Object.assign(this.childRef.instance as object, (data as any).data);
            } else {
                //old
                Object.assign(this.childRef.instance as object, data);
            }
        }

        this.childRef.changeDetectorRef.detectChanges();
        return this.childRef.instance as T;
    }

    close(): void {
        this.backdropEffect?.destroy();
        this.backdropEffect = null;

        const wasOpen = this._isOpen();
        if (this.childRef) {
            try { this.childRef.destroy(); } catch { }
            this.childRef = null;
        }

        if (this.containerRef) {
            try {
                const el = this.containerRef.location.nativeElement as HTMLElement;
                this.appRef.detachView(this.containerRef.hostView);
                this.containerRef.destroy();
                el?.parentElement?.removeChild(el);
            } catch { }
            this.containerRef = null;
        }

        if (this.overlayRootEl && this.overlayRootEl.childElementCount === 0) {
            this.overlayRootEl.parentElement?.removeChild(this.overlayRootEl);
            this.overlayRootEl = null;
        }

        //cleanups
        this.pending = null;
        if (wasOpen) {
            this._isOpen.set(false);
        }
        if (this.scrollLocked) {
            document.body.style.overflow = '';
            this.scrollLocked = false;
        }
        //this.currentOpts = null;
        this.detachEscListener();

    }

    private detachEscListener() {
        if (this.escListener) {
            document.removeEventListener('keydown', this.escListener);
            this.escListener = undefined;
        }
    }


    private ensureOverlayRoot(): void {
        if (this.overlayRootEl) return;
        const root = document.createElement('div');
        root.id = 'ml2-overlay-root';
        root.style.position = 'fixed';
        root.style.inset = '0';
        root.style.zIndex = '1050';
        document.body.appendChild(root);
        this.overlayRootEl = root;
    }
}