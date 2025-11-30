import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserProfile } from '../../../core/models/models';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  imports: [ReactiveFormsModule],
})
export class ProfileComponent implements OnInit {
  activeTab = signal<'personal' | 'shipping' | 'billing'>('personal');
  loading = signal(false);
  saving = signal(false);
  profile = signal<UserProfile | null>(null);

  personalForm!: FormGroup;
  shippingForm!: FormGroup;
  billingForm!: FormGroup;
  sameAsShipping = signal(false);

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  initializeForms(): void {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    });

    this.shippingForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
    });

    this.billingForm = this.fb.group({
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['', Validators.required],
    });
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getUserProfile().subscribe({
      next: (response) => {
        this.profile.set(response.data);
        this.populateForms(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.notificationService.showError('Error al cargar el perfil');
        this.loading.set(false);
      },
    });
  }

  populateForms(profile: UserProfile): void {
    this.personalForm.patchValue({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
    });

    if (profile.shippingAddress) {
      this.shippingForm.patchValue(profile.shippingAddress);
    }

    if (profile.billingAddress) {
      this.billingForm.patchValue(profile.billingAddress);
    }
  }

  setActiveTab(tab: 'personal' | 'shipping' | 'billing'): void {
    this.activeTab.set(tab);
  }

  toggleSameAsShipping(): void {
    const newValue = !this.sameAsShipping();
    this.sameAsShipping.set(newValue);

    if (newValue) {
      this.billingForm.patchValue(this.shippingForm.value);
    }
  }

  savePersonalInfo(): void {
    if (this.personalForm.invalid) {
      this.notificationService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.saving.set(true);
    this.userService.updateUserProfile(this.personalForm.value).subscribe({
      next: (response) => {
        this.profile.set(response.data);
        this.notificationService.showSuccess(response.message);
        this.saving.set(false);
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.notificationService.showError('Error al actualizar el perfil');
        this.saving.set(false);
      },
    });
  }

  saveShippingAddress(): void {
    if (this.shippingForm.invalid) {
      this.notificationService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.saving.set(true);
    this.userService
      .updateUserProfile({
        shippingAddress: this.shippingForm.value,
      })
      .subscribe({
        next: (response) => {
          this.profile.set(response.data);
          this.notificationService.showSuccess(response.message);
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error updating shipping address:', error);
          this.notificationService.showError('Error al actualizar la dirección de envío');
          this.saving.set(false);
        },
      });
  }

  saveBillingAddress(): void {
    if (this.billingForm.invalid) {
      this.notificationService.showError('Por favor completa todos los campos correctamente');
      return;
    }

    this.saving.set(true);
    this.userService
      .updateUserProfile({
        billingAddress: this.billingForm.value,
      })
      .subscribe({
        next: (response) => {
          this.profile.set(response.data);
          this.notificationService.showSuccess(response.message);
          this.saving.set(false);
        },
        error: (error) => {
          console.error('Error updating billing address:', error);
          this.notificationService.showError('Error al actualizar la dirección de facturación');
          this.saving.set(false);
        },
      });
  }
}
