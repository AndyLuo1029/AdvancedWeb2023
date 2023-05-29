import { Component, HostListener, Input, NgZone, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
// import * as THREE from 'three';
// const THREEJS = require('THREEJS')
// import Game from '../../assets/js/game.js'
import { Game } from './../../assets/threejs-game/complete/game/Game.js';
import { SocketService } from '../service/socket.service';
import { Router } from '@angular/router';
// import * as io from 'socket.io-client';
@Component({
  selector: 'app-three-js',
  templateUrl: './three-js.component.html',
  styleUrls: ['./three-js.component.css'],
  providers: [{provide: SocketService}]
})
// @HostListener('window:beforeunload', ['$event'])
export class ThreeJsComponent implements OnInit{
	@HostListener('window:beforeunload')
	onBeforeUnload() {
		return false;
	}
	public finish:number;
	private socket: any;
	private game: any;

	constructor(private ngZone:NgZone, private wsService: SocketService, private router: Router) {
		this.finish = 0;
		// this.socket = wsService.connect("localhost:2002");
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
		this.game = new Game((result:any)=> {
			// console.log(result)
			this.finish = 1;
			this.router.navigate(['/home'],{ replaceUrl: true });
		}); 
	
	}
}

