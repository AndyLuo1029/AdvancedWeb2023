import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HomeComponent } from './home/home.component';
import { ThreeJsComponent } from './three-js/three-js.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', title: '主页', pathMatch: 'full'},
  { path: 'register', title: '注册', component: RegisterComponent },
  { path: 'home', title: '主页', component: HomeComponent },
  { path: 'login', title: '登录', component: LoginComponent },
  { path: 'three', title: 'three', component: ThreeJsComponent },
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
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
