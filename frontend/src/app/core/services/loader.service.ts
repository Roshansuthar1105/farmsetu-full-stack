import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  private _isLoading = signal<boolean>(false);
  public isLoading = this._isLoading.asReadonly();
  
  private activeRequestIds = new Set<string>();

  show(): string {
    const id = Math.random().toString(36).substring(2, 9);
    this.activeRequestIds.add(id);
    this._isLoading.set(true);

    // Safety timeout: auto-remove this request after 10 seconds if not cleared to prevent UI lockup
    setTimeout(() => {
      if (this.activeRequestIds.has(id)) {
        console.warn(`Loader safety timeout reached for request: ${id}. Auto-hiding.`);
        this.hide(id);
      }
    }, 10000);

    return id;
  }

  hide(id?: string) {
    if (id) {
      this.activeRequestIds.delete(id);
    } else if (this.activeRequestIds.size > 0) {
      // Fallback if no ID is passed: delete the first active request ID
      const firstId = this.activeRequestIds.values().next().value;
      if (firstId) {
        this.activeRequestIds.delete(firstId);
      }
    }
    
    if (this.activeRequestIds.size === 0) {
      this._isLoading.set(false);
    }
  }
}
