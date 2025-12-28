import { signal } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ModalCloseReason = 'api' | 'esc' | 'backdrop';
export class ModalRef<TResult = unknown> {
    /**
     * internal-only close notifier
     * dont expose or depend on this directly
     * afterClosed is the public API
     */
    private readonly __closed$ = new Subject<TResult | undefined>();

    readonly afterClosed: Observable<TResult | undefined> = this.__closed$.asObservable();
    private readonly _isClosed = signal(false);
    constructor(private readonly _onClose: (reason: ModalCloseReason) => void) { }

    close(result?: TResult) {
        if (this._isClosed()) return;

        this._isClosed.set(true);
        this.__closed$.next(result);
        this.__closed$.complete();
        this._onClose('api');
    }
}
