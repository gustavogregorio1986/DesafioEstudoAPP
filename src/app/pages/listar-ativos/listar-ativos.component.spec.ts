import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarAtivosComponent } from './listar-ativos.component';

describe('ListarAtivosComponent', () => {
  let component: ListarAtivosComponent;
  let fixture: ComponentFixture<ListarAtivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarAtivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarAtivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
