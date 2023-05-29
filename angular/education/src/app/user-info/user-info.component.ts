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
    this.getBackData();
    // if(!this.empty) {
    //   this.initChart();
    //   this.getChartData();
    //   this.getTableData();
    // }
  }
  public empty = true;
  public options = {};
  dataSource :UserTableElement[] = [];
  displayedColumns: string[] = ['position', 'hitrate', 'time', 'date'];
  ELEMENT_DATA =  [
    {position: '1', hitrate: 99, time: '1.0079', date: 'H'},
    {position: '2', hitrate: 87, time: '4.0026', date: 'He'},
    {position: '3', hitrate: 100, time: '6', date: 'Li'},
    {position: '4', hitrate: 30, time: '9.0122', date: 'Be'},
    {position: '5', hitrate: 45, time: '', date: 'B'},
    {position: '6', hitrate: 1, time: '12.0107', date: 'C'},
    {position: '7', hitrate: 0, time: '14.0067', date: 'N'},
  ];
  time:number[] = []
  initChart() {
    const ec = echarts as any;
    let barChart = ec.init(document.getElementById('userChart'));
    barChart.setOption(this.options);
  }
  getBackData() {
    this.empty = false
    let url = Global.backURL + "/user/data";
    let username = localStorage.getItem("username")
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  
    this.http.post(url, username, httpOptions)
      .pipe(catchError((error: HttpErrorResponse)=>{
        this.empty = true
        return this.handler.handleError(error)
      }))
      .subscribe((response:any) => { 
        console.log(response)
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
            for(let i in response) {
              this.dataSource.push({
                position: String(parseInt(i)+1),
                hitrate: response[i].hitrate,
                time:response[i].time,
                date:new Date(response[i].date).toJSON().replace(/T|Z|(\.\d{3})/g," ").trim()
              })
              this.time.push(response[i].time);
            }
            this.initChart();
            this.getChartData();
            this.getTableData();
          }
        }
      });
  }
// 俯视地图 各种敌人击杀数 命中率 通过率
  
  getChartData() {
    // let time = [60,1200,110,30,40,50,10,8]
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
    this.userTable.renderRows()
    console.log(this.dataSource)
  }
}
