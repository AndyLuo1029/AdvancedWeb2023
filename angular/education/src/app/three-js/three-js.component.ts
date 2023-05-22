import { Component, NgZone, OnInit } from '@angular/core';
// import * as THREE from 'three';
// const THREEJS = require('THREEJS')
import Game from '../../assets/js/game.js'
import { SocketService } from '../service/socket.service';
// import * as io from 'socket.io-client';
@Component({
  selector: 'app-three-js',
  templateUrl: './three-js.component.html',
  styleUrls: ['./three-js.component.css'],
  providers: [{provide: SocketService}]
})
export class ThreeJsComponent implements OnInit{

	private socket: any;
	constructor(private ngZone:NgZone, private wsService: SocketService) {
		this.socket = wsService.connect("localhost:2002");
		console.log(this.socket)
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
		document.addEventListener("DOMContentLoaded", ()=>{
			const game = new Game(this.socket);
		});
		
	
	}
}

