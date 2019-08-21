import { Component, OnInit } from '@angular/core';
import { LoginService} from '../../services/login.service';
import { Router} from '@angular/router';

@Component({
  selector: 'app-loginpanel',
  templateUrl: './loginpanel.component.html',
  styleUrls: ['./loginpanel.component.css']
})
export class LoginpanelComponent implements OnInit {

  constructor(
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.isLoggedIn()) {
      this.router.navigate(['/menu']);
    }
  }
  isLoggedIn() {
    return this.loginService.isLoggedIn();
  }
}
