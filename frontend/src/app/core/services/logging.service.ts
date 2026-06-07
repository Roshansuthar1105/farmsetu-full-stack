import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  
  log(message: string, ...optionalParams: any[]) {
    if (isDevMode()) {
      console.log(`[LOG] ${message}`, ...optionalParams);
    }
  }

  error(message: string, ...optionalParams: any[]) {
    // We could send this to a remote logging server like Datadog or Sentry
    console.error(`[ERROR] ${message}`, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    if (isDevMode()) {
      console.warn(`[WARN] ${message}`, ...optionalParams);
    }
  }
}
