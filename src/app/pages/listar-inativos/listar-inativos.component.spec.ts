import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarInativosComponent } from './listar-inativos.component';

describe('ListarInativosComponent', () => {
  let component: ListarInativosComponent;
  let fixture: ComponentFixture<ListarInativosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarInativosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarInativosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
