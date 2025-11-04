
# PRO PDF - Professional PDF Converter & Editor

A comprehensive, secure, and feature-rich PDF processing web application built with Next.js 14, TypeScript, and modern web technologies.

![PRO PDF](./public/og-image.png)

## 🌟 Features

### Core PDF Tools
- **Convert PDF**: Transform PDFs to images or extract text content
- **Merge PDF**: Combine multiple PDF files into a single document
- **Split PDF**: Separate PDFs into individual pages or custom ranges
- **Compress PDF**: Reduce file size while maintaining quality
- **Protect PDF**: Add password encryption to secure your documents
- **Sign PDF**: Add digital signatures with drawing or text
- **Decrypt PDF**: Remove password protection from encrypted PDFs

### User Experience
- 🌓 **Dark/Light Theme**: Toggle between light and dark modes
- 🌍 **Multi-Language Support**: English, Spanish, French, German, Italian, Chinese, Arabic, and Hindi
- 💬 **AI Chatbot Assistant**: Intelligent help system powered by LLM
- 📱 **Responsive Design**: Optimized for all screen sizes
- 🎯 **Intuitive UI**: Clean, modern interface with smooth animations

### Security & Privacy
- 🔐 **End-to-End Encryption**: Client-side processing for maximum privacy
- 🔑 **Two-Factor Authentication (2FA)**: Enhanced account security
- 📧 **Email Verification**: Secure account activation
- 🔒 **Session Management**: Advanced security features
- 🛡️ **Rate Limiting**: Protection against abuse
- 📊 **GDPR/HIPAA/PIPEDA Compliant**: Data protection standards

### Authentication & User Management
- User registration and login
- Password reset functionality
- Email verification
- 2FA setup and management
- Secure session handling
- Account settings and preferences

### Additional Features
- ☁️ **Cloud Storage**: Secure file storage integration
- 💳 **Subscription Plans**: Free and Pro tiers with Stripe integration
- 📊 **Dashboard**: Track your usage and manage files
- 🔄 **Scheduled Jobs**: Automate repetitive tasks
- 📜 **Comprehensive Logging**: Activity tracking
- 🍪 **Cookie Consent**: GDPR-compliant cookie management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Yarn package manager

### Installation

1. **Clone the repository** (or download the project files)
   ```bash
   cd /home/ubuntu/pro_pdf/nextjs_space
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `nextjs_space` directory with the following variables:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/propdf"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # AWS S3 Storage (Optional - for cloud file storage)
   AWS_BUCKET_NAME="your-bucket-name"
   AWS_FOLDER_PREFIX="propdf/"
   
   # Stripe (Optional - for payments)
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PRICE_ID_PRO="price_..."
   
   # Email (Optional - for notifications)
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   SMTP_FROM="noreply@propdf.com"
   
   # LLM API (For chatbot - automatically configured)
   ABACUSAI_API_KEY="your-api-key"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   yarn prisma generate
   
   # Run database migrations
   yarn prisma db push
   
   # Seed the database with initial data
   yarn prisma db seed
   ```

5. **Run the development server**
   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
nextjs_space/
├── app/                      # Next.js 14 App Router
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── chatbot/         # AI assistant endpoint
│   │   ├── jobs/            # Scheduled jobs
│   │   ├── sessions/        # Session management
│   │   ├── user/            # User data & settings
│   │   └── webhooks/        # Stripe webhooks
│   ├── auth/                # Auth pages (login, signup)
│   ├── dashboard/           # User dashboard
│   ├── tools/               # PDF tool pages
│   │   ├── convert/
│   │   ├── merge/
│   │   ├── split/
│   │   ├── compress/
│   │   ├── encrypt/
│   │   ├── decrypt/
│   │   └── sign/
│   └── [other pages]/       # About, Pricing, Help, etc.
├── components/              # React components
│   ├── ui/                  # Shadcn UI components
│   ├── auth/                # Auth forms
│   ├── dashboard/           # Dashboard components
│   └── [other components]/
├── lib/                     # Utility libraries
│   ├── pdf-utils/          # PDF processing logic
│   ├── i18n/               # Internationalization
│   ├── auth.ts             # Auth configuration
│   ├── db.ts               # Database client
│   ├── encryption.ts       # Encryption utilities
│   └── [other utilities]/
├── prisma/                  # Database schema
│   └── schema.prisma
├── public/                  # Static assets
│   └── workers/            # Web Workers for PDF processing
└── e2e/                     # Playwright E2E tests
```

## 🧪 Testing

### Run E2E Tests
```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
yarn playwright test

# Run tests with UI
yarn playwright test --ui

# Run specific test file
yarn playwright test e2e/auth.spec.ts
```

### Test Coverage
- Authentication flows (login, signup, 2FA)
- Dashboard functionality
- Theme switching
- Language switching
- PDF tool operations
- Session management

## 📦 Building for Production

```bash
# Build the application
yarn build

# Start production server
yarn start
```

## 🔧 Configuration

### Database Schema
The application uses Prisma ORM with PostgreSQL. Key models:
- **User**: User accounts with auth details
- **Session**: Active user sessions
- **UploadSession**: File upload tracking
- **ScheduledJob**: Automated task configuration

### Authentication
Built with NextAuth.js (next-auth v4):
- Credentials provider for email/password
- Session-based authentication
- Custom pages for login/signup
- Email verification
- Password reset flow
- 2FA support

### Internationalization
Multi-language support using React Context:
- Translation files in `lib/i18n/translations.ts`
- Language switcher component
- Persistent language preference

### PDF Processing
Client-side processing using:
- **pdf-lib**: PDF manipulation
- **Web Workers**: Background processing
- **Canvas API**: Image conversion
- Real-time progress tracking

## 🔐 Security Features

### Data Protection
- Client-side PDF processing (files never sent to server)
- Password encryption with bcrypt
- Secure session management
- CSRF protection
- XSS prevention
- SQL injection protection

### Compliance
- **GDPR**: Right to access, delete, and export data
- **HIPAA**: Encrypted data storage and transmission
- **PIPEDA**: Privacy by design principles
- Cookie consent management
- Privacy policy and terms of service

### Rate Limiting
- API endpoint protection
- Prevents abuse and DDoS attacks
- Configurable limits per endpoint

## 🎨 Customization

### Theme Customization
Edit `app/globals.css` to customize colors and styles:
```css
@layer base {
  :root {
    --primary: 222.2 47.4% 11.2%;
    /* ... other CSS variables */
  }
}
```

### Adding New Languages
1. Add translations to `lib/i18n/translations.ts`
2. Update the language options in `components/language-switcher.tsx`

### Adding New PDF Tools
1. Create a new route in `app/tools/[tool-name]/page.tsx`
2. Implement the tool logic in `lib/pdf-utils/pdf-processor.ts`
3. Add the tool to the homepage features section

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/signup` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/reset-password` - Password reset

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/setup-2fa` - Enable 2FA
- `DELETE /api/user/account` - Delete account
- `GET /api/user/data-export` - Export user data (GDPR)

### Chatbot
- `POST /api/chatbot` - Send message to AI assistant

### Sessions
- `GET /api/sessions` - List upload sessions
- `POST /api/sessions` - Create new session
- `DELETE /api/sessions/:id` - Delete session

## 🤝 Support

For issues, questions, or feature requests:
- Check the Help page in the application
- Use the AI Chatbot Assistant for quick answers
- Review the Terms of Service and Privacy Policy

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [pdf-lib](https://pdf-lib.js.org/)
- [Stripe](https://stripe.com/)
- [Playwright](https://playwright.dev/)

---

**PRO PDF** - Professional PDF Tools for Everyone 🚀
