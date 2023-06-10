import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { Router } from '@angular/router';
import { BackErrorHandler } from '../http-interceptors/back-error-handler';
import { catchError } from 'rxjs';
import { Global } from '../global';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [{provide: BackErrorHandler}]
})
export class RegisterComponent {

  constructor(public http:HttpClient, private router: Router, private handler:BackErrorHandler) { }
  
  registerForm = new FormGroup({
    // Setting Validation Controls
    username: new FormControl('', 
      [Validators.required,
       Validators.maxLength(50),
       Validators.pattern('^[A-Za-z\\d$@$!%*?&_]*$')]),
    email: new FormControl('', [Validators.email]),
    password: new FormControl('', 
      [Validators.required,
       Validators.minLength(8),
       Validators.maxLength(50),
       Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z\\d$@$!%*?&]*$')]),
    passwordCheck: new FormControl('',
      [Validators.required,
       this.PasswordValidator("password")]),
      
  })

  getErrorUsername() {
    if (this.registerForm.get("username")?.hasError('required')) {
      return '请输入用户名';
    }
    if (this.registerForm.get("username")?.hasError('maxlength')) {
      return '用户名至多50个字符';
    }
    if (this.registerForm.get("username")?.hasError('pattern')) {
      return '用户名只能包含字母和数字和特殊字符';
    }
    return ''
  }
  getErrorPassword() {
    if (this.registerForm.get("password")?.hasError('required')) {
      return '请输入密码';
    }
    if (this.registerForm.get("password")?.hasError('minlength')) {
      return '密码至少为8位';
    }
    if (this.registerForm.get("password")?.hasError('maxlength')) {
      return '密码至多为50位';
    }
    if (this.registerForm.get("password")?.hasError('pattern')) {
      return '密码需包含字母和数字,不能有中文';
    }
    return ''
  }
  getErrorPasswordCheck() {
    if (this.registerForm.get("passwordCheck")?.hasError('required')) {
      return '请确认密码';
    }
    if (this.registerForm.get("passwordCheck")?.hasError('notMatch')) {
      return '密码不一致';
    }
    return ''
  }

  PasswordValidator(confirmPasswordInput: string) {
    let confirmPasswordControl: FormControl;
    let passwordControl: FormControl;
    return (control: FormControl): { [key: string]: boolean } | null => {
      if (!control.parent) {
        return null;
      }
      if (!confirmPasswordControl) {
        confirmPasswordControl = control;
        passwordControl = control.parent.get(confirmPasswordInput) as FormControl;
        passwordControl.valueChanges.subscribe(() => {
          confirmPasswordControl.updateValueAndValidity();
        });
      }
      if (passwordControl.value !== confirmPasswordControl.value) {
        return {
          notMatch: true
        };
      }
      return null;
    };
  }

  private url = Global.backURL + "/register";
  register(): void {
    if (this.registerForm.invalid) {
      return;
    }
    // console.log(this.registerForm.value.username);
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    this.http.post(this.url, 
        {username:this.registerForm.value.username, 
        password:this.registerForm.value.password, 
        email: this.registerForm.value.email}, httpOptions)
      .pipe(catchError(this.handler.handleError))
      .subscribe((response:any) => { 
        if(response.code == 400) {
          window.alert(response.message); 
        }
        else {
          if(response.code == 200) {
            window.alert(response.message); 
            this.router.navigate(['/login'])
          }
        }
      });
  }

}
