import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { GameService } from '../../services/game.service';

export interface DialogData {
  ready: boolean;
}

@Component({
  selector: 'app-game-ready',
  templateUrl: './game-ready.component.html',
  styleUrls: ['./game-ready.component.css']
})
export class GameReadyComponent {
  constructor(
    public dialogRef: MatDialogRef<GameReadyComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private gameService: GameService
  ) {}
  disabled = false;
  onClick(): void {
    this.disabled = true;
    this.gameService.playerReady()
      .subscribe((observable) => {
        console.log('Next: ' + observable);
      },
        (observable) => {
        console.log('Error: ' + observable);
        },
        () => {
          console.log('Complete');
          this.dialogRef.close();
        });
  }
}
