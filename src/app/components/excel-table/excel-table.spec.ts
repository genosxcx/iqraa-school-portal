import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExcelTableComponent } from './excel-table';

describe('ExcelTable', () => {
  let component: ExcelTableComponent;
  let fixture: ComponentFixture<ExcelTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcelTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExcelTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
