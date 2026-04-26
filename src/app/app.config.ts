import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

// Firebase Imports
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics'; // Fixed analytics import

const firebaseConfig = {
  apiKey: "AIzaSyDfs7Ox0UHO2KJWyr-ptUQEvG_RB42MjNg",
  authDomain: "iqraaschoolportal.firebaseapp.com",
  projectId: "iqraaschoolportal",
  storageBucket: "iqraaschoolportal.firebasestorage.app",
  messagingSenderId: "431496329190",
  appId: "1:431496329190:web:39d3dd78bcd5afa1840827",
  measurementId: "G-0Z6MCXNFR3"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // Use the AngularFire providers for everything
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()) // This is the "Angular way" for analytics
  ]
};