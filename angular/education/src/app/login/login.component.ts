import { Component } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(public router: Router) { }
  number: string = ''
  password: string = ''

  login(): void {
    console.log(this.number);

    if (this.number === 'admin' && this.password === '123456') {
      // sessionStorage.setItem('access_token', 'true')
      this.router.navigate(['/'])
     
    } 
  }

}
