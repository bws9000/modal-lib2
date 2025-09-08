import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { Ml2ContainerComponent } from './ml2-container.component';

@Component({
    selector: 'host',
    imports: [Ml2ContainerComponent],
    template: `<ml2-container [showBackdrop]="show" (backdropClick)="clicked=true">
               <ng-template #vc></ng-template>
             </ml2-container>`
})
class HostComponent {
    show = true;
    clicked = false;
    @ViewChild(Ml2ContainerComponent, { static: true })
    container!: Ml2ContainerComponent;
}

function query(el: Element, selector: string): Element | null {
    return el.querySelector(selector);
}

describe('Ml2ContainerComponent', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HostComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    it('renders overlay when showBackdrop=true', () => {
        const overlay = query(fixture.nativeElement, '.ml2-overlay');
        expect(overlay).toBeTruthy();
    });

    it('hides overlay when showBackdrop=false', () => {
        fixture.componentInstance.show = false;
        fixture.detectChanges();
        const overlay = query(fixture.nativeElement, '.ml2-overlay');
        expect(overlay).toBeNull();
    });

    it('emits backdropClick on overlay click', () => {
        fixture.componentInstance.show = true;
        fixture.detectChanges();
        const overlay = query(fixture.nativeElement, '.ml2-overlay') as HTMLElement;
        overlay.click();
        fixture.detectChanges();
        //expect(fixture.componentInstance.clicked).toBeTrue();
        expect(fixture.componentInstance.clicked).toBe(true);
    });
});
