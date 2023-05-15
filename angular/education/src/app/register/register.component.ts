import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm = new FormGroup({
    // Setting Validation Controls
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.email]),
    password: new FormControl('', 
      [Validators.required,
       Validators.minLength(8)]),
    passwordCheck: new FormControl('',
      [Validators.required,
       this.PasswordValidator("password")]),
      
  })

  getErrorUsername() {
    if (this.registerForm.get("username")?.hasError('required')) {
      return '请输入用户名';
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

  register(): void {
    if (this.registerForm.invalid) {
  
      return;
    }
    console.log(this.registerForm.value.username);

    // if (this.number === 'admin' && this.password === '123456') {
    //   // sessionStorage.setItem('access_token', 'true')
    //   this.router.navigate(['/'])
     
    // } 
  }

}
