# E-Commerce Application

A modern, full-featured e-commerce application built with Angular 21, featuring a comprehensive admin panel, user authentication, and a responsive client-facing storefront.

## 🚀 Features

### Client Features

- **Home Page**: Landing page with featured products and categories
- **Product Catalog**: Browse products with pagination support
- **Product Details**: Detailed product view with image zoom functionality
- **Category Browsing**: Filter products by categories with pagination
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode**: Toggle between light and dark themes with persistent preferences

### Authentication

- **User Registration**: Create new user accounts
- **Login/Logout**: Secure authentication with JWT tokens
- **Password Recovery**: Forgot password and reset password functionality
- **Modal-based Auth**: Seamless authentication without leaving the current page
- **Token Refresh**: Automatic token refresh on 401 responses

### Admin Panel

- **Dashboard**: Overview of key metrics and statistics
- **Product Management**:
  - Create, read, update, and delete products
  - Manage product images (upload, view, delete)
  - Pagination for product listings
- **Category Management**: Full CRUD operations for product categories
- **User Management**: Manage user accounts and permissions
- **Protected Routes**: Admin-only access with route guards

## 🛠️ Technology Stack

- **Framework**: Angular 21.0.0
- **Language**: TypeScript 5.9.2
- **Styling**: TailwindCSS 4.1.17 with custom SCSS
- **HTTP Client**: Angular HttpClient with RxJS Observables
- **Routing**: Angular Router with lazy loading
- **State Management**: RxJS for reactive state management
- **Build Tool**: Angular CLI with Vite
- **Testing**: Vitest 4.0.8

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **npm**: Version 10.9.2 or higher (comes with Node.js)
- **Angular CLI**: Version 21.0.1 or higher

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Ecommerce
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Update the environment files in `src/environments/` with your API endpoints and configuration:

   - `environment.ts` - Development environment
   - `environment.prod.ts` - Production environment

## 🚀 Development

### Start Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload when you make changes to the source files.

### Build for Production

```bash
npm run build
# or
ng build
```

The build artifacts will be stored in the `dist/` directory, optimized for production deployment.

### Watch Mode

For continuous building during development:

```bash
npm run watch
```

## 🧪 Testing

Run unit tests with Vitest:

```bash
npm test
# or
ng test
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core functionality
│   │   ├── guards/              # Route guards (auth, admin)
│   │   ├── interceptors/        # HTTP interceptors (JWT, refresh token)
│   │   ├── models/              # Data models and interfaces
│   │   └── services/            # Core services (auth, products, categories, etc.)
│   ├── features/                # Feature modules
│   │   ├── admin/               # Admin panel features
│   │   │   ├── dashboard/       # Admin dashboard
│   │   │   ├── products/        # Product management
│   │   │   ├── categories/      # Category management
│   │   │   └── users/           # User management
│   │   ├── auth/                # Authentication features
│   │   │   ├── login/           # Login modal
│   │   │   ├── register/        # Registration modal
│   │   │   ├── forgot-password/ # Password recovery
│   │   │   └── reset-password/  # Password reset
│   │   └── client/              # Client-facing features
│   │       ├── home/            # Home page
│   │       ├── products/        # Product catalog
│   │       ├── product-detail/  # Product details
│   │       └── category-list/   # Category browsing
│   └── shared/                  # Shared components and utilities
├── environments/                # Environment configurations
└── styles.scss                  # Global styles
```

## 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **HTTP Interceptor**: Automatically attaches JWT tokens to requests
- **Token Refresh**: Automatic token refresh on expiration
- **Route Guards**: Protect admin routes from unauthorized access
- **Role-based Access**: Different permissions for users and admins

## 🎨 Styling & Theming

- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **Custom SCSS**: Additional custom styles and variables
- **Dark Mode**: System-wide dark mode with localStorage persistence
- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Glassmorphism**: Modern UI effects for a premium look

## 📦 Key Dependencies

- `@angular/core`: ^21.0.0
- `@angular/router`: ^21.0.0
- `@angular/forms`: ^21.0.0
- `tailwindcss`: ^4.1.17
- `rxjs`: ~7.8.0

## 🔄 State Management

The application uses RxJS Observables for reactive state management:

- Services expose data as Observables
- Components subscribe to data streams
- Automatic cleanup with async pipe
- Efficient change detection

## 🌐 API Integration

All services are configured to work with a RESTful API backend. Key services include:

- **AuthService**: User authentication and token management
- **ProductService**: Product CRUD operations
- **CategoryService**: Category management
- **UserService**: User management
- **UploadService**: File upload handling

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🚧 Development Guidelines

### Code Style

- Follow Angular style guide
- Use Prettier for code formatting (configured in package.json)
- TypeScript strict mode enabled
- Component-based architecture

### Component Generation

```bash
ng generate component component-name
ng generate service service-name
ng generate guard guard-name
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Luis** - Initial work

## 🙏 Acknowledgments

- Angular team for the amazing framework
- TailwindCSS for the utility-first CSS framework
- Community contributors and open-source projects

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

Built with ❤️ using Angular 21
