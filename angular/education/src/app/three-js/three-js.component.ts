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
	private map:number;
	private skin:number;
	public finish:number;
	private socket: any;
	private game: any;
	private url = Global.backURL+"/user/addData";
	constructor(
		public http:HttpClient, 
		private ngZone:NgZone, 
		private wsService: SocketService, 
		private router: Router,
		private handler:BackErrorHandler) 
		{
			this.finish = 0;
			this.map = Global.map_choice;
			this.skin = Global.skin_choice;
			this.socket = wsService.connect("localhost:8084");
		// console.log(this.socket)
		// this.socket.on('setId', function(data:any){
		// 	console.log(data)
		// });
		// this.sendMessage();
		}
    // loadScript(url: string) {
	// 	const body = <HTMLDivElement> document.body;
	// 	const script = document.createElement('script');
	// 	script.innerHTML = '';
	// 	script.src = url;
	// 	script.async = false;
	// 	script.defer = true;
	// 	body.appendChild(script);
	// }
	// gameFinish(i:number, self:any) {
		
	// 	self.finish = i
	// }

	sendMessage() {
		console.log("send")
		this.socket.emit('sendMessage', { message: "msg" });
	}
	// ngOnChanges(changes: SimpleChanges) {
	// 	// changes.prop contains the old and the new value...
	// 	console.log(changes)
	//   }
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
		this.finish = 0
		// delete this.game;
		// this.game.delete;
	}
	ngAfterViewInit(): void {	
		// document.addEventListener("DOMContentLoaded", ()=>{
		// 	const game = new Game(this.socket);
		// });
		// console.log("here")
		this.game = new Game(this.map, this.skin, this.socket, (result:any)=> {
			// console.log(result)
			this.finish = 1;
			this.updateData(result.time, result.hitrate);
			this.router.navigate(['/home'],{ replaceUrl: true });
		}); 

	}
}

