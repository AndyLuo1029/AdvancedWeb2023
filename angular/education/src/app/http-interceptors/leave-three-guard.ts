import {inject} from '@angular/core';
import {
  CanDeactivateFn, CanMatchFn,
  Router, UrlTree
} from '@angular/router';
import { ThreeJsComponent } from '../three-js/three-js.component';
import { of } from 'rxjs';


export const leaveThreeGuard: CanDeactivateFn<ThreeJsComponent> = () => {

//   const router = inject(Router);
  const confirmation =  window.confirm('确定要退出吗，未保存记录会丢失?');

  return of(confirmation);
};