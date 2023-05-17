import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {
  constructor(public http:HttpClient, public router: Router) { }

  private url = "http://localhost:8080/logout";
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("username"); 
    this.router.navigate(['/login'])
 
  }
}
