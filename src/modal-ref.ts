import { Subject, Observable } from 'rxjs';

export type ModalCloseReason = 'api' | 'esc' | 'backdrop';
export class ModalRef<TResult = unknown> {
    private readonly _closed$ = new Subject<TResult | undefined>();
    readonly afterClosed: Observable<TResult | undefined> = this._closed$.asObservable();

    constructor(private readonly _onClose: (reason: ModalCloseReason) => void) { }

    close(result?: TResult) {
        this._closed$.next(result);
        this._closed$.complete();
        this._onClose('api');
    }
}