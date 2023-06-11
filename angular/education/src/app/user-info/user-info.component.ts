import { Component, ViewChild } from '@angular/core';
import * as echarts from 'echarts';
import { Global } from '../global';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BackErrorHandler } from '../http-interceptors/back-error-handler';
import { catchError } from 'rxjs';
import { MatTable } from '@angular/material/table';
export interface UserTableElement {
  date: string;
  position: string;
  hitrate: number;
  time: string;
}

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css'],
  providers: [{provide: BackErrorHandler}]
})

export class UserInfoComponent {
  @ViewChild(MatTable) userTable!: MatTable<any>;
  constructor(public http:HttpClient, private router: Router, private handler:BackErrorHandler) {}
  ngOnInit() {    
    this.getUserData();
    this.getBackData();
    // if(!this.empty) {
    //   this.initChart();
    //   this.getChartData();
    //   this.getTableData();
    // }
  }
  public empty = true;
  public user_empty = true;
  public email = "";
  public username = "";
  public options = {};
  dataSource :UserTableElement[] = [];
  displayedColumns: string[] = ['position', 'hitrate', 'time', 'date'];
  time:number[] = []
  initChart() {
    const ec = echarts as any;
    let barChart = ec.init(document.getElementById('userChart'));
    barChart.setOption(this.options);
  }
  getUserData() {
    // this.empty = false
    let url = Global.backURL + "/info";
    let username = localStorage.getItem("username")
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  
    this.http.post(url, username, httpOptions)
      .subscribe((response:any) => { 

        console.log(response)
        if(response.code == 401) {
          window.alert(response.message);
        }
        else {
          this.user_empty = false;
          this.username = response.username;
          this.email = response.email ? response.email : "暂无";
        }
      });
  }
  getBackData() {
    // this.empty = false
    let url = Global.backURL + "/user/data";
    let username = localStorage.getItem("username")
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  
    this.http.post(url, username, httpOptions)
      .pipe(catchError((error: HttpErrorResponse)=>{
        this.empty = true
        return this.handler.handleError(error)
      }))
      .subscribe((response:any) => { 
        // console.log(response)
        if(response.code == 400) {
          window.alert(response.message); 
          this.empty = true
        }
        else {
          if(response.code == 401) {
            this.empty = true
          //  console.log("wushuju")
          }
          else {
            // console.log(response)
            this.empty = false
            for(let i in response) {
              this.dataSource.push({
                position: String(parseInt(i)+1),
                hitrate: response[i].hitrate,
                time:response[i].time,
                date:new Date(response[i].date).toLocaleString().replace(/T|Z|(\.\d{3})/g," ").trim()
              })
              this.time.push(response[i].time);
            }
            setTimeout( ()=>{ //延时加载echarts初始化函数
              this.initChart();
              this.getChartData();
            },100)
        
            
            this.getTableData();
          }
        }
      });
  }

  getChartData() {
    let timetext = []
    for(let i in this.time) {
      let text = ""
      let min = Math.floor(this.time[i] / 60)
      if(min > 0) {
        text += min + "m"
      }
      if(this.time[i] % 60 != 0) {
        text += this.time[i] % 60 + "s"
      }
      if(this.time[i] == 0) {
        text = "未通过"
      }
      timetext.push(text)
    }
    this.options = {
      title: {
        text : '通过时间',
        subtext: '(最近10次)'
      },
      xAxis: {
        type: 'category',
        data: timetext
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: this.time,
          type: 'bar',
          barMaxWidth: '100px'
        }
      ]
    };
  }

  
  getTableData() {
    // this.dataSource = this.ELEMENT_DATA;
    let length = this.dataSource.length;
    let hitSum = 0;
    let timeSum = 0;
    let success = 0;
    for(let i in this.dataSource) {
      hitSum += this.dataSource[i].hitrate
      if(this.dataSource[i].time != '0') {
        timeSum += parseFloat(this.dataSource[i].time)
        success++;
      }
    }
    hitSum /= length;
    timeSum /= success;
    let passrate = (success/length*100).toFixed(1)+'(通过率)'
    this.dataSource.push({position: '总计(平均)', hitrate: parseFloat(hitSum.toFixed(3)), time: timeSum.toFixed(2), date:passrate})
    // this.userTable.renderRows()
    // console.log(this.dataSource)
  }
}
