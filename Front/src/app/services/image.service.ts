import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  public countdown: Subject<number>;
  public score: Subject<number>;
  public runningGame: Subject<boolean>;
  public state: Subject<string>;
  constructor () {
    this.countdown = new Subject();
    this.score = new Subject();
    this.runningGame = new Subject();
    this.state = new Subject();
  }
  countdownObserver = {
    next: (data) => {
      this.countdown.next(data);
    },
    error: (err) => {
      console.log(err);
    },
    complete: () => {
      this.countdown = new Subject();
    }
  };
  scoreObserver = {
    next: (data) => {
      this.score.next(data);
    },
    error: (err) => {
      console.log(err);
    },
    complete: () => {
      this.score = new Subject();
    }
  };
  stateObserver = {
    next: (data) => {
      this.state.next(data);
    },
    error: (err) => {
      console.log(err);
    },
    complete: () => {
      this.state = new Subject();
    }
  };
  runningGameObserver = {
    next: (data) => {
      this.runningGame.next(data);
    },
    error: (err) => {
      console.log(err);
    },
    complete: () => {
      this.runningGame = new Subject();
    }
  };
  public sendCountdown(input) {
    return Observable.create((observer) => {
      observer.next(input);
    });
  }
  public sendScore(input) {
    return Observable.create((observer) => {
      observer.next(input);
    });
  }
  public sendState(input) {
    return Observable.create((observer) => {
      observer.next(input);
    });
  }
  public sendRunning(input) {
    return Observable.create((observer) => {
      observer.next(input);
    });
  }
  public gameComplete() {
    this.scoreObserver.complete();
    this.stateObserver.complete();
    this.runningGameObserver.complete();
    this.countdownObserver.complete();
  }
}
