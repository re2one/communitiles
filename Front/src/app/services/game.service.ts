import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { environment } from '../../environments/environment';

const URL = (environment.production)? 'http://krul.fachr.at:11009': '/api';
const SERVER_URL = (environment.production || environment.envName === 'switch' || environment.envName === 'pot' || environment.envName === 'maus') ? environment.gamesocket : 'http://localhost:3002';


@Injectable({
  providedIn: 'root'
})
export class GameService {
  private socket;
  public segments = new Array();
  constructor(
    private http: HttpClient
  ) { }

  public getRefresh() {
    return this.http.get(`${URL}/secure/game/images/refresh`);
  }
  public recommend(currentSegment, timestamp) {
    console.log(currentSegment);
    return this.http.post(`${URL}/secure/game/recommending/`, {segment: currentSegment, timestamp: timestamp});
  }
  public accept(timestamp) {
    return this.http.post(`${URL}/secure/game/recommending/accept`, {timestamp: timestamp});
  }
  public guess(guess, timestamp) {
    return this.http.post(`${URL}/secure/game/guessing/guess`, {guess: guess, timestamp: timestamp});
  }
  public skip(timestamp) {
    return this.http.post(`${URL}/secure/game/guessing/skip`, {timestamp: timestamp});
  }
  public miss(timestamp) {
    return this.http.post(`${URL}/secure/game/common/miss`, {timestamp: timestamp});
  }
  public quit(timestamp) {
    return this.http.post(`${URL}/secure/game/common/quit`, {timestamp: timestamp});
  }
  public getInitSegments(gameId) {
    console.log('plebs ' + gameId);
    return this.http.get(`${URL}/secure/game/recommending/${gameId}`);
  }
  public initSocket(userToken): Observable<boolean> {
    this.socket = socketIo(SERVER_URL);
    this.socket.emit('subscribe', {room: `${userToken}`});
    return new Observable<boolean>(observer => {
      this.socket.on('subscriptionSuccess', (data: boolean) => {
        observer.complete();
      });
    });
  }
  public cleanupSocket(userToken) {
    this.socket.emit('unsubscribe', {room: `${userToken}`});
  }
  public updateCountdown(): Observable<{time: number, state: string}> {
    return new Observable<{time: number, state: string}>(obj => {
      this.socket.on('countdown', (data: {time: number, state: string}) => {
        if (data.state !== 'end') {
          obj.next(data);
        } else {
          obj.complete();
        }
      });
    });
  }
  public latestRevealedSegments(): Observable<Array<{segment: number, type: string, timestamp: number}>> {
    return new Observable<Array<{segment: number, type: string, timestamp: number}>>(obj => {
      this.socket.on('revealedSegments', (data: Array<{ segment: number, type: string, timestamp: number }>) => {
        obj.next(data);
      });
    });
  }
  public revealedSegments(): Observable<Array<number>> {
    return new Observable<Array<number>>(obj => {
      this.socket.on('newSegments', (data: Array<number>) => {
        obj.next(data);
      });
    });
  }
  public recentGuesses(): Observable<Array<{guess: string, type: string, timestamp: number}>> {
    return new Observable<Array<{guess: string, type: string, timestamp: number}>>(obj => {
      this.socket.on('recentGuesses', (data: Array<{guess: string, type: string, timestamp: number}>) => {
        obj.next(data.filter(x => x.type === 'guess'));
      });
    });
  }
  public gameFinished(): Observable<{token: string, gameover: boolean}> {
    return new Observable<{token: string, gameover: boolean}>(obj => {
      this.socket.on('finish', (data: {token: string, gameover: boolean}) => {
        obj.next(data);
      });
    });
  }
  public gameQuitted(): Observable<{token: string, gameover: boolean}> {
    return new Observable<{token: string, gameover: boolean}>(obj => {
      this.socket.on('quit', (data: {token: string, gameover: boolean}) => {
        obj.next(data);
      });
    });
  }
  public gameTimedout(): Observable<{token: string, gameover: boolean}> {
    return new Observable<{token: string, gameover: boolean}>(obj => {
      this.socket.on('timeout', (data: {token: string, gameover: boolean}) => {
        obj.next(data);
      });
    });
  }
  public currentScore(): Observable<number> {
    return new Observable<number>(obj => {
      this.socket.on('currentScore', (data: number) => {
        obj.next(data);
      });
    });
  }
  public currentState(): Observable<{state: string, boolean: boolean}> {
    return new Observable<{state: string, boolean: boolean}>(obj => {
      this.socket.on('currentState', (data: {state: string, boolean: boolean}) => {
        obj.next(data);
      });
    });
  }
  public getDimension(): Observable <{dimension: {dimensions: {height: number, width: number, label: {'label': string, 'wordnet height': number}[], annotation: string, synonyms: string[]}}}> {
    return this.http.get<{dimension: {dimensions: {height: number, width: number, label: {'label': string, 'wordnet height': number}[], annotation: string, synonyms: string[]}}}>(`${URL}/secure/game/images/dimension`);
  }
  public segmentMap(): Observable <{segmentMap: number[][]}> {
    return this.http.get<{segmentMap: number[][]}>(`${URL}/secure/game/images/positions`);
  }
  public playerReady(): Observable <{segments: Array<number>}> {
    this.socket.emit('playerReady', {
      game: localStorage.getItem('gameId'),
      channel: localStorage.getItem('idToken')
    });
    return new Observable <{segments: Array<number>}>(observer => {
      this.socket.on('startGame', () => {
        console.log('got it');
        observer.complete();
      });
    });
  }
}
