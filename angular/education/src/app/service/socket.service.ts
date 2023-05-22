import {Injectable} from '@angular/core';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket:any;
  constructor() { }
  
  connect(url: string):any {
    this.socket = io(url);
    return this.socket
   
  }
}