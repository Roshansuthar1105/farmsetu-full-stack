import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '@core/services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  // Skip loader for specific requests if needed via a custom header, e.g. 'X-Skip-Loader'
  if (req.headers.has('X-Skip-Loader')) {
    const headers = req.headers.delete('X-Skip-Loader');
    return next(req.clone({ headers }));
  }

  loaderService.show();

  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};
