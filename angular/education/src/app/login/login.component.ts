import { Component, ErrorHandler } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError } from 'rxjs';
import { BackErrorHandler } from '../http-interceptors/back-error-handler'
import { Global } from '../global';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [{provide: BackErrorHandler}]
})
export class LoginComponent {

  constructor(public http:HttpClient, public router: Router, private handler:BackErrorHandler) { }
  // number: string = ''
  // password: string = ''

  loginForm = new FormGroup({
    // Setting Validation Controls
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  private url = Global.backURL+"/login";
  login(): void {
    if (this.loginForm.invalid) {
  
      return;
    }
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    this.http.post(this.url, 
        {
          username:this.loginForm.value.username, 
          password:this.loginForm.value.password, 
        }, httpOptions)
      .pipe(catchError(this.handler.handleError))
      .subscribe((response:any) => { 
        if(response.code == 400) {
          window.alert(response.message); 
        }
        else {
          if(response.code == 200) {
            window.alert(response.message); 
            localStorage.setItem("token", response.token);
            localStorage.setItem("username", response.username);
            localStorage.setItem("inGame", "0");
            this.router.navigate(['/home']);
          }
        }
      });
  }

}
