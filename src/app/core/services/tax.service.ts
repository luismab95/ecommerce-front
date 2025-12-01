import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaxService {
  // Tax rates by state (percentage)
  private taxRates: { [key: string]: number } = {
    CA: 8.25, // California
    TX: 6.25, // Texas
    FL: 6.0, // Florida
    NY: 8.0, // New York
    IL: 6.25, // Illinois
    PA: 6.0, // Pennsylvania
    OH: 5.75, // Ohio
    GA: 4.0, // Georgia
    NC: 4.75, // North Carolina
    MI: 6.0, // Michigan
    DEFAULT: 7.0, // Default tax rate for other states
  };

  // Calculate tax based on subtotal and state
  calculateTax(subtotal: number, state: string): Observable<number> {
    const stateCode = state.toUpperCase();
    const taxRate = this.taxRates[stateCode] || this.taxRates['DEFAULT'];
    const taxAmount = (subtotal * taxRate) / 100;
    return of(parseFloat(taxAmount.toFixed(2)));
  }

  // Get tax rate for a specific state
  getTaxRate(state: string): Observable<number> {
    const stateCode = state.toUpperCase();
    const taxRate = this.taxRates[stateCode] || this.taxRates['DEFAULT'];
    return of(taxRate);
  }

  // Calculate shipping cost based on subtotal (free shipping over $100)
  calculateShipping(subtotal: number): Observable<number> {
    const shippingCost = subtotal >= 100 ? 0 : 10;
    return of(shippingCost);
  }
}
