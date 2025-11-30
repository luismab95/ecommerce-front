import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  User,
  PaginationParams,
  PaginatedResponse,
  GeneralResponse,
  UserProfile,
  UpdateUserProfileRequest,
  Address,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  // Simulated profile storage (in a real app, this would be handled by the backend)
  private mockProfile: UserProfile | null = null;

  // Get users with pagination and filters
  getUsers(params: PaginationParams): Observable<GeneralResponse<PaginatedResponse<User[]>>> {
    let queryParams = new HttpParams();

    if (params.searchTerm) {
      queryParams = queryParams.append('SearchTerm', params.searchTerm);
    }
    // Pagination parameters
    if (params.pageNumber !== undefined) {
      queryParams = queryParams.append('PageNumber', params.pageNumber.toString());
    }

    if (params.pageSize !== undefined) {
      queryParams = queryParams.append('PageSize', params.pageSize.toString());
    }

    return this.http.get<GeneralResponse<PaginatedResponse<User[]>>>(`${this.apiUrl}/users`, {
      params: queryParams,
    });
  }

  // Get user by ID
  getUserById(id: number): Observable<GeneralResponse<User>> {
    return this.http.get<GeneralResponse<User>>(`${this.apiUrl}/users/${id}`);
  }

  // Update user profile
  updateProfile(id: number, updateUser: Partial<User>): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/users/profile/${id}`, updateUser);
  }

  // Update user role (Admin only)
  updateUserRole(id: number): Observable<GeneralResponse<string>> {
    return this.http.put<GeneralResponse<string>>(`${this.apiUrl}/users/role/${id}`, {});
  }

  // Delete user (Admin only)
  deleteUser(id: number): Observable<GeneralResponse<string>> {
    return this.http.delete<GeneralResponse<string>>(`${this.apiUrl}/users/${id}`);
  }

  // Get user profile with addresses (simulated)
  getUserProfile(): Observable<GeneralResponse<UserProfile>> {
    return of(null).pipe(
      delay(500),
      map(() => {
        // Get current user from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('Usuario no autenticado');
        }

        const user = JSON.parse(userStr);

        // If we have a mock profile, use it; otherwise create default
        if (!this.mockProfile) {
          this.mockProfile = {
            ...user,
            shippingAddress: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA',
            },
            billingAddress: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA',
            },
          };
        }

        return {
          data: this.mockProfile,
          message: 'Perfil obtenido exitosamente',
        } as GeneralResponse<UserProfile>;
      })
    );
  }

  // Update user profile (simulated)
  updateUserProfile(request: UpdateUserProfileRequest): Observable<GeneralResponse<UserProfile>> {
    return of(request).pipe(
      delay(1000),
      map((req) => {
        // Get current user from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('Usuario no autenticado');
        }

        const user = JSON.parse(userStr);

        // Update mock profile
        if (!this.mockProfile) {
          this.mockProfile = { ...user };
        }

        // Apply updates
        if (req.firstName) this.mockProfile!.firstName = req.firstName;
        if (req.lastName) this.mockProfile!.lastName = req.lastName;
        if (req.email) this.mockProfile!.email = req.email;
        if (req.shippingAddress) this.mockProfile!.shippingAddress = req.shippingAddress;
        if (req.billingAddress) this.mockProfile!.billingAddress = req.billingAddress;

        // Update user in localStorage
        const updatedUser = {
          ...user,
          firstName: this.mockProfile!.firstName,
          lastName: this.mockProfile!.lastName,
          email: this.mockProfile!.email,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        return {
          data: this.mockProfile,
          message: 'Perfil actualizado exitosamente',
        } as GeneralResponse<UserProfile>;
      })
    );
  }
}
