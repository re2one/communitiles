import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent} from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginpanelComponent } from './components/loginpanel/loginpanel.component';
import { LoginformComponent } from './components/loginform/loginform.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SignupformComponent } from './components/signupform/signupform.component';
import { MaterialModule } from './material/material.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { AuthGuardService } from './services/auth-guard.service';
import { MainpageComponent } from './components/mainpage/mainpage.component';
import { PlayComponent } from './components/play/play.component';
import { HighscoreComponent } from './components/highscore/highscore.component';
import { GamescreenRecommenderComponent } from './components/gamescreen-recommender/gamescreen-recommender.component';
import { GamescreenGuesserComponent } from './components/gamescreen-guesser/gamescreen-guesser.component';
import { HighscoreService} from './services/highscore.service';
import { TimerComponent } from './components/timer/timer.component';
import { ScoreComponent } from './components/score/score.component';
import { LabelComponent } from './components/label/label.component';
import { ImageComponent } from './components/image/image.component';
import { HistoryComponent } from './components/history/history.component';
import { ImagePipe } from './pipes/image.pipe';
import { GameReadyComponent } from './components/game-ready/game-ready.component';
import { GameFinishedComponent } from './components/game-finished/game-finished.component';
import { GameQuittedComponent } from './components/game-quitted/game-quitted.component';
import { GameTimeoutComponent } from './components/game-timeout/game-timeout.component';
import { InstructionsComponent } from './components/instructions/instructions.component';
import { DisclosureComponent } from './components/disclosure/disclosure.component';

const appRoutes: Routes = [
  {path: 'login', component: LoginpanelComponent},
  {path: 'menu', component: MainpageComponent, canActivate: [AuthGuardService]},
  {path: 'play', component: PlayComponent, canActivate: [AuthGuardService]},
  {path: 'highscore', component: HighscoreComponent, canActivate: [AuthGuardService]},
  {path: 'recommender', component: GamescreenRecommenderComponent, canActivate: [AuthGuardService]},
  {path: 'guesser', component: GamescreenGuesserComponent, canActivate: [AuthGuardService]},
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'instructions', component: InstructionsComponent, canActivate: [AuthGuardService]},
  {path: 'disclosure', component: DisclosureComponent, canActivate: [AuthGuardService]}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginpanelComponent,
    LoginformComponent,
    SignupformComponent,
    MainpageComponent,
    PlayComponent,
    HighscoreComponent,
    GamescreenRecommenderComponent,
    GamescreenGuesserComponent,
    TimerComponent,
    ScoreComponent,
    LabelComponent,
    ImageComponent,
    HistoryComponent,
    ImagePipe,
    GameReadyComponent,
    GameFinishedComponent,
    GameQuittedComponent,
    GameTimeoutComponent,
    InstructionsComponent,
    DisclosureComponent
  ],
  entryComponents: [
    GameReadyComponent,
    GameFinishedComponent,
    GameQuittedComponent,
    GameTimeoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      appRoutes
    ),
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    AppModule,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true
    }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
