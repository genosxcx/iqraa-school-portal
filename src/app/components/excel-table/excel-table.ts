import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-excel-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-container">
      @if (rows.length > 0) {
        <table class="calendar-grid">
          <thead>
            <tr>
              @for (day of MASTER_DAYS; track day; let i = $index) {
                <th (click)="setStartDay(i)" [class.clickable]="dataService.isPrincipal()">
                  <div class="header-content">
                    <span class="day-name">{{ day }}</span>
                    @if (dataService.isPrincipal()) {
                      <span class="set-hint">Set 1st</span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track $index; let ri = $index) {
              @let anyRow = $any(row);
              <tr>
                @for (day of MASTER_DAYS; track $index; let ci = $index) {
                  <td [class.has-num]="getDayNumber(ri, ci)">
                    @let dayNum = getDayNumber(ri, ci);
                    @if (dayNum) {
                      <span class="day-number">{{ dayNum }}</span>
                    }

                    @let actualKey = findKeyForDay(anyRow, day);
                    
                    @if (dataService.isPrincipal()) {
                      <textarea 
                        [(ngModel)]="anyRow[actualKey]" 
                        class="cell-editor"
                        (ngModelChange)="onUpdate()"
                        placeholder="...">
                      </textarea>
                    } @else {
                      <div class="cell-viewer">{{ anyRow[actualKey] }}</div>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      } @else {
        <div class="empty-placeholder">No data available. Upload Excel or add a month.</div>
      }
    </div>
  `,
  styles: [`
    .table-container { 
      overflow-x: auto; 
      direction: rtl; 
      border-radius: 12px; 
      background: white; 
      border: 1px solid #e5e7eb; 
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    
    .calendar-grid { width: 100%; border-collapse: collapse; table-layout: fixed; min-width: 1000px; }
    
    th { 
      background: #5e35b1; 
      color: white; 
      padding: 12px; 
      border: 1px solid #4527a0; 
      transition: background 0.2s;
    }

    th.clickable { cursor: pointer; }
    th.clickable:hover { background: #4b2c8d; }

    .header-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .day-name { font-size: 1.1rem; font-weight: bold; }
    .set-hint { font-size: 0.6rem; opacity: 0.7; font-weight: normal; }

    td { 
      border: 1px solid #f1f5f9; 
      height: 140px; 
      vertical-align: top; 
      position: relative; // Crucial for positioning day number
    }

    /* Day number in the top-left corner (RTL) */
    .day-number {
      position: absolute;
      top: 6px;
      left: 8px;
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: bold;
      pointer-events: none;
    }

    .cell-editor { 
      width: 100%; 
      height: 100%; 
      border: none; 
      padding: 25px 12px 12px 12px; // Extra top padding so text doesn't overlap number
      text-align: right; 
      resize: none; 
      font-size: 0.95rem; 
      background: transparent; 
      color: #1e293b; 
      font-family: inherit; 
    }

    .cell-editor:focus { background: #f8fafc; outline: none; }

    .cell-viewer { 
      padding: 25px 12px 12px 12px; 
      text-align: right; 
      font-weight: 600; 
      white-space: pre-wrap; 
      font-size: 0.95rem; 
      color: #334155; 
      line-height: 1.5; 
    }

    /* Weekend Column Backgrounds (Friday/Saturday) */
    td:nth-child(6), td:nth-child(7) { background: #fffcf0; }

    .empty-placeholder { padding: 50px; text-align: center; color: #94a3b8; font-style: italic; }
  `]
})
export class ExcelTableComponent {
  public dataService = inject(DataService);
  monthIndex = input.required<number>();

  readonly MASTER_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  get rows() {
    return this.dataService.schedules()[this.monthIndex()]?.data || [];
  }

  /**
   * Calculates the number 1-31 for each cell
   */
  getDayNumber(rowIndex: number, colIndex: number): number | null {
    const startDay = this.dataService.schedules()[this.monthIndex()]?.startDayIndex || 0;
    const dayNum = (rowIndex * 7) + colIndex - startDay + 1;
    
    // Limits numbering to a standard month length
    if (dayNum > 0 && dayNum <= 31) {
      return dayNum;
    }
    return null;
  }

  /**
   * Principal sets the first day of the month
   */
  setStartDay(dayIndex: number) {
    if (this.dataService.isPrincipal()) {
      this.dataService.updateStartDay(this.monthIndex(), dayIndex);
    }
  }

  findKeyForDay(row: any, day: string): string {
    if (!row) return day;
    const keys = Object.keys(row);
    const match = keys.find(k => k.trim().startsWith(day));
    return match || day;
  }

  onUpdate() {
    this.dataService.schedules.update(s => [...s]);
  }
}