import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './services/login.service';
import { OnlineService } from './services/online.service';
import { OnlinesocketService } from './services/onlinesocket.service';
import { GameService } from './services/game.service';
import { ImageService } from './services/image.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy {
  playersOnline;
  connection;
  countdown = 20;
  score = 100.00;
  state;
  runningGame = false;
  constructor(
    private loginService: LoginService,
    private onlineService: OnlineService,
    private onlinesocketService: OnlinesocketService,
    private router: Router,
    private gameService: GameService,
    private imageService: ImageService
  ) {
    this.imageService.countdown.subscribe(data => this.countdown = data );
    this.imageService.score.subscribe(data => this.score = data );
    this.imageService.runningGame.subscribe(data => this.runningGame = data );
    this.imageService.state.subscribe(data => this.state = data);
  }
  ngOnInit() {
    this.onlinesocketService.initSocket();
    this.connection = this.onlinesocketService.onPlayerUpdate()
      .subscribe((a: {playerCount: string}) => {
        this.playersOnline = a.playerCount;
        console.log(a.playerCount);
      });
    this.onlinesocketService.send('some Msg');
  }
  ngOnDestroy() {
    console.log(this.playersOnline);
  }
  logout() {
    console.log('app component');
    this.onlineService.logUserOut().subscribe();
    this.gameService.quit(Date.now()).subscribe();
    if (this.runningGame === true) {
      this.imageService.sendRunning(false).subscribe(this.imageService.runningGameObserver);
      // this.imageService.gameComplete();
    }
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
  quitGame() {
    this.gameService.quit(Date.now()).subscribe();
    this.imageService.sendRunning(false).subscribe(this.imageService.runningGameObserver);
    // this.imageService.gameComplete();
    this.router.navigate(['/menu']);
  }
  isLoggedIn() {
    return this.loginService.isLoggedIn();
  }
  navigateBack() {
    this.router.navigate(['/menu']);
  }
  location() {
    return this.router.url;
  }
}
