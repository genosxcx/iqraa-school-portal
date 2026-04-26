import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { ExcelTableComponent } from '../excel-table/excel-table';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ExcelTableComponent, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  public dataService = inject(DataService);
  activeMonthIndex: number = 0;

  /**
   * Automatically load data from Firebase when the page opens
   */
  ngOnInit() {
    this.dataService.loadFromCloud();
  }

  get activeMonth() {
    return this.dataService.schedules()[this.activeMonthIndex];
  }

  setActiveMonth(index: number) {
    this.activeMonthIndex = index;
  }

  addNewMonth() {
    const name = prompt('Enter Month Name (e.g., April 2026):');
    if (name && name.trim() !== '') {
      this.dataService.addMonth(name);
      // Switches to the new month; addMonth inside Service handles the saveToCloud()
      this.activeMonthIndex = this.dataService.schedules().length - 1;
    }
  }

  onFileChange(event: any, index: number) {
  const target: DataTransfer = <DataTransfer>(event.target);
  const reader = new FileReader();
  
  reader.onload = (e: any) => {
    const bstr = e.target.result;
    const wb = XLSX.read(bstr, { type: 'binary' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    
    // 1. Get raw rows (this gives us an array of arrays)
    const rawData: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    // 2. Remove the first row (the headers from Excel) so only data remains
    const dataOnly = rawData.slice(1);

    // 3. Update the signal
    this.dataService.schedules.update(months => {
      const updated = [...months];
      updated[index] = { ...updated[index], data: dataOnly };
      return updated;
    });
    
    this.dataService.saveToCloud();
    event.target.value = ''; 
  };
  reader.readAsBinaryString(target.files[0]);
}

  /**
   * Principal manually saves changes made to table cells
   */
  async syncWithCloud() {
    await this.dataService.saveToCloud();
    alert('Changes saved to the cloud!');
  }

  downloadExcel(index: number) {
    const month = this.dataService.schedules()[index];
    if (!month || month.data.length === 0) return;

    const ws = XLSX.utils.json_to_sheet(month.data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, month.monthName);
    XLSX.writeFile(wb, `${month.monthName}_Schedule.xlsx`);
  }
  // Inside DashboardComponent class
onAddRow(index: number) {
  this.dataService.addRow(index);
}
}