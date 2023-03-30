import 'zone.js/dist/zone';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { WeatherApiDirective } from './weather-api.directive';

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule, HttpClientModule, WeatherApiDirective],
  template: `
    <h1>Hello from {{name}}!</h1>
    <div *getWeather='let data longitude 12 latitude 62.65 '>
    {{data.latitude }}</div>
    <a target="_blank" href="https://angular.io/start">
      Learn more about Angular 
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  name = 'Angular';
}

bootstrapApplication(App);
