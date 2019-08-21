import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import * as socketIo from 'socket.io-client';
import {environment} from '../../environments/environment';

const SERVER_URL = (environment.production || environment.envName === 'switch' || environment.envName === 'pot' || environment.envName === 'maus') ? environment.onlinesocket : 'http://localhost:3001';

@Injectable({
  providedIn: 'root'
})
export class OnlinesocketService {
  private socket;
  constructor() { }

  public initSocket(): void {
    this.socket = socketIo(SERVER_URL);
  }
  public onPlayerUpdate(): Observable<{playerCount: string}> {
    return new Observable<{playerCount: string}>(obj => {
      this.socket.on('playerUpdate', (data: {playerCount: string}) => {
        console.log(JSON.stringify(data));
        obj.next(data);
      });
    });
  }
  public send(msg: string): void {
    this.socket.emit('topEvent', {payload: msg});
  }
}
