import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import { LoginService } from '../../services/login.service';
import { OnlineService} from '../../services/online.service';
import {HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

@Component({
  selector: 'app-signupform',
  templateUrl: './signupform.component.html',
  styleUrls: ['./signupform.component.css']
})
export class SignupformComponent implements OnInit {
  signupData;
  error;
  username: string;
  email: string;
  password: string;
  signupForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.maxLength(256)]),
    email: new FormControl('', [Validators.required, Validators.maxLength(256)]),
    password: new FormControl('', [Validators.required, Validators.maxLength(256)])
  });

  constructor(
    private router: Router,
    private loginService: LoginService,
    private onlineService: OnlineService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
  }
  signup() {
    this.loginService.signup(
      this.signupForm.get('username').value,
      this.signupForm.get('email').value,
      this.signupForm.get('password').value
    ).subscribe(
      obj  => {
          this.loginService.getAccessToken(obj.body.email, obj.body.password).subscribe(
            obj2 => {
              this.signupData = obj2;
              this.loginService.setSession(obj2);
              console.log(obj2);
              this.router.navigate(['/menu']);
              this.onlineService.logUser()
                .subscribe(obj3 => {
                    // this.onlineUser = new Map(JSON.parse(obj.onlineUserMap));
                  },
                  error => this.handleError(error)
                );
            },
            error => this.handleError(error)
          );
      },
      error => this.handleError(error)
    );
  }
  handleError(error: HttpErrorResponse) {
    console.log(error);
    this.snackBar.open('Username or Emailadress already exists.', '', {
      duration: 10 * 1000
    });
    this.error = error;
  }
}
