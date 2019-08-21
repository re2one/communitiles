import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";
import {environment} from "../../environments/environment";

const URL = (environment.production)? 'http://krul.fachr.at:11009': '/api';

@Injectable({
  providedIn: 'root'
})
export class HighscoreService {

  constructor(
    private http: HttpClient
  ) { }
  public getUserScore() {
    return this.http.get<{User: string, Total: number }[]>(`${URL}/secure/score/self`);
  }
  public getScore() {
    return this.http.get<{User: string, Total: number }[]>(`${URL}/secure/score/overall`);
  }
}
