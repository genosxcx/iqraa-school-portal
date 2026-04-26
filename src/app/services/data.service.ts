import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

export interface MonthlySchedule {
  monthName: string;
  data: any[];
  startDayIndex?: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private firestore = inject(Firestore);
  
  // Sticky Login: Check localStorage on startup
  userRole = signal<'principal' | 'viewer'>(
    (localStorage.getItem('school_user_role') as 'principal' | 'viewer') || 'viewer'
  );

  isPrincipal = computed(() => this.userRole() === 'principal');
  schedules = signal<MonthlySchedule[]>([]);

  constructor() {
    // Automatically save role to localStorage whenever it changes
    effect(() => {
      localStorage.setItem('school_user_role', this.userRole());
    });
  }

  async loadFromCloud() {
    try {
      const docRef = doc(this.firestore, 'schoolData', 'calendar');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.schedules.set(docSnap.data()['schedules'] || []);
      }
    } catch (err) { console.error(err); }
  }

  async saveToCloud() {
    const cleanData = JSON.parse(JSON.stringify(this.schedules()));
    try {
      const docRef = doc(this.firestore, 'schoolData', 'calendar');
      await setDoc(docRef, { schedules: cleanData });
    } catch (err) { console.error(err); }
  }

  addMonth(name: string) {
  const blankWeeks = Array(5).fill(null).map(() => ({
    'א': '', 'ב': '', 'ג': '', 'ד': '', 'ה': '', 'ו': '', 'ש': ''
  }));

  this.schedules.update(prev => [...prev, { 
    monthName: name, 
    data: blankWeeks, 
    startDayIndex: 0 // Default to Sunday
  }]);
  this.saveToCloud();
}

  addRow(monthIndex: number) {
    this.schedules.update(months => {
      const updated = [...months];
      const newWeek = { 'א': '', 'ב': '', 'ג': '', 'ד': '', 'ה': '', 'ו': '', 'ש': '' };
      updated[monthIndex].data.push(newWeek);
      return updated;
    });
    this.saveToCloud();
  }

  removeMonth(index: number) {
    this.schedules.update(prev => prev.filter((_, i) => i !== index));
    this.saveToCloud();
  }

  clearSession() {
    this.userRole.set('viewer');
    localStorage.removeItem('school_user_role');
  }
  updateStartDay(monthIndex: number, dayIndex: number) {
  this.schedules.update(months => {
    const updated = [...months];
    updated[monthIndex].startDayIndex = dayIndex;
    return updated;
  });
  this.saveToCloud();
}
}
