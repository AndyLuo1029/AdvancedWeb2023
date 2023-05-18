import { Component, NgZone, OnInit } from '@angular/core';
// import * as THREE from 'three';
// const THREEJS = require('THREEJS')
import Game from '../../assets/js/game.js'

import * as io from 'socket.io-client';
@Component({
  selector: 'app-three-js',
  templateUrl: './three-js.component.html',
  styleUrls: ['./three-js.component.css']
})
export class ThreeJsComponent implements OnInit{

	constructor(private ngZone:NgZone) {}
    loadScript(url: string) {
		const body = <HTMLDivElement> document.body;
		const script = document.createElement('script');
		script.innerHTML = '';
		script.src = url;
		script.async = false;
		script.defer = true;
		body.appendChild(script);
	}
	ngOnInit(): void {
		// this.loadScript("https://code.jquery.com/jquery-1.11.1.js");
		// this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/92/three.min.js');
		// this.loadScript('../../assets/libs/inflate.min.js');
		// this.loadScript('../../assets/libs/FBXLoader.js');
		// this.loadScript('../../assets/libs/Detector.js');
		// this.loadScript('../../assets/libs/toon3d.js');
		this.ngZone.runOutsideAngular(() => {
			const socket = io.connect("http://127.0.0.1:2002")
			// document.addEventListener("DOMContentLoaded", function(){
			// 	const game = new Game(socket);
			// });
		  });
	
	}
}

