# Ramp Dashboard

A comprehensive React/Next.js dashboard for managing Ramp transactions with advanced filtering, data visualization, and responsive design.

## 🚀 Features

- **Transaction Management**: View, filter, and sort transactions
- **Advanced Filtering**: Filter by date range, merchant, category, amount, and status
- **Data Visualization**: Charts and analytics for spending insights
- **Responsive Design**: Works seamlessly on desktop and mobile
- **TypeScript**: Full type safety throughout the application
- **Testing**: Comprehensive test suite with Jest and React Testing Library
- **Modern UI**: Built with Tailwind CSS and Radix UI components

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── transactions/ # Transaction endpoints
│   ├── dashboard/        # Dashboard pages
│   ├── login/           # Authentication pages
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
│       ├── transactions/ # Transaction-related components
│       ├── dashboard/    # Dashboard components
│       └── auth/         # Authentication components
├── lib/                   # Utility libraries
│   ├── api/              # API client and utilities
│   ├── utils/            # General utilities
│   ├── validations/      # Zod schemas
│   └── hooks/            # Custom React hooks
├── types/                 # TypeScript type definitions
└── styles/               # Additional stylesheets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier

## 📦 Dependencies

### Core Dependencies
- `@tanstack/react-query` - Server state management
- `@tanstack/react-table` - Table functionality
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `date-fns` - Date utilities
- `recharts` - Data visualization
- `lucide-react` - Icons

### UI Components
- `@radix-ui/*` - Accessible UI primitives
- `class-variance-authority` - Component variants
- `clsx` & `tailwind-merge` - CSS class utilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ramp-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Ramp API credentials:
   ```env
   RAMP_CLIENT_ID=your_client_id
   RAMP_CLIENT_SECRET=your_client_secret
   RAMP_API_BASE_URL=https://demo-api.ramp.com
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `RAMP_CLIENT_ID` | Ramp API Client ID | Yes |
| `RAMP_CLIENT_SECRET` | Ramp API Client Secret | Yes |
| `RAMP_API_BASE_URL` | Ramp API Base URL | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
