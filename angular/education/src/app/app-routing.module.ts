import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { ThreeJsComponent } from './three-js/three-js.component';
import { notLoginGuard } from './http-interceptors/not-login-guard';
import { SelectComponent } from './select/select.component';
import { loginGuard } from './http-interceptors/login-guard';
import { leaveThreeGuard } from './http-interceptors/leave-three-guard'
import { UserInfoComponent } from './user-info/user-info.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', title: '主页', pathMatch: 'full'},
  { path: 'register', title: '注册', component: RegisterComponent, canActivate: [notLoginGuard]},
  { path: 'home', title: '主页', component: HomeComponent },
  { path: 'login', title: '登录', component: LoginComponent, canActivate: [notLoginGuard] },
  { path: 'three', title: 'three', component: ThreeJsComponent, canActivate: [loginGuard], canDeactivate: [leaveThreeGuard] },
  { path: 'select', title: '选择角色', component: SelectComponent, canActivate: [loginGuard]},
  { path: 'user', title: '个人信息', component: UserInfoComponent, canActivate: [loginGuard]},
  { path: '**', component: PageNotFoundComponent },
];

// @Injectable({providedIn: 'root'})
// export class TemplatePageTitleStrategy extends TitleStrategy {
//   constructor(private readonly title: Title) {
//     super();
//   }

//   override updateTitle(routerState: RouterStateSnapshot) {
//     const title = this.buildTitle(routerState);
//     if (title !== undefined) {
//       this.title.setTitle(`My Application | ${title}`);
//     }
//   }
// }

@NgModule({
  imports: [RouterModule.forRoot(routes, {
      canceledNavigationResolution: 'computed',
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
