import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment';

const URL = (environment.production)? 'http://krul.fachr.at:11009': '/api';

@Injectable({
  providedIn: 'root'
})
export class PairingService {

  constructor(public http: HttpClient) { }
  pair() {
    // return this.http.post<{role: string, image: string}>('http://localhost:3000/api/secure/pairing', {});
    return this.http.post<{
      idToken: string,
      expiresAt: string,
      role: string,
      imageId: number,
      gameId: number
    }>(`${URL}/secure/pairing`, {});
  }
}
