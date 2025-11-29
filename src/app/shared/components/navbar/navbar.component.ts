import { Component, signal } from '@angular/core';

import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styles: [],
})
export class NavbarComponent {
  mobileMenuOpen = signal(false);

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    public modalService: AuthModalService
  ) {}

  logout(): void {
    this.authService.logout().subscribe();
  }

  openLoginModal(): void {
    this.modalService.openLogin();
    this.mobileMenuOpen.set(false);
  }

  openRegisterModal(): void {
    this.modalService.openRegister();
    this.mobileMenuOpen.set(false);
  }
}
