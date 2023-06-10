import {inject} from '@angular/core';
import {
  CanActivateFn, CanMatchFn,
  Router, UrlTree
} from '@angular/router';


export const loginGuard: CanMatchFn|CanActivateFn = () => {
  const router = inject(Router);
  const username = localStorage.getItem("username");
  if (username != null && username != "") {
    return true;
  }
  window.alert("尚未登录")
  // Redirect to the login page
  return router.parseUrl('/login');
};