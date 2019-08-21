import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PairingService } from '../../services/pairing.service';
import { LoginService } from '../../services/login.service';
import { GameService} from '../../services/game.service';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {
  pairing = 'pairing in progress...';
  error;
  constructor(
    private pairingService: PairingService,
    private loginService: LoginService,
    private router: Router,
    private gameService: GameService,
    private imageService: ImageService
  ) { }

  ngOnInit() {
    this.pairingService.pair().subscribe(obj => {
      console.log(JSON.stringify(obj));
      this.loginService.setSession(obj);
      this.imageService.sendRunning(true).subscribe(this.imageService.runningGameObserver);
      this.router.navigate([`/${obj.role}`]);
      },
      error => this.handleError(error)
    );
  }
  handleError(error: HttpErrorResponse) {
    console.log(error);
    this.error = error;
  }
  onClick () {
    this.router.navigate(['/menu']);
    this.gameService.quit(Date.now()).subscribe();
  }
}
