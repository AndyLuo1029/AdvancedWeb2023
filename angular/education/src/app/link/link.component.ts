import { Component } from '@angular/core';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css']
})
export class LinkComponent {
  
  link() {
    if(localStorage.getItem("username") != null || localStorage.getItem("username") != "") {
      const url = "http://127.0.0.1:2002";
      window.open(url);
    }
    else {
      window.alert("请先登录")
    }
  }
}
