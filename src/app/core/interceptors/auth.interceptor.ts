import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  // Get the token from the auth service
  const token = authService.getToken();

  // Clone the request and add the Authorization header if token exists
  let authReq = req;
  if (token && authService.isAuthenticated()) {
    authReq = addTokenToRequest(req, token);
  }

  // Handle the request and catch any errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors with token refresh
      if (error.status === 401 && authService.isAuthenticated()) {
        return handle401Error(authReq, next, authService, notificationService, router);
      }

      // Handle other errors
      return handleOtherErrors(error, notificationService, authService, router);
    })
  );
};

function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error(
  request: HttpRequest<any>,
  next: any,
  authService: AuthService,
  notificationService: NotificationService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((response): Observable<HttpEvent<unknown>> => {
        isRefreshing = false;
        const newToken = response.data;
        refreshTokenSubject.next(newToken);

        // Retry the original request with the new token
        return next(addTokenToRequest(request, newToken));
      }),
      catchError((refreshError) => {
        isRefreshing = false;
        refreshTokenSubject.next(null);

        // Refresh token failed, logout user
        notificationService.showError(
          'Sesión expirada. Por favor, inicia sesión nuevamente.',
          5000
        );
        authService.logout().subscribe();
        router.navigate(['/']);

        return throwError(() => refreshError);
      })
    );
  } else {
    // Wait for the token to be refreshed
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token): Observable<HttpEvent<unknown>> => {
        return next(addTokenToRequest(request, token!));
      })
    );
  }
}

function handleOtherErrors(
  error: HttpErrorResponse,
  notificationService: NotificationService,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  let errorMessage = 'Ha ocurrido un error';

  if (error.error instanceof ErrorEvent) {
    // Client-side or network error
    errorMessage = `Error de red: ${error.error.message}`;
  } else {
    // Backend error
    switch (error.status) {
      case 0:
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
        break;
      case 401:
        errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        break;
      case 403:
        errorMessage = 'No tienes permisos para realizar esta acción.';
        break;
      case 404:
        errorMessage = 'Recurso no encontrado.';
        break;
      case 500:
        errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
        break;
      case 503:
        errorMessage = 'Servicio no disponible. Por favor, intenta más tarde.';
        break;
      default:
        // Try to get error message from backend response
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
    }
  }

  // Show error notification
  notificationService.showError(errorMessage, 5000);

  // Re-throw the error so components can handle it if needed
  return throwError(() => error);
}
