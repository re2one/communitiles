import { Component, OnInit } from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {Router} from '@angular/router';
import {MAT_DIALOG_DATA} from '@angular/material';
import { Inject } from '@angular/core';
import { GameService } from '../../services/game.service';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-game-quitted',
  templateUrl: './game-quitted.component.html',
  styleUrls: ['./game-quitted.component.css']
})
export class GameQuittedComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<GameQuittedComponent>,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: {token: string},
    private gameService: GameService,
    private imageService: ImageService
  ) { }

  ngOnInit() {
  }
  onClick(): void {
    this.gameService.cleanupSocket(localStorage.getItem('idToken'));
    localStorage.removeItem('gameId');
    localStorage.removeItem('expiresAt');
    localStorage.setItem('idToken', this.data.token);
    this.imageService.sendRunning(false).subscribe(this.imageService.runningGameObserver);
    // this.imageService.gameComplete();
    // localStorage.setItem('expiresAt', JSON.stringify(this.data.expiresAt.valueOf()));
    this.router.navigate(['/menu']);
    this.dialogRef.close();
  }

}
