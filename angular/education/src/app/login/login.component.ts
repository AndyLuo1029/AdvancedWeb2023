import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(public router: Router) { }
  // number: string = ''
  // password: string = ''

  loginForm = new FormGroup({
    // Setting Validation Controls
    number: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  })

  login(): void {
    if (this.loginForm.invalid) {
  
      return;
    }
    console.log(this.loginForm.value.number);

    // if (this.number === 'admin' && this.password === '123456') {
    //   // sessionStorage.setItem('access_token', 'true')
    //   this.router.navigate(['/'])
     
    // } 
  }

}
