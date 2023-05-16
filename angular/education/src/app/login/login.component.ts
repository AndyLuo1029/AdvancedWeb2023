import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {HttpClient, HttpHeaders} from "@angular/common/http";
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(public http:HttpClient, public router: Router) { }
  // number: string = ''
  // password: string = ''

  loginForm = new FormGroup({
    // Setting Validation Controls
    number: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  private url = "http://localhost:8080/login";
  login(): void {
    if (this.loginForm.invalid) {
  
      return;
    }
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    this.http.post(this.url, 
        {
          username:this.loginForm.value.number, 
          password:this.loginForm.value.password, 
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

    // if (this.number === 'admin' && this.password === '123456') {
    //   // sessionStorage.setItem('access_token', 'true')
    //   this.router.navigate(['/'])
     
    // } 
  }

}
