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
  
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    this.http.post(this.url, 
        {
          username:"123", 
         
        }, httpOptions)
      .subscribe((response:any) => { 
        if(response.code == 400) {
          window.alert(response.message); 
        }
        else {
          if(response.code == 200) {
            window.alert(response.message); 
            this.router.navigate(['/home'])
          }
        }
      });
}
}
