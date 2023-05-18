import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, NgModule } from "@angular/core";
import { ObservableInput, throwError } from "rxjs";

@Injectable()
export class BackErrorHandler implements ErrorHandler {
     handleError(error: HttpErrorResponse): ObservableInput<any>  {
        if (error.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            window.alert("服务器出错")
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            if(error.status == 403) window.alert("请先登录 ")
            console.error(
              `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Something bad happened; please try again later.'));
      
    }
  }
  