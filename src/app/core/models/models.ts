// User Roles
export enum UserRole {
  CLIENTE = 'Cliente',
  ADMINISTRADOR = 'Administrador',
}

// User Interface
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Auth Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  token: string;
}

// Product Interface
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  category?: Category;
  images: ProductImage[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: number;
  path: string;
  productId: number;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: number;
  featured?: boolean;
  images?: ProductImage[];
}

export interface ProductListParams extends PaginationParams {
  priceMax?: number;
  priceMin?: number;
  categoryId?: string;
  featured?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

// Category Interface
export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Pagination
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
}

export interface PaginatedResponse<T> {
  items: T;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Upload Interface
export interface UploadImageRequest {
  file: File;
  productId: string;
}

export interface UploadImageResponse {
  imageId: string;
  url: string;
}

export type ConfirmType = 'danger' | 'warning' | 'info';

export interface GeneralResponse<T> {
  data: T;
  message: string;
}
