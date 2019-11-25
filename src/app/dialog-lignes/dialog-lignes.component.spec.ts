import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogLignesComponent } from './dialog-lignes.component';

describe('DialogLignesComponent', () => {
  let component: DialogLignesComponent;
  let fixture: ComponentFixture<DialogLignesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogLignesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogLignesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
