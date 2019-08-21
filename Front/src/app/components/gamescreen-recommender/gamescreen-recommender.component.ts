import {Component, OnInit, AfterViewInit, Inject, ViewChild, OnChanges} from '@angular/core';
import {GameService} from '../../services/game.service';
import {ImageService} from '../../services/image.service';
import {ImageComponent} from '../image/image.component';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort, MatTableDataSource} from '@angular/material';
import {DialogData, GameReadyComponent} from '../game-ready/game-ready.component';
import {GameFinishedComponent} from '../game-finished/game-finished.component';
import {GameQuittedComponent} from '../game-quitted/game-quitted.component';
import { GameTimeoutComponent } from '../game-timeout/game-timeout.component';
import {Observable, observable} from 'rxjs';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-gamescreen-recommender',
  templateUrl: './gamescreen-recommender.component.html',
  styleUrls: ['./gamescreen-recommender.component.css']
})
export class GamescreenRecommenderComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(ImageComponent) child;
  currentSegment: number;
  yourTurn;
  content = 'init';
  channel;
  timestamp = 0;
  state = '';
  interval;
  duplicate = false;
  segmentMap;
  opacityMap;
  score = 100;
  segments: Array<{segment: number, timestamp: number}> = [];
  guesses: Array<{guess: string, timestamp: number}> = [];
  revealedSegments: Array<{segment: number, timestamp: number}> = [];
  recommendationsColumn: string[] = ['Label']; // , 'Wordnet Height'];
  guessesColumn: string[] = ['Recent Guesses'];
  DATASOURCE_RECOMMENDATIONS;
  DATASOURCE_GUESSES;
  dimension: {
    width: number,
    height: number,
    label: object[],
    annotation: string,
    synonyms: string[]
  } = {
    width: 0,
    height: 0,
    label: [{}],
    annotation: '',
    synonyms: ['']
  };
  segmentObserver = {
    next: x => {
      console.log(x);
      x.forEach(y => {
        this.segments.push({segment: y, timestamp: null});
      });
    },
    error: err => {
      console.log(err);
    },
    complete: () => {
      console.log('complete');
    }
  };
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
      this.timestamp = 20;
      this.imageService.sendCountdown(this.timestamp).subscribe(this.imageService.countdownObserver);
    }
  };
  constructor(
    private gameService: GameService,
    private imageService: ImageService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.opacityMap = new Map<number, number>();
    Array.from(Array(60).keys()).forEach(x => {
      this.opacityMap.set(x, 0.5);
    });
    this.timestamp = Date.now();
    this.channel = localStorage.getItem('idToken');
    this.gameService.initSocket(this.channel).subscribe(null, null, () => {
      this.segmentOperations();
    });
    this.gameService.latestRevealedSegments().subscribe(
      data => {
        console.log(data);
        this.revealedSegments = data;
      }
    );
    this.gameService.recentGuesses().subscribe(
      data => {
        console.log(data);
        this.guesses = data;
      }
    );
    this.gameService.updateCountdown().subscribe(this.countdownProvider);
    this.gameService.gameFinished().subscribe(data => {
      if ( data.gameover === true) {
        this.clearTimer();
        this.openFinalDialog(data.token);
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
    // nochmal prüfen wie tatsächlich das sortieren funktioniert
    this.DATASOURCE_RECOMMENDATIONS = new MatTableDataSource(this.dimension.label);
    this.DATASOURCE_RECOMMENDATIONS.sort = this.sort;
    this.DATASOURCE_GUESSES = new MatTableDataSource(this.guesses);
  }
  receiveMessage($event) {
    this.currentSegment = $event;
  }
  receiveDuplicate($event) {
    this.duplicate = true;
    let x = setInterval(() => {
      this.duplicate = false;
      clearInterval(x);
    }, 3000);
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
  segmentOperations() {
    this.gameService.revealedSegments().subscribe(this.segmentObserver);
    console.log('revealed segments ====================');
    console.log(this.segments);
    this.gameService.getInitSegments(localStorage.getItem('gameId')).subscribe();
    this.gameService.segmentMap().subscribe((data) => {
      this.segmentMap = data.segmentMap;
      console.log(this.segmentMap.size);
    });
    this.gameService.getDimension().subscribe(data => {
      this.dimension = {
        width: data.dimension.dimensions.width,
        height: data.dimension.dimensions.height,
        label: data.dimension.dimensions.label,
        annotation: data.dimension.dimensions.annotation,
        synonyms: data.dimension.dimensions.synonyms
      };
    });
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
  }
  recommend() {
    this.gameService.recommend(this.currentSegment, Date.now()).subscribe();
    this.currentSegment = null;
  }
  accept() {
    this.gameService.accept(Date.now()).subscribe();
    this.currentSegment = null;
  }
  /*
  labelFilter(array) {
    return array.filter(row => {
      return row['wordnet height'] < 4;
    });
  }
  */
  clearTimer () {
    clearInterval(this.interval);
    this.state = '';
    this.score = 100;
    this.timestamp = 20;
  }
  openSnackBar() {
    this.snackBar.open('The Gamestate has updated.', 'Attention', {
      duration: 3 * 1000
    });
  }
}
