# Smart Energy Monitoring & Real-Time Billing System

A production-grade IoT energy monitoring dashboard with real-time data updates, multi-meter support, and advanced billing features.

## Features

### Authentication & User Management
- **Login System**: Email/password authentication with local persistence
- **Session Management**: Automatic session restoration on page refresh
- **User Profiles**: Display user name, meter ID, and location in header
- **Logout**: Secure logout functionality

### Real-Time Monitoring
- **Live Metrics**: 4 key performance indicators updating every 2 seconds:
  - Voltage (V) - Blue left border
  - Current (A) - Amber left border
  - Power (W) - Red left border
  - Energy Consumed (kWh) - Green left border
- **Trend Indicators**: Shows percentage change vs. average
- **24-Hour History**: Full history data available for analysis

### Charts & Analytics
- **Power Usage Chart**: Green line showing real-time power consumption over 24 hours with smooth animations
- **Energy Analytics**: Consumption-based color-coded bars:
  - Green: Low usage (< 30% of max)
  - Amber: Medium usage (30-60% of max)
  - Orange: High usage (60-80% of max)
  - Red: Critical usage (> 80% of max)

### Multi-Meter Support
- **Meter Selector Dropdown**: Switch between multiple meters
- **Dynamic Updates**: Dashboard updates instantly when meter changes
- **Meter Information**: Display meter ID and location for each meter
- **Separate Data**: Each meter has independent consumption data

### Billing Features
- **Daily Consumption Tracking**: Shows energy consumed today
- **Cost Calculation**: Real-time bill calculation (₹/kWh)
- **Payment Status**: Displays "Paid" or "Pending" status
- **Due Date Tracking**: Shows payment due date
- **Monthly Estimation**: Projects estimated monthly bill
- **Payment Alert**: Critical alert when payment is pending

### Alerts & Notifications
- **Dynamic Alerts**: Automatically detected based on usage patterns:
  - Power spikes (> 1.5x average)
  - Low voltage warnings (< 210V)
  - Consumption limit exceeded
- **Alert Severity Levels**:
  - Critical: Red glow animation, highest priority
  - Warning: Orange highlight
  - Info: Blue highlight
- **Real-Time Updates**: Alerts updated every 2 seconds
- **Notification Counter**: Badge shows active alerts

### ML Prediction Panel
- **Status Indicators**: Normal, High Usage, or Anomaly
- **Color-Coded Status**: Green (normal), Yellow (high), Red (anomaly)
- **Smart Recommendations**: Context-aware suggestions for reducing consumption

### Settings & Customization
- **Daily Usage Limits**: Set custom daily consumption limit (10-200 kWh)
- **Alert Thresholds**: Configure when alerts trigger (90% or 100% of limit)
- **Theme Toggle**: Dark and Light mode support
- **Notification Preferences**: Enable/disable specific alert types

### Design System
- **Professional Dark Theme**: Premium SaaS-style interface
- **Green Accent Colors**: Primary green (#10B981) throughout
- **Smooth Animations**: Fade-in and slide-up effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Hover Effects**: Interactive card elevation and color transitions

## Technical Stack

- **Frontend**: Next.js 16 with React 19.2
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **State Management**: React Context API (Auth) + Hooks (Data)
- **Data Simulation**: Real-time mock data generator with realistic patterns

## Getting Started

### Installation
```bash
npm install
# or
pnpm install
```

### Development
```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login
- **Demo Credentials**: Use any email and password to login
- **Mock Data**: System automatically creates user with sample meter
- **Persistent Session**: Session saved in localStorage

## File Structure

```
app/
├── page.tsx                 # Root redirect to login/dashboard
├── layout.tsx              # Root layout with AuthProvider
├── login/
│   └── page.tsx           # Login page
├── dashboard/
│   └── page.tsx           # Main dashboard (protected)
└── settings/
    └── page.tsx           # User settings page

components/
├── header.tsx             # App header with user info & logout
├── metric-card.tsx        # Reusable metric display with borders
├── power-chart.tsx        # Green line chart
├── energy-analytics.tsx   # Color-coded consumption bar chart
├── alerts-section.tsx     # Alert list with severity colors
├── prediction-panel.tsx   # ML status panel
├── billing-section.tsx    # Billing & payment info
└── meter-selector.tsx     # Multi-meter dropdown selector

context/
└── auth-context.tsx       # Authentication context & hooks

hooks/
└── use-realtime-data.ts   # Real-time data generator hook
```

## Key Components

### useRealtimeData Hook
Generates realistic energy consumption data with:
- Time-of-day based patterns (morning peak, evening peak)
- Realistic voltage variations (220V ± 5%)
- Automatic alert generation
- 7-day rolling history
- Updates every 2 seconds

### Metric Cards
- Colored left borders (voltage=blue, current=amber, power=red, energy=green)
- Trend indicators with directional icons
- Icon badges with accent background
- Hover elevation effects

### Energy Analytics
- Consumption-level color coding (green → amber → orange → red)
- Peak usage highlighting
- Average consumption display
- Dynamic color assignment based on max value

### Authentication
- Email/password validation
- localStorage persistence
- Protected routes
- Session management

## Production Features (Ready for Enhancement)

- [ ] Connect to real IoT device API
- [ ] Database integration for user data
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced analytics & reports
- [ ] User role-based access control
- [ ] Dark mode persistence
- [ ] Data export functionality

## Design Highlights

- **Premium SaaS Aesthetic**: Clean, minimal interface with strategic use of color
- **Green Emphasis**: Primary color (#10B981) used for key CTAs and highlights
- **Strategic Color Usage**: Each metric type has unique color for quick recognition
- **Pulsing Alerts**: Critical alerts pulse with red glow for visibility
- **Smooth Transitions**: All interactions use smooth CSS transitions
- **Dark Mode Default**: Professional dark background (#0F172A) with light text

## Performance Optimizations

- Real-time updates using setInterval (2-second refresh)
- Memoized chart color calculations
- Optimized React components with proper key usage
- CSS animations for smooth transitions without JavaScript

---

Built with care for the hackathon. Ready for production deployment!
