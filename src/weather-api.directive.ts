import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Directive,
  OnInit,
  TemplateRef,
  ViewContainerRef,
  Input,
  EmbeddedViewRef,
  OnDestroy,
} from '@angular/core';
import {
  combineLatest,
  ReplaySubject,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';

export interface WeatherContext {
  $implicit: WeatherModel;
}
export interface WeatherModel {
  latitude: number;
  longitude: number;
}

@Directive({
  selector: '[getWeather]',
  standalone: true, // to be able to import into standalone component
})
export class WeatherApiDirective implements OnInit, OnDestroy {
  @Input('getWeatherLongitude') set longitude(option: number) {
    // 'getWeatherLongitude' is to get the Longitude value passed with the directive, where getWeather is directive name and Longitude represnts the input name (So smart thing from Google team)
    this.longitude$.next(option);
  }
  @Input('getWeatherLatitude') set latitude(option: number) {
    this.latitude$.next(option);
  }
  private longitude$ = new ReplaySubject(1);
  private latitude$ = new ReplaySubject(1);
  private viewRef: EmbeddedViewRef<WeatherContext>;
  private context: WeatherContext;
  private unSubscribe$ = new Subject();
  constructor(
    private templateRef: TemplateRef<WeatherContext>,
    private vcr: ViewContainerRef,
    private http: HttpClient
  ) {}

  public ngOnInit(): void {
    combineLatest([this.longitude$, this.latitude$])
      .pipe(
        switchMap(([longitude, latitude]) => {
          return this.http.get<WeatherModel>(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`
          );
        }),
        takeUntil(this.unSubscribe$) // better to have it as the last operator inside the map (for many reasons)
      )
      .subscribe(
        (data) => {
          if (!this.viewRef) {
            this.context = {
              $implicit: data,
            };
            // to create actual view and put it it's container wherever it's called
            this.viewRef = this.vcr.createEmbeddedView(
              this.templateRef,
              this.context
            );
          } else {
            this.context.$implicit = data; // we need to mutate the context because this is binded to viewRef
          }
          this.viewRef.markForCheck(); // viewRef is inherited from CD that's why we can call markForCheck() directly on it
          // to inform angular that this component has been changed
        },
        null,
        () => {
          this.viewRef.destroy();
        }
      );
  }
  ngOnDestroy() {
    this.unSubscribe$.next('');
    this.unSubscribe$.complete();
  }
}
