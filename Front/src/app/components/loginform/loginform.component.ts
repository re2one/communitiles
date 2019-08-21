import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { OnlineService } from '../../services/online.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-loginform',
  templateUrl: './loginform.component.html',
  styleUrls: ['./loginform.component.css']
})
export class LoginformComponent implements OnInit {
  error;
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.maxLength(256)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(256)])
  });

  constructor(private router: Router, private loginService: LoginService, private onlineService: OnlineService) { }

  ngOnInit() {
  }
  login() {
    // retreives an authentication token by submitting the login credentials
    this.loginService.getAccessToken(this.loginForm.get('email').value, this.loginForm.get('password').value).subscribe(
      obj => {
        this.loginService.setSession(obj);
        this.router.navigate(['/menu']);
        // adds user to the map containing the online users
        this.onlineService.logUser()
          .subscribe(obj2 => {
              // this.onlineUser = new Map(JSON.parse(obj.onlineUserMap));
            },
            error => this.handleError(error)
          );
      },
      error => this.handleError(error)
    );
  }
  handleError(error: HttpErrorResponse) {
    console.log(error);
    this.error = error;
  }
}
