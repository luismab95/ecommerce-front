import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { LoginComponent } from '../../auth/login/login.component';
import { RegisterComponent } from '../../auth/register/register.component';
import { ForgotPasswordComponent } from '../../auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../../auth/reset-password/reset-password.component';
import { WishlistService } from '../../../core/services/wishlist.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
  ],
  templateUrl: './client-layout.component.html',
  styles: [],
})
export class ClientLayoutComponent {
  private readonly _wishlistService = inject(WishlistService);

  constructor() {
    this._wishlistService.getWishlist(4).subscribe();
  }
}
