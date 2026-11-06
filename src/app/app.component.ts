import { Component, OnDestroy } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { BehaviorSubject, Subscription, combineLatest, interval, map } from 'rxjs';

export interface MonitorEvent {
  id: number;
  value: number;
  time: Date;
}

const MAX_EVENTS = 10;
const TICK_MS = 1000;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnDestroy {
  /** Observable "frío": cada suscripción crea su propio temporizador. */
  private readonly tick$ = interval(TICK_MS);

  /** Única suscripción activa al temporizador (null cuando está detenido). */
  private subscription: Subscription | null = null;

  private eventId = 0;

  /** Estado de la aplicación expuesto como flujos (BehaviorSubject = observable con valor actual). */
  private readonly counterSubject = new BehaviorSubject<number>(0);
  private readonly runningSubject = new BehaviorSubject<boolean>(false);
  private readonly eventsSubject = new BehaviorSubject<MonitorEvent[]>([]);
  private readonly totalSubject = new BehaviorSubject<number>(0);

  /** Un solo flujo combinado para la vista; se consume con async pipe (se desuscribe solo). */
  readonly vm$ = combineLatest({
    counter: this.counterSubject,
    running: this.runningSubject,
    events: this.eventsSubject,
    total: this.totalSubject
  }).pipe(
    map(vm => ({
      ...vm,
      lastEvent: vm.events[0] ?? null,
      activeSubscriptions: vm.running ? 1 : 0
    }))
  );

  start(): void {
    if (this.subscription && !this.subscription.closed) return; // evita suscripciones duplicadas

    this.runningSubject.next(true);
    this.subscription = this.tick$.subscribe(() => {
      const value = this.counterSubject.value + 1;
      this.counterSubject.next(value);
      this.totalSubject.next(this.totalSubject.value + 1);

      const event: MonitorEvent = { id: ++this.eventId, value, time: new Date() };
      this.eventsSubject.next([event, ...this.eventsSubject.value].slice(0, MAX_EVENTS));
    });
  }

  stop(): void {
    this.subscription?.unsubscribe(); // cancela el interval()
    this.subscription = null;
    this.runningSubject.next(false);
  }

  reset(): void {
    this.stop();
    this.eventId = 0;
    this.counterSubject.next(0);
    this.totalSubject.next(0);
    this.eventsSubject.next([]);
  }

  trackEvent(_: number, e: MonitorEvent): number {
    return e.id;
  }

  ngOnDestroy(): void {
    this.stop(); // limpieza al destruir el componente
  }
}
