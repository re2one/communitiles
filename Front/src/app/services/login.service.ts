import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import {environment} from "../../environments/environment";
import { Observable } from "rxjs";

const URL = (environment.production)? 'http://krul.fachr.at:11009': '/api';

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  constructor(public http: HttpClient) { }
  getAccessToken(email: String, password: String) {
    return this.http.post(`${URL}/login/`, {
      'email': email,
      'password': password
    });
  }

  signup(username: String, email: String, password: String): Observable<HttpResponse<{username: String, email: String, password: String }>>{
    return this.http.post<{username: String, email: String, password: String }>(`${URL}/signup/`, {
      'username': username,
      'email': email,
      'password': password
    }, { observe: 'response' });
  }

  public setSession(authResult) {
    localStorage.setItem('idToken', authResult.idToken);
    localStorage.setItem('expiresAt', JSON.stringify(authResult.expiresAt.valueOf()));
    localStorage.setItem('gameId', authResult.gameId);
  }

  public logout() {
    localStorage.removeItem('idToken');
    localStorage.removeItem('expiresAt');
    localStorage.removeItem('gameId');
  }

  public isLoggedIn() {
    return localStorage.getItem('idToken') !== null;
  }

  isLoggedOut() {
    return !this.isLoggedIn();
  }
}
