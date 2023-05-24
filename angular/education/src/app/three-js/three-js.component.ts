import { Component, HostListener, NgZone, OnInit } from '@angular/core';
// import * as THREE from 'three';
// const THREEJS = require('THREEJS')
// import Game from '../../assets/js/game.js'
import { Game } from './../../assets/threejs-game/complete/game/Game.js';
import { SocketService } from '../service/socket.service';
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
	// onBeforeUnload(event: BeforeUnloadEvent) {
	//   if (this.isChanged) { // 不是什么东西都能进来的，手动控制进出口
	// 	return false;
	//   }
	
	//   return true;
	// }
	private socket: any;
	private game: any;
	constructor(private ngZone:NgZone, private wsService: SocketService) {
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
	sendMessage() {
		console.log("send")
		this.socket.emit('sendMessage', { message: "msg" });
	}
	ngOnInit(): void {
		
	}
	ngOnDestroy(): void {
		this.game.stopRendering();
		// this.game.delete;
	}
	ngAfterViewInit(): void {	
		// document.addEventListener("DOMContentLoaded", ()=>{
		// 	const game = new Game(this.socket);
		// });
		console.log("here")
		this.game = new Game(); 
        // document.addEventListener("DOMContentLoaded", () => {
        //     // const game = new Game(); 
        //     // window.game = game;
        // });
	
	}
}

