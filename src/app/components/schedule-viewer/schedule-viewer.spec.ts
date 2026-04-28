import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleViewerComponent } from './schedule-viewer';

describe('ScheduleViewer', () => {
  let component: ScheduleViewerComponent;
  let fixture: ComponentFixture<ScheduleViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleViewerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
