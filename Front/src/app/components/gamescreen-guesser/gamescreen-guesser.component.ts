import {Component, OnInit, AfterViewInit, Inject} from '@angular/core';
import {GameService} from '../../services/game.service';
import {ImageService} from '../../services/image.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {DialogData} from '../game-ready/game-ready.component';
import {GameReadyComponent} from '../game-ready/game-ready.component';
import {GameFinishedComponent} from '../game-finished/game-finished.component';
import {GameQuittedComponent} from '../game-quitted/game-quitted.component';
import { GameTimeoutComponent } from '../game-timeout/game-timeout.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ValidatorFn, AbstractControl} from "@angular/forms";
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-gamescreen-guesser',
  templateUrl: './gamescreen-guesser.component.html',
  styleUrls: ['./gamescreen-guesser.component.css']
})
export class GamescreenGuesserComponent implements OnInit, AfterViewInit {
  yourTurn;
  timestamp;
  interval;
  state = '';
  channel;
  duplicates = false;
  opacityMap;
  score = 100;
  DATASOURCE_GUESSES;
  guessesColumn: string[] = ['Recent Guesses'];
  guesses: Array<{guess: string, timestamp: number}> = [];
  revealedSegments: Array<{segment: number, timestamp: number}> = [];
  dimension: {
    width: number,
    height: number,
    label: object[],
    annotation: string
  } = {
    width: 0,
    height: 0,
    label: [{}],
    annotation: ''
  };
  segments = [];
  error;
  guessingForm = new FormGroup({
    guess: new FormControl('', [
      Validators.required,
      Validators.maxLength(255),
      this.duplicateValidator()
    ])
  });
  countdownProvider = {
    next: (data) => {
      let difference = 20;
      clearInterval(this.interval);
      this.interval = setInterval( () => {
        difference = 20 - Math.round((Date.now() - data.time) / 1000);
        this.timestamp = difference;
        if (difference < 1) {
          clearInterval(this.interval);
          if (this.yourTurn) {
            this.gameService.miss(Date.now()).subscribe();
          }
        }
        this.imageService.sendCountdown(this.timestamp).subscribe(this.imageService.countdownObserver);
      }, 1000);
    },
    error: (error) => {
      console.log(error);
    },
    complete: () => {
      clearInterval(this.interval);
      this.imageService.sendCountdown(this.timestamp).subscribe(this.imageService.countdownObserver);
      this.imageService.sendScore(this.score).subscribe(this.imageService.scoreObserver);
      this.imageService.sendState(this.state).subscribe(this.imageService.stateObserver);
      this.yourTurn = false;
    }
  };
  constructor(
    private gameService: GameService,
    private imageService: ImageService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit() {
    this.opacityMap = new Map<number, number>();
    Array.from(Array(60).keys()).forEach(x => {
      this.opacityMap.set(x, 1);
    });
    this.timestamp = Date.now();
    this.channel = localStorage.getItem('idToken');
    this.gameService.initSocket(this.channel);
    this.gameService.getDimension().subscribe(data => {
      this.dimension = {
        width: data.dimension.dimensions.width,
        height: data.dimension.dimensions.height,
        label: [], // labelarray,
        annotation: '' // data.dimension.dimensions.annotation
      };
    });
    this.gameService.latestRevealedSegments().subscribe(
      data => {
        this.revealedSegments = data;
      }
    );
    this.gameService.recentGuesses().subscribe(
      data => {
        console.log(data);
        this.guesses = data;
      }
    );
    this.gameService.currentScore().subscribe(data => {
      this.score = data;
      this.imageService.sendScore(this.score).subscribe(this.imageService.scoreObserver);
    });
    this.gameService.currentState().subscribe(data => {
      this.state = data.state;
      this.yourTurn = data.boolean;
      this.imageService.sendState(this.state).subscribe(this.imageService.stateObserver);
      this.openSnackBar();
    });
    this.gameService.updateCountdown().subscribe( this.countdownProvider);
    this.gameService.gameFinished().subscribe(data => {
      if ( data.gameover === true) {
        this.clearTimer();
        this.openFinalDialog(data.token);
      } else {

        localStorage.setItem('idToken', data.token);
      }
    });
    this.gameService.gameQuitted().subscribe(data => {
      if ( data.gameover === true) {
        this.clearTimer();
        this.openQuitDialog(data.token);
      }
    });
    this.gameService.gameTimedout().subscribe(data => {
      if ( data.gameover === true) {
        this.clearTimer();
        this.openTimeoutDialog(data.token);
      }
    });
  }
  ngAfterViewInit() {
    setTimeout( () => {
      this.openDialog();
      this.gameService.getRefresh().subscribe();
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(GameReadyComponent, {
      width: '250px',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe();
  }
  openFinalDialog(token: string): void {
    const dialogRef = this.dialog.open(GameFinishedComponent, {
      width: '250px',
      disableClose: true,
      data: {
        token: token
      }
    });
    dialogRef.afterClosed().subscribe();
  }
  openQuitDialog(token: string): void {
    const dialogRef = this.dialog.open(GameQuittedComponent, {
      width: '250px',
      disableClose: true,
      data: {
        token: token
      }
    });
    dialogRef.afterClosed().subscribe();
  }
  openTimeoutDialog(token: string): void {
    const dialogRef = this.dialog.open(GameTimeoutComponent, {
      width: '250px',
      disableClose: true,
      data: {
        token: token
      }
    });
    dialogRef.afterClosed().subscribe();
  }
  guess() {
    const fieldContent = this.guessingForm.get('guess').value;
    this.gameService.guess(fieldContent, Date.now()).subscribe();
    this.guessingForm.reset();
  }
  skip() {
    this.gameService.skip(Date.now()).subscribe();
  }
  clearTimer () {
    this.timestamp = 20;
    this.state = '';
    this.score = 100;
    clearInterval(this.interval);
  }

  duplicateValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const forbidden = this.guesses.map(x => x.guess).includes(control.value);
      this.duplicates = forbidden;
      return forbidden ? {'forbiddenName': {value: control.value}} : null;
    };
  }
  getErrorMessage() {
    return (this.duplicates)? 'No duplicates allowed!': 'Field must not be empty!';
  }
  openSnackBar() {
    this.snackBar.open('The Gamestate has updated.', 'Attention', {
      duration: 3 * 1000
    });
  }
}

