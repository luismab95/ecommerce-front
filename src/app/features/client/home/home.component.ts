import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { Product, Category } from '../../../core/models/models';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [RouterLink, LoadingComponent],
})
export class HomeComponent implements OnInit {
  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  ngOnInit() {
    forkJoin({
      featuredResponse: this.productService.getFeaturedProducts(),
      categoriesResponse: this.categoryService.getCategories({ pageNumber: 1, pageSize: 5 }),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ featuredResponse, categoriesResponse }) => {
          this.featuredProducts.set(featuredResponse.data.items);
          this.categories.set(categoriesResponse.data.items);
        },
      });
  }
}
