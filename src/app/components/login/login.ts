import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  // Fields are now empty so you have to type them
  username = '';
  password = '';

  constructor(private dataService: DataService, private router: Router) {}

  onLogin() {
    // 1. Check for your "Principal" credentials
    if (this.username === 'iqraa_school' && this.password === '123456789') {
      this.dataService.userRole.set('principal');
      this.router.navigate(['/dashboard']);
    } 
    // 2. Allow "Student" login for any other input (or specific student credentials)
    else if (this.username.length > 0) {
      this.dataService.userRole.set('viewer');
      this.router.navigate(['/dashboard']);
    } 
    else {
      alert('Please enter a username');
    }
  }
}