import { Component, HostListener, Input, NgZone, OnInit, SimpleChange, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Game } from './../../assets/threejs-game/complete/game/Game.js';
import { SocketService } from '../service/socket.service';
import { Router } from '@angular/router';
import { Global } from '../global';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError } from 'rxjs';
import { BackErrorHandler } from '../http-interceptors/back-error-handler';
// import * as io from 'socket.io-client';
@Component({
  selector: 'app-three-js',
  templateUrl: './three-js.component.html',
  styleUrls: ['./three-js.component.css'],
  providers: [{provide: SocketService}, {provide: BackErrorHandler}],
  encapsulation: ViewEncapsulation.None,
})
// @HostListener('window:beforeunload', ['$event'])
export class ThreeJsComponent implements OnInit{
	@HostListener('window:beforeunload')
	onBeforeUnload() {
		return false;
	}
	private map:number = 0;
	private skin:number = 0;
	public finish:number = 0;
	private socket: any;
	private game: any;
	private url = Global.backURL+"/user/addData";
	private nodeUrl = Global.nodeURL;
	constructor(
		public http:HttpClient, 
		private ngZone:NgZone, 
		private wsService: SocketService, 
		private router: Router,
		private handler:BackErrorHandler) 
		{
			
		// console.log(this.socket)
		// this.socket.on('setId', function(data:any){
		// 	console.log(data)
		// });
		// this.sendMessage();
		}

	updateData(time:number, hitrate:number) {
		const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
		this.http.post(this.url, 
			{
			  username:localStorage.getItem("username"),
			  time: time,
			  hitrate: hitrate
			}, httpOptions)
		  .pipe(catchError(this.handler.handleError))
		  .subscribe((response:any) => { 
			if(response.code == 401) {
			  window.alert(response.message); 
			}
		  });
	}
	ngOnInit(): void {
		
	}
	ngOnDestroy(): void {
		this.game.stopRendering();
		this.finish = 0;
	}
	ngAfterViewInit(): void {
		this.finish = 0;
		this.map = Global.map_choice;
		this.skin = Global.skin_choice;
		this.socket = this.wsService.connect(this.nodeUrl);	
		this.game = new Game(localStorage.getItem('username'),this.map, this.skin, this.socket, (result:any)=> {
			this.finish = 1;
			this.updateData(result.time, result.hitrate);
			this.router.navigate(['/home'],{ replaceUrl: true });
		}); 

	}
}

