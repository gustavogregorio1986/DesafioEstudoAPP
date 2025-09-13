import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPendentesComponent } from './listar-pendentes.component';

describe('ListarPendentesComponent', () => {
  let component: ListarPendentesComponent;
  let fixture: ComponentFixture<ListarPendentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarPendentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarPendentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
