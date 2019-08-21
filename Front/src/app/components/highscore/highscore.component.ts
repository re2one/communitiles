import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { HighscoreService } from "../../services/highscore.service";

@Component({
  selector: 'app-highscore',
  templateUrl: './highscore.component.html',
  styleUrls: ['./highscore.component.css']
})
export class HighscoreComponent implements OnInit {

  columns: string[] = ['User', 'Total'];
  yourScore: {User: string, Total: number }[];
  groupScore: {User: string, Total: number }[];
  constructor(
    private router: Router,
    private highscoreService: HighscoreService
  ) { }

  ngOnInit() {
    this.highscoreService.getScore().subscribe(data => {
      this.groupScore = data;
    });
    this.highscoreService.getUserScore().subscribe(data => {
      this.yourScore = data;
    });
  }
}
