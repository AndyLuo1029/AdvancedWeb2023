import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Get the auth token from the service.
    let token = localStorage.getItem("token")
    if(token == null) token = ""
    let username = localStorage.getItem("username")
    if(username == null) username = ""

    // Clone the request and set the new header in one step.
    const authReq = req.clone({ setHeaders:
         { Authorization: token,
           Username: username } });    
    // send cloned request with header to the next handler.
    return next.handle(authReq);
  }
}