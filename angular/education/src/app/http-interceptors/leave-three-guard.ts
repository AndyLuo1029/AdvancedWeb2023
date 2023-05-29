import {inject} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivateFn, CanMatchFn,
  Router, UrlTree
} from '@angular/router';
import { ThreeJsComponent } from '../three-js/three-js.component';
import { of } from 'rxjs';
import {Location, LocationStrategy} from '@angular/common';

export const leaveThreeGuard: CanDeactivateFn<ThreeJsComponent> = (
  component: ThreeJsComponent,
  route: ActivatedRouteSnapshot,
) => {
  const router = inject(Router);
  const location = inject(LocationStrategy)
  // const history = inject(History)
  // console.log(component.finish)
  if(component.finish == 1) return true;
  // if(route.queryParamMap.get('finish') == "1") return true;
//   const router = inject(Router);
  let confirmation =  window.confirm('确定要退出吗，未保存记录会丢失?');
  // location.replaceState('/select');
  let back:boolean = false;
  
  of(confirmation).subscribe((flag) => {
    if(flag) {
      history.pushState(null, "null", window.location.href);
      location.onPopState(() => {
        history.pushState(null, "null", window.location.href);
      });  
      back = true
    } else {
      back = false
    }
    
  })

  return back;
};