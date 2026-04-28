import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
// ADDED doc and deleteDoc here
import { Firestore, collection, addDoc, query, orderBy, onSnapshot, doc, deleteDoc, getDocs } from '@angular/fire/firestore';
import * as XLSX from 'xlsx';

interface ScheduleEntry {
  id?: string;
  date: Date;
  dateStr: string;
  subject: string;
  startTime: string;
  endTime: string;
  fileName: string;
}

interface DateGroup {
  dateStr: string;
  date: Date;
  entries: ScheduleEntry[];
}

@Component({
  selector: 'app-schedule-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './schedule-viewer.html',
  styleUrls: ['./schedule-viewer.scss']
})
export class ScheduleViewerComponent {
  private firestore = inject(Firestore);
  private scheduleCollection = collection(this.firestore, 'schedules');

  allEntries = signal<ScheduleEntry[]>([]);
  searchDate = signal<string>('');

  constructor() {
    const scheduleQuery = query(this.scheduleCollection, orderBy('dateIso'));

    onSnapshot(scheduleQuery, (snapshot) => {
      const formatted = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // This ID is what allows us to delete it!
          ...data,
          date: new Date(data['dateIso']) 
        } as ScheduleEntry;
      });
      this.allEntries.set(formatted);
    });
  }

  groupedSchedule = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = this.allEntries().filter(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() >= today.getTime();
    });

    if (this.searchDate()) {
      filtered = filtered.filter(e => e.dateStr.includes(this.searchDate()));
    }

    const groups: { [key: string]: DateGroup } = {};
    filtered.forEach(entry => {
      if (!groups[entry.dateStr]) {
        groups[entry.dateStr] = { dateStr: entry.dateStr, date: entry.date, entries: [] };
      }
      groups[entry.dateStr].entries.push(entry);
    });

    return Object.values(groups)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(group => ({
        ...group,
        entries: group.entries.sort((a, b) => a.startTime.localeCompare(b.startTime))
      }));
  });

  async onFileUpload(event: any) {
    const files = event.target.files;
    if (!files.length) return;

    for (let file of files) {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 5) continue;

          const dateRaw = String(row[2] || '');
          if (dateRaw.includes('.')) {
            const parsedDate = this.parseHebrewExcelDate(dateRaw);
            
            await addDoc(this.scheduleCollection, {
              dateIso: parsedDate.toISOString(), 
              dateStr: dateRaw,
              subject: String(row[7] || 'אימון'),
              startTime: this.formatExcelTime(row[3]),
              endTime: this.formatExcelTime(row[4]),
              fileName: file.name
            });
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }

  // --- NEW DELETE FUNCTION ---
  async deleteEntry(entryId: string | undefined) {
    if (!entryId) return; // Safety check
    
    // Ask for confirmation before deleting
    if (confirm('האם אתה בטוח שברצונך למחוק אימון זה?')) {
      try {
        // Point directly to the specific document in Firebase and delete it
        const documentReference = doc(this.firestore, 'schedules', entryId);
        await deleteDoc(documentReference);
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  }
// --- NEW DELETE ALL FUNCTION ---
  async deleteAllSchedules() {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל האימונים? פעולה זו בלתי הפיכה.')) {
      try {
        // 1. Get all documents in the schedules collection
        const snapshot = await getDocs(this.scheduleCollection);
        
        // 2. Create a delete request for every single document
        const deletePromises = snapshot.docs.map(document => deleteDoc(document.ref));
        
        // 3. Execute all deletes at the same time
        await Promise.all(deletePromises);
        
      } catch (error) {
        console.error("Error deleting all sessions:", error);
      }
    }
  }
  private formatExcelTime(value: any): string {
    if (!value) return '';
    if (typeof value === 'string' && value.includes(':')) return value;
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private parseHebrewExcelDate(dateStr: string): Date {
    const parts = dateStr.split('.');
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
}