import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();
  
  private activeRequests = 0;

  show() {
    this.activeRequests++;
    this._isLoading.set(true);
  }

  hide() {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0;
      this._isLoading.set(false);
    }
  }
}
