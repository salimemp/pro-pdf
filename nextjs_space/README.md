
# PRO PDF - Professional PDF Converter & Editor

[![CI/CD Pipeline](https://github.com/salimemp/pro-pdf/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/salimemp/pro-pdf/actions/workflows/ci-cd.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive, secure, and feature-rich PDF processing web application built with Next.js 14, TypeScript, and modern web technologies.

![PRO PDF](./public/og-image.png)

## 📊 Feature Overview

| Category | Tools |
|----------|-------|
| **Core PDF Tools** | 14 tools (Convert, Merge, Split, Compress, etc.) |
| **Advanced Features** | 6 tools (Annotations, AI Summary, Stamps, Compare, Redact, Fill & Sign) |
| **AI-Powered** | 2 features (AI Summary, Chatbot Assistant) |
| **Security Tools** | 4 features (Encrypt, Decrypt, Redact, Password Protection) |
| **Collaboration** | 3 features (Annotations, Comments, Stamps) |
| **Total PDF Tools** | **20+ comprehensive tools** |

## 🆕 What's New in Latest Release

### Version 2.0 - Advanced PDF Suite (December 2025)

**🚀 Major Features:**
- ✅ PDF Annotations & Comments system with drawing tools
- ✅ AI-Powered PDF Summary with Abacus.AI integration
- ✅ Professional Document Stamps (8 pre-defined + custom)
- ✅ PDF Comparison tool with side-by-side diff visualization
- ✅ Redaction tool for permanently removing sensitive data
- ✅ Fill & Sign forms with digital signature support

**♿ Accessibility Enhancements:**
- ✅ WCAG 2.1 compliant accessibility controls
- ✅ High contrast mode
- ✅ Text-to-speech reader
- ✅ Keyboard shortcuts and screen reader support

**🎨 UX Improvements:**
- ✅ Interactive onboarding with 6-slide tutorial
- ✅ Rollback/undo feature for PDF operations
- ✅ Professional pill-shaped accessibility button
- ✅ Floating AI chatbot assistant

**📊 Dashboard Updates:**
- ✅ 12 tools available from dashboard (6 new + 6 existing)
- ✅ Color-coded tool cards with unique gradients
- ✅ Quick file upload and tool selection

**🔒 Security:**
- ✅ Password breach checking with HIBP integration
- ✅ 7-day refund policy update
- ✅ Enhanced security activity logging

**🧪 Quality:**
- ✅ Comprehensive E2E test suite with Playwright
- ✅ CI/CD pipeline with GitHub Actions
- ✅ Monitoring with Prometheus + Grafana Cloud

## 🌟 Features

### Core PDF Tools
- **Convert PDF**: Transform PDFs to images, text, Word, Excel, PowerPoint, CSV, or Markdown
- **HTML to PDF**: Convert web pages and HTML content to PDF documents
- **Merge PDF**: Combine multiple PDF files into a single document
- **Split PDF**: Separate PDFs into individual pages or custom ranges
- **Compress PDF**: Reduce file size while maintaining quality
- **Protect PDF**: Add password encryption to secure your documents
- **Sign PDF**: Add digital signatures with drawing or text
- **Decrypt PDF**: Remove password protection from encrypted PDFs
- **Rotate PDF**: Rotate pages clockwise or counterclockwise
- **Watermark PDF**: Add text or image watermarks to your documents
- **Page Numbers**: Add customizable page numbers to PDFs
- **Organize PDF**: Reorder, remove, or rearrange PDF pages
- **Crop PDF**: Trim and adjust PDF page margins
- **Edit PDF**: Modify text and content in PDF documents

### 🆕 Advanced PDF Tools

#### Collaboration & Annotation
- **📝 Annotations & Comments**: Add text comments, highlights, shapes (rectangles, circles, arrows), and sticky notes to PDFs
  - Interactive canvas-based drawing tools
  - 6 professional color options
  - Undo/Redo functionality with full history
  - Multi-page annotation support
  - Export annotated PDFs with embedded annotations

#### AI-Powered Features
- **🤖 AI Summary**: Generate intelligent document summaries powered by Abacus.AI LLM APIs
  - Quick 2-3 sentence overview
  - Extract 5-7 key points automatically
  - Identify 3-5 deeper insights and implications
  - Generate 3-5 actionable recommendations
  - Sentiment analysis (Positive/Neutral/Negative/Mixed)
  - Word count and reading time estimation
  - Tabbed interface for easy navigation
  - Export summaries to text files

#### Document Management
- **🏷️ Professional Stamps**: Add official stamps to documents
  - 8 pre-defined stamps: APPROVED, REJECTED, CONFIDENTIAL, DRAFT, REVIEWED, URGENT, FINAL, VOID
  - Custom text stamps with any text
  - Image stamp upload (logos, signatures)
  - Include date and user name options
  - Color-coded stamps by type
  - Multi-page stamp placement

#### Comparison & Analysis
- **🔍 PDF Compare**: Side-by-side document comparison
  - Three-panel view (Document 1, Document 2, Differences)
  - Pixel-level difference detection
  - Highlight changes in red overlay
  - Page-by-page navigation
  - Difference count and tracking
  - Generate comparison reports
  - Detect page count differences

#### Security & Privacy
- **⬛ Redact PDF**: Permanently remove sensitive information
  - Manual redaction with click-and-drag selection
  - Search and redact specific terms automatically
  - Multi-page redaction support
  - Redaction area management and preview
  - Permanent black-out with no recovery
  - Safety warnings and confirmation

#### Form Processing
- **🖊️ Fill & Sign**: Complete and sign PDF forms digitally
  - Add text fields with custom content
  - Insert date fields (auto-populated)
  - Add checkboxes
  - Draw digital signatures with mouse/touch
  - Save and reuse signatures
  - Multi-page form support
  - Field tracking and management

### User Experience
- 🌓 **Dark/Light Theme**: Toggle between light and dark modes
- 🌍 **Multi-Language Support**: English, Spanish, French, German, Italian, Chinese, Arabic, and Hindi
- 💬 **AI Chatbot Assistant**: Intelligent help system powered by LLM (bottom-right floating chatbot)
- ♿ **Accessibility Features**: WCAG 2.1 compliant with comprehensive accessibility controls
  - High contrast mode for better visibility
  - Text-to-speech reader for document content
  - Keyboard shortcuts (Ctrl+Shift+C for contrast, Ctrl+Shift+R for read aloud, Escape to stop)
  - Screen reader support with ARIA live regions
  - Professional pill-shaped accessibility button (bottom-left)
  - Skip navigation links for keyboard users
- 🎬 **Interactive Onboarding**: 6-slide welcome tutorial for new users
- 📱 **Responsive Design**: Optimized for all screen sizes
- 🎯 **Intuitive UI**: Clean, modern interface with smooth animations
- 🔄 **Rollback Feature**: Undo PDF operations within 1-hour window (up to 10 operations)

### Security & Privacy
- 🔐 **End-to-End Encryption**: Client-side processing for maximum privacy
- 🔑 **Two-Factor Authentication (2FA)**: Enhanced account security with QR code setup
- 📧 **Email Verification**: Secure account activation and password reset
- 🔒 **Session Management**: Advanced security features with activity monitoring
- 🛡️ **Rate Limiting**: Protection against abuse and DDoS attacks
- 📊 **GDPR/HIPAA/PIPEDA Compliant**: Data protection standards
- 🔐 **Strong Password Validation**: Real-time password strength checking with visual feedback
- 🎲 **Password Generator**: Generate cryptographically secure passwords
- 📋 **Security Activity Log**: Monitor all security-related events on your account
- ⚠️ **Email Alerts**: Receive notifications for suspicious activity, account lockouts, and security events
- 🛡️ **Security Dashboard**: Comprehensive view of account security and recent activity

### Authentication & User Management
- User registration and login
- Password reset functionality
- Email verification
- 2FA setup and management
- Secure session handling
- Account settings and preferences

### Additional Features
- ☁️ **Cloud Storage**: Secure file storage integration with AWS S3
- 💳 **Subscription Plans**: Free and Premium tiers ($5.99/month) with Stripe integration
- 📊 **Dashboard**: Track your usage, manage files, and view security activity
- 🔄 **Scheduled Jobs**: Automate repetitive PDF processing tasks
- 📜 **Comprehensive Logging**: Activity tracking and security event monitoring
- 📈 **Monitoring & Metrics**: Prometheus + Grafana Cloud integration with pre-built dashboards
- 🍪 **Cookie Consent**: GDPR-compliant cookie management
- 📱 **Mobile Responsive**: Fully optimized for mobile devices and tablets
- ⚡ **Batch Processing**: Process multiple files simultaneously with progress tracking
- 🎨 **Modern UI/UX**: Built with Tailwind CSS and Shadcn UI components
- 🔍 **SEO Optimized**: Enhanced metadata for search engine visibility

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

### Test Credentials

For testing purposes, use these credentials (seeded in the database):

```
Email: john@doe.com
Password: johndoe123
Account Type: Premium User
Features: Full access to all PDF tools
```

**Note:** This is a test account with premium features enabled. In production, you'll need to create your own account and upgrade to Premium via Stripe checkout.

## 🏗️ Project Structure

```
nextjs_space/
├── app/                      # Next.js 14 App Router
│   ├── api/                  # API routes
│   │   ├── ai-summary/      # 🆕 AI summary generation endpoint
│   │   ├── auth/            # Authentication endpoints (login, 2FA, reset, verify)
│   │   ├── chatbot/         # AI assistant endpoint
│   │   ├── compliance/      # GDPR/HIPAA compliance endpoints
│   │   ├── jobs/            # Scheduled jobs
│   │   ├── metrics/         # Prometheus metrics & health
│   │   ├── security/        # Security logs
│   │   ├── sessions/        # Session management
│   │   ├── user/            # User data & settings
│   │   └── webhooks/        # Stripe webhooks
│   ├── auth/                # Auth pages (login, signup)
│   ├── dashboard/           # User dashboard with all tools
│   ├── jobs/                # Scheduled jobs management page
│   ├── settings/            # User settings & privacy controls
│   ├── tools/               # PDF tool pages
│   │   ├── annotate/        # 🆕 PDF annotations & comments
│   │   ├── ai-summary/      # 🆕 AI-powered PDF summary
│   │   ├── compare/         # 🆕 PDF comparison tool
│   │   ├── compress/
│   │   ├── convert/
│   │   ├── crop/
│   │   ├── decrypt/
│   │   ├── edit/
│   │   ├── encrypt/
│   │   ├── fill-sign/       # 🆕 Fill & sign PDF forms
│   │   ├── html-to-pdf/
│   │   ├── merge/
│   │   ├── organize/
│   │   ├── page-numbers/
│   │   ├── redact/          # 🆕 Redact sensitive information
│   │   ├── rotate/
│   │   ├── sign/
│   │   ├── split/
│   │   ├── stamp/           # 🆕 Professional document stamps
│   │   └── watermark/
│   └── [other pages]/       # About, Contact, Help, Pricing, Terms, Privacy
├── components/              # React components
│   ├── ui/                  # Shadcn UI components (50+ components)
│   ├── auth/                # Auth forms (login, signup, social login, 2FA)
│   ├── compliance/          # Privacy dashboard components
│   ├── dashboard/           # Dashboard components
│   ├── jobs/                # Job configuration & management
│   ├── settings/            # Security & privacy settings
│   ├── accessibility-manager.tsx  # 🆕 WCAG 2.1 accessibility controls
│   ├── floating-chatbot.tsx       # AI assistant interface
│   ├── onboarding-slides.tsx      # 🆕 Interactive tutorial
│   ├── rollback-history.tsx       # 🆕 Operation undo feature
│   └── [other components]/
├── lib/                     # Utility libraries
│   ├── pdf-utils/          # PDF processing logic
│   ├── i18n/               # Internationalization (8 languages)
│   ├── monitoring/         # Prometheus metrics collection
│   ├── 2fa.ts              # Two-factor authentication
│   ├── auth.ts             # Auth configuration
│   ├── compliance.ts       # GDPR/HIPAA compliance
│   ├── db.ts               # Database client
│   ├── encryption.ts       # Encryption utilities
│   ├── password-breach-check.ts  # HIBP integration
│   ├── rate-limit.ts       # API rate limiting
│   ├── rollback-manager.ts       # 🆕 Operation history
│   ├── security-logger.ts  # Security event logging
│   └── [other utilities]/
├── prisma/                  # Database schema
│   └── schema.prisma       # User, Session, ScheduledJob models
├── public/                  # Static assets
│   ├── workers/            # Web Workers for PDF processing
│   ├── favicon.svg
│   ├── og-image.png
│   └── robots.txt
├── monitoring/              # Observability setup
│   ├── grafana/            # Pre-built dashboards
│   ├── prometheus/         # Prometheus config
│   └── QUICK_START.md
├── e2e/                     # Playwright E2E tests
│   ├── auth.spec.ts        # Authentication flows
│   ├── dashboard.spec.ts   # Dashboard functionality
│   ├── home.spec.ts        # Homepage & navigation
│   ├── language.spec.ts    # Multi-language support
│   ├── theme.spec.ts       # Dark/Light theme
│   └── tools.spec.ts       # PDF tool operations
└── scripts/                 # Build & maintenance scripts
    ├── generate-translations.ts
    └── seed.ts             # Database seeding
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

## 📊 Monitoring & Observability

PRO PDF includes comprehensive monitoring with Prometheus and Grafana Cloud integration.

### Metrics Collected

- **HTTP Metrics**: Request rate, duration, status codes, payload sizes
- **PDF Operations**: Conversion rates, processing time, file sizes, page counts
- **Authentication**: Login attempts, signup rates, 2FA verifications, active sessions
- **Database**: Query duration, connection pool stats, error rates
- **Business**: User growth, subscription events, API usage by tier
- **System**: Memory usage, CPU, garbage collection, event loop lag

### Pre-built Dashboards

1. **Application Overview**: High-level health and performance metrics
2. **PDF Operations**: Detailed PDF processing metrics and trends
3. **Business Metrics**: User engagement and subscription analytics

### Quick Start

```bash
# View metrics endpoint
curl http://localhost:3000/api/metrics

# View health check
curl http://localhost:3000/api/metrics/health

# Start local Prometheus
cd monitoring/prometheus
docker-compose up -d
```

### Documentation

- **Full Guide**: [MONITORING_GUIDE.md](./MONITORING_GUIDE.md)
- **Quick Start**: [monitoring/QUICK_START.md](./monitoring/QUICK_START.md)
- **Grafana Dashboards**: `monitoring/grafana/dashboards/`

### Grafana Cloud Setup

1. Sign up at https://grafana.com/
2. Get Prometheus credentials
3. Add to `.env`:
   ```bash
   GRAFANA_CLOUD_PROMETHEUS_URL=your_url
   GRAFANA_CLOUD_PROMETHEUS_USER=your_user
   GRAFANA_CLOUD_API_KEY=your_key
   ```
4. Import dashboards from `monitoring/grafana/dashboards/`

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
- `POST /api/auth/login` - User login with email/password
- `POST /api/signup` - User registration
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/check-2fa` - Check if user has 2FA enabled
- `POST /api/auth/verify-login` - Verify login with 2FA code
- `POST /api/auth/2fa/setup` - Initialize 2FA setup
- `POST /api/auth/2fa/verify` - Verify and enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA
- `GET /api/auth/2fa/backup-codes` - Generate backup codes
- `POST /api/auth/check-password-breach` - Check password against breach database

### AI-Powered Features 🆕
- `POST /api/ai-summary` - Generate AI-powered PDF summary
  - Accepts: FormData with PDF file
  - Returns: Streaming response with summary, key points, insights, action items

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/change-password` - Change password
- `DELETE /api/user/delete-account` - Delete account
- `GET /api/user/data-export` - Export user data (GDPR)
- `GET /api/user/stats` - Get user statistics and usage
- `GET /api/user/consent` - Get user consent status
- `POST /api/user/consent` - Update user consent preferences

### Chatbot
- `POST /api/chatbot` - Send message to AI assistant

### Sessions
- `GET /api/sessions` - List upload sessions
- `POST /api/sessions` - Create new session
- `DELETE /api/sessions/:id` - Delete session

### Compliance & Privacy
- `GET /api/compliance/status` - Get compliance status
- `POST /api/compliance/consent` - Update consent preferences
- `GET /api/compliance/export` - Export user data
- `POST /api/compliance/delete-account` - Request account deletion

### Security
- `GET /api/security/logs` - Get security activity logs
- `POST /api/security/logs` - Log security event

### Jobs & Automation
- `GET /api/jobs` - List scheduled jobs
- `POST /api/jobs` - Create new scheduled job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job configuration
- `DELETE /api/jobs/:id` - Delete scheduled job
- `POST /api/jobs/:id/retry` - Retry failed job
- `GET /api/jobs/:id/progress` - Get job progress

### Monitoring
- `GET /api/metrics` - Prometheus metrics endpoint
- `GET /api/metrics/health` - Health check endpoint

### Payments
- `POST /api/create-checkout-session` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## 🤝 Support

For issues, questions, or feature requests:
- Check the Help page in the application
- Use the AI Chatbot Assistant for quick answers
- Review the Terms of Service and Privacy Policy

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

### Core Technologies
- [Next.js 14](https://nextjs.org/) - React framework with App Router
- [TypeScript 5.2](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable component library
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [PostgreSQL](https://www.postgresql.org/) - Robust database system

### Authentication & Security
- [NextAuth.js v4](https://next-auth.js.org/) - Authentication for Next.js
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - Password hashing
- [speakeasy](https://github.com/speakeasyjs/speakeasy) - 2FA implementation
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3) - Password breach checking

### PDF Processing
- [pdf-lib](https://pdf-lib.js.org/) - PDF creation and manipulation
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering in browser
- [react-signature-canvas](https://github.com/agilgur5/react-signature-canvas) - Digital signatures
- [canvas-confetti](https://github.com/catdad/canvas-confetti) - Celebration effects

### AI & LLM Integration
- [Abacus.AI APIs](https://abacus.ai/) - LLM-powered features (gpt-4.1-mini)
- OpenAI-compatible streaming endpoints

### Payments & Subscriptions
- [Stripe](https://stripe.com/) - Payment processing

### Monitoring & Observability
- [Prometheus](https://prometheus.io/) - Metrics collection
- [Grafana](https://grafana.com/) - Dashboards and visualization
- [prom-client](https://github.com/siimon/prom-client) - Prometheus metrics for Node.js

### Testing
- [Playwright](https://playwright.dev/) - End-to-end testing
- [TypeScript ESLint](https://typescript-eslint.io/) - Linting

### UI Libraries & Animation
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide React](https://lucide.dev/) - Icon library
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
- [React Hook Form](https://react-hook-form.com/) - Form validation
- [Zod](https://zod.dev/) - Schema validation

### Storage & Cloud Services
- [AWS S3](https://aws.amazon.com/s3/) - Cloud file storage
- [AWS SDK v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/) - AWS integration

---

**PRO PDF** - Professional PDF Tools for Everyone 🚀
