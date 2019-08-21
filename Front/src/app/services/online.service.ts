import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {environment} from "../../environments/environment";

const URL = (environment.production)? 'http://krul.fachr.at:11009': '/api';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {
  constructor(public http: HttpClient) { }
  logUser() {
    return this.http.post<{onlineUserMap: string}>(`${URL}/secure/online`, {});
  }
  logUserOut() {
    console.log('online service');
    return this.http.delete(`${URL}/secure/online`);
  }
}
