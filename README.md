# MantrixFlow - AI-Powered Business Intelligence Platform

A modern, full-featured Business Intelligence platform built with Next.js, featuring AI-driven analytics, comprehensive data visualization, and intuitive dashboard creation.

## 🚀 Overview

MantrixFlow is an AI-powered Business Intelligence platform that transforms your data into actionable insights. It provides a comprehensive suite of tools for data visualization, dashboard creation, data source management, and AI-assisted analytics. The frontend is built with Next.js 16 and React 19, providing a modern, responsive user experience.

## ✨ Key Features

### 🔐 Authentication & User Management
- **Complete Auth System**: Email/password authentication with Supabase
- **OAuth Integration**: Google and GitHub sign-in support
- **Password Management**: Forgot password and reset password flows
- **Email Verification**: Secure email confirmation
- **Session Management**: Secure session handling with middleware protection

### 📊 Business Intelligence Components
- **37+ Production-Ready BI Components**:
  - **Charts**: Line, Bar, Area, Pie, Donut charts
  - **Metrics**: KPI Cards, Metric Cards, Sparklines, Progress Bars
  - **Advanced Analytics**: Forecast lines, Funnel charts, Heatmaps, Sankey diagrams, TreeMaps, Radar charts, Gauges, Bullet charts
  - **Data Display**: Full-featured DataTable with sorting, filtering, and pagination
  - **AI Components**: Prompt inputs, AI commentary, insights, and feedback systems
  - **Share & Export**: Embed codes, QR codes, PDF export, share functionality

### 🎨 Modern UI/UX
- **Shadcn/UI Components**: 55+ pre-built, accessible UI components
- **Dark Mode**: Full dark mode support with theme customization
- **Responsive Design**: Mobile-first, fully responsive layouts
- **Drag & Drop**: Interactive dashboard building with drag-and-drop
- **Customizable Themes**: Color picker and font selector for branding

### 🤖 AI-Powered Features
- **AI Analytics**: AI-driven insights and commentary
- **Forecast Predictions**: AI-powered forecasting with confidence intervals
- **Anomaly Detection**: Automatic outlier detection and alerts
- **Natural Language Queries**: AI prompt interface for data exploration

### 📈 Data Management
- **Data Sources**: Connect and manage PostgreSQL data sources
- **Data Pipelines**: Create, manage, and monitor data transformation pipelines
- **Schema Discovery**: Automatic database schema discovery and visualization
- **Query Execution**: Execute custom queries with audit logging
- **Data Synchronization**: Automated data sync jobs with scheduling
- **Datasets**: Organize and manage datasets

### 👥 Team & Collaboration
- **Team Management**: Invite and manage team members
- **Workspace Organization**: Multi-workspace support
- **Onboarding Flow**: Guided onboarding for new users

## 🛠️ Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe development

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Motion (Framer Motion)** - Animation library

### Data & Charts
- **Recharts** - Charting library
- **TanStack Table** - Powerful table component
- **Monaco Editor** - Code editor component

### Backend & Database
- **Supabase** - Backend-as-a-Service (Auth, Database)
- **Supabase SSR** - Server-side rendering support
- **MantrixFlow API** - NestJS backend API for data management
- **React Query** - Data fetching and caching

### State Management
- **Zustand** - Lightweight state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Development Tools
- **Bun** - Fast JavaScript runtime and package manager
- **Biome** - Fast linter and formatter
- **TypeScript** - Static type checking

### Additional Libraries
- **AI SDK** - AI integration
- **DnD Kit** - Drag and drop functionality
- **React Flow** - Node-based editor
- **Date-fns** - Date utilities
- **Sonner** - Toast notifications

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Bun** 1.0 or higher ([Install Bun](https://bun.sh))
- **Git** for version control
- **Supabase Account** (for authentication and database)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd apps/app
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000

# Optional: NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from **Settings > API**
3. Enable **Email Authentication** in **Authentication > Settings**
4. Configure **Site URL**: `http://localhost:3000` (for development)
5. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/reset-password`

### 5. Backend API Setup

The frontend requires the MantrixFlow API backend to be running. See the [Backend README](../api/README.md) for setup instructions.

**Quick Start:**
```bash
# In a separate terminal, from the root directory
cd apps/api
bun install
bun run start:dev
```

The API will be available at `http://localhost:8000` with Swagger docs at `http://localhost:8000/api/docs`.

### 6. Run Development Server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: Make sure both the frontend (port 3000) and backend API (port 8000) are running for full functionality.

## 📁 Project Structure

```
apps/app/
├── app/                          # Next.js App Router pages
│   ├── api/                     # API routes
│   │   └── auth/               # Authentication endpoints
│   ├── auth/                   # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── onboarding/             # User onboarding flow
│   │   ├── welcome/
│   │   ├── organization/
│   │   ├── data-source/
│   │   └── connect/
│   └── workspace/              # Main application
│       ├── dashboard/
│       ├── dashboards/
│       ├── data-sources/
│       ├── data-pipelines/
│       ├── datasets/
│       ├── team/
│       └── settings/
│
├── components/                  # React components
│   ├── ai-elements/            # AI-related components
│   ├── auth/                   # Authentication components
│   ├── bi/                     # Business Intelligence components
│   │   ├── charts/             # Chart components
│   │   ├── metrics/            # Metric components
│   │   ├── filters/            # Filter components
│   │   ├── insights/           # AI insights
│   │   └── advanced/           # Advanced analytics
│   ├── data-sources/           # Data source components
│   ├── features/               # Feature-specific components
│   ├── shared/                 # Shared components
│   │   ├── layout/             # Layout components
│   │   ├── feedback/           # Loading/Error/Empty states
│   │   └── navigation/         # Navigation components
│   ├── theme/                  # Theme customization
│   ├── ui/                     # Shadcn/UI components
│   └── workspace/              # Workspace components
│
├── lib/                        # Utility libraries
│   ├── actions/                # Server actions
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   ├── dataset.ts
│   │   └── team.ts
│   ├── hooks/                  # Custom React hooks
│   ├── stores/                 # Zustand stores
│   ├── supabase/               # Supabase client setup
│   ├── types/                  # TypeScript types
│   ├── utils/                  # Utility functions
│   └── validations/            # Zod schemas
│
├── hooks/                      # Global hooks
├── docs/                       # Documentation
│   ├── AUTH_SETUP.md
│   ├── COMPONENT_LIBRARY_SUMMARY.md
│   ├── AUTO_PLACEMENT_GUIDE.md
│   └── ...
│
├── public/                     # Static assets
├── middleware.ts               # Next.js middleware
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── biome.json                  # Biome linter/formatter config
└── package.json                # Dependencies
```

## 📜 Available Scripts

```bash
# Development
bun dev              # Start development server on http://localhost:3000

# Production
bun run build        # Build production bundle
bun start            # Start production server

# Code Quality
bun run lint         # Run Biome linter
bun run format       # Format code with Biome
```

## 🎯 Key Features & Components

### BI Component Library

The project includes **37+ production-ready BI components** organized into categories:

#### Charts (5 components)
- `LineChart` - Time series visualization
- `BarChart` - Comparison view with stacked/horizontal options
- `AreaChart` - Cumulative trends
- `PieChart` - Part-to-whole visualization
- `DonutChart` - Donut-style pie chart

#### Metrics (4 components)
- `KPICard` - Key Performance Indicator with trend
- `MetricCard` - Big number display
- `Sparkline` - Inline mini-chart
- `ProgressBar` - Percentage completion

#### Advanced Analytics (9 components)
- `ForecastLine` - AI-predicted future values
- `FunnelChart` - Conversion funnel
- `Heatmap` - Value density visualization
- `SankeyDiagram` - Flow visualization
- `TreeMap` - Hierarchical data
- `RadarChart` - Multi-dimension comparison
- `Gauge` - Progress toward goal
- `BulletChart` - Target vs actual
- `AnomalyBadge` - Outlier indicator

#### Data Display
- `DataTable` - Full-featured table with TanStack Table v8
  - Sorting, filtering, pagination
  - Column visibility
  - Responsive layout

#### AI Components (4 components)
- `PromptInput` - Text prompt for AI generation
- `RegenerateButton` - Retry prompt
- `FeedbackThumbs` - Like/dislike feedback
- `EditPrompt` - Modify and resubmit

#### Share & Export (4 components)
- `EmbedCode` - Copyable iframe embed
- `ShareButton` - Share via link/email
- `QRCode` - Scan-to-view QR code
- `ExportPDF` - PDF download

### Usage Example

```tsx
import { LineChart, KPICard, DataTable, GridLayout, Section } from "@/components/bi";

function Dashboard() {
  return (
    <Section title="Revenue Dashboard">
      <GridLayout cols={3}>
        <KPICard 
          value="$45,231" 
          label="Revenue" 
          change={12.5} 
        />
        <KPICard 
          value="2,350" 
          label="Users" 
          change={-5.2} 
        />
        <KPICard 
          value="23.8%" 
          label="Conversion" 
          change={3.1} 
        />
      </GridLayout>

      <LineChart
        data={salesData}
        xKey="month"
        yKeys={["revenue", "profit"]}
        title="Sales Trends"
      />
    </Section>
  );
}
```

## 🔌 Backend API Integration

The frontend communicates with the MantrixFlow API backend for all data operations:

### API Client

The frontend uses React Query for API calls. API client utilities are located in `/lib/api/`:

- **Data Sources**: PostgreSQL connection management
- **Data Pipelines**: Pipeline creation and execution
- **Users**: User profile and onboarding
- **Organizations**: Team and workspace management

### Authentication

All API requests are authenticated using JWT tokens from Supabase:
- Tokens are automatically included in API requests
- Tokens are refreshed automatically when expired
- Unauthenticated requests redirect to login

### Example API Usage

```tsx
import { usePostgresConnections } from '@/lib/api';

function DataSourcesPage() {
  const { data: connections, isLoading } = usePostgresConnections();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {connections?.map(conn => (
        <div key={conn.id}>{conn.name}</div>
      ))}
    </div>
  );
}
```

For more details, see the [Backend API README](../api/README.md).

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[AUTH_SETUP.md](./docs/AUTH_SETUP.md)** - Complete authentication setup guide
- **[COMPONENT_LIBRARY_SUMMARY.md](./docs/COMPONENT_LIBRARY_SUMMARY.md)** - BI component library overview
- **[COMPONENT_AUDIT.md](./docs/COMPONENT_AUDIT.md)** - Component architecture audit
- **[MIGRATION_PROGRESS.md](./docs/MIGRATION_PROGRESS.md)** - Component migration progress
- **[AUTO_PLACEMENT_GUIDE.md](./docs/AUTO_PLACEMENT_GUIDE.md)** - Auto-placement guide
- **[DEMO_PAGE_GUIDE.md](./docs/DEMO_PAGE_GUIDE.md)** - Demo page guide
- **[DRAG_DROP_DELETE_FIX.md](./docs/DRAG_DROP_DELETE_FIX.md)** - Drag & drop implementation

### Component Documentation

Each component includes:
- **JSDoc comments** with full documentation
- **TypeScript types** exported for reuse
- **Usage examples** in code comments
- **Accessibility** features (ARIA labels, keyboard navigation)

## 🎨 Theming & Customization

### Dark Mode
The application supports full dark mode via `next-themes`:

```tsx
import { ThemeProvider } from "@/components/theme-provider";

<ThemeProvider>
  {/* Your app */}
</ThemeProvider>
```

### Theme Customization
- **Color Picker**: Customize brand colors
- **Font Selector**: Choose from available fonts
- **Theme Preview**: Preview changes before applying

### Styling
All components accept `className` prop for custom styling:

```tsx
<KPICard
  className="bg-gradient-to-r from-blue-500 to-purple-600"
  value="$45K"
  label="Revenue"
/>
```

## 🔒 Security

### Authentication
- Secure session management with Supabase
- Middleware-based route protection
- OAuth integration with Google and GitHub
- Email verification for new accounts

### Best Practices
- Environment variables for sensitive data
- HTTPS required in production
- CORS configuration in Supabase
- Rate limiting considerations

## 🧪 Development Guidelines

### Code Style
- **Linter**: Biome (configured in `biome.json`)
- **Formatter**: Biome formatter
- **TypeScript**: Strict mode enabled
- **Imports**: Auto-organized imports

### Component Standards
1. Full JSDoc documentation
2. TypeScript Props interfaces
3. Example usage in comments
4. Responsive Tailwind layout
5. ARIA-friendly accessibility
6. Dark mode support
7. Consistent naming conventions

### File Organization
- Feature-based organization
- Shared components in `/components/shared`
- Feature-specific components in `/components/features`
- UI primitives in `/components/ui`

## 🚢 Deployment

### Build for Production

```bash
bun run build
bun start
```

### Environment Variables for Production

Update your `.env.local` with production values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# Backend API
NEXT_PUBLIC_API_URL=https://api.your-domain.com
API_URL=https://api.your-domain.com

# NextAuth
NEXTAUTH_URL=https://your-domain.com
```

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables
4. Deploy!

For more details, see [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Add JSDoc comments for new components
- Include TypeScript types
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test responsive design
- Update documentation as needed

## 📝 License

This project is part of the MantrixFlow platform.

## 🆘 Support & Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check email/password combination
   - Verify Supabase configuration

2. **OAuth redirect errors**
   - Verify redirect URLs in provider settings
   - Check Supabase authentication configuration

3. **Email not received**
   - Check spam folder
   - Verify SMTP settings in Supabase

4. **CORS errors**
   - Ensure site URL is configured in Supabase
   - Check middleware configuration
   - Verify backend API CORS settings

5. **API connection errors**
   - Verify backend API is running on port 8000
   - Check `NEXT_PUBLIC_API_URL` in environment variables
   - Ensure backend API CORS allows your frontend origin
   - Check browser console for detailed error messages

### Debug Mode

Enable debug logging:

```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/UI Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org)
- [TanStack Table Documentation](https://tanstack.com/table)

## 📊 Project Statistics

- **Total Components**: 100+ (37 BI components + 55+ UI components)
- **TypeScript Coverage**: 100%
- **JSDoc Coverage**: 100%
- **Accessibility**: ARIA-compliant
- **Responsive**: Mobile-first design

---

**Built with ❤️ for MantrixFlow - Transforming Data into Insights**
