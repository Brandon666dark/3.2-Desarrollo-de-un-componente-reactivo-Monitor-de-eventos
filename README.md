# ReactiveEventMonitor

Requisitos: Node.js 18.19+ o 20+.

    npm install
    npm start      # http://localhost:4200

## Uso de observables
- `interval(1000)` es un observable que emite 0,1,2... cada segundo (solo cuando alguien se suscribe).
- `start()` crea UNA suscripción; `stop()` la cancela con `unsubscribe()`, lo que detiene el temporizador.
- El estado (contador, estado, historial) vive en `BehaviorSubject`, que guardan el último valor y notifican cambios.
- `combineLatest` junta esos flujos en `vm$`; la plantilla lo consume con `async` pipe, que se suscribe y desuscribe automáticamente.
- `ngOnDestroy` llama a `stop()` para no dejar procesos activos al destruir el componente.
