import {inject} from '@angular/core';
import {
  CanActivateFn, CanMatchFn,
  Router, UrlTree
} from '@angular/router';
import {Location} from '@angular/common';

export const notLoginGuard: CanMatchFn|CanActivateFn = () => {
    
    
    const location = inject(Location);
    const router = inject(Router);
    const username = localStorage.getItem("username");
    if (username == null || username == "") {
        return true;
    }
    window.alert("请先退出登录");
    location.back()
    return false;
};