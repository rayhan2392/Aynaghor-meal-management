# 🍽️ Aynnaghor Meal Management System

A comprehensive React-based meal management application for shared living spaces like hostels, apartments, or group houses. Track meals, expenses, deposits, and manage monthly settlements with ease.

## 🌟 Features

### 📊 Dashboard

- **KPI Cards**: Overview of current month statistics (meals, expenses, deposits, balance)
- **Quick Entry Forms**: Fast meal, expense, and deposit entry for today
- **User Totals Table**: Real-time view of each member's current status

### 🍽️ Meal Management

- **Interactive Meal Entry**: Add/Update workflow with live editing
- **Daily Restrictions**: One lunch + one dinner per user per day
- **Guest Meals**: Track additional meals for visitors
- **Meals History**: Comprehensive table showing all meals by user and date
- **Visual Indicators**: Clear checkmarks and badges for meal status

### 💰 Financial Management

- **Expense Tracking**: Record shared expenses with "Purchased By" field
- **Deposit Management**: Track member deposits with proper attribution
- **Precise Calculations**: Uses decimal.js for accurate money arithmetic
- **BDT Currency**: Formatted for Bangladeshi Taka

### 🔄 Monthly Settlement

- **Manager-Centric System**: All transactions flow through a central admin/manager
- **Settlement Summary**: Total expenses, deposits, meals, and per-meal rate
- **Per-User Analysis**: Individual meal counts, shares, deposits, and net amounts
- **Settlement Instructions**: Clear "who pays/receives from manager" format
- **Close Month**: Process monthly settlement and start fresh cycle

### ⚙️ Settings & Management

- **User Management**: Add, edit, activate/deactivate, and delete users
- **Cycle Management**: Create and manage monthly cycles
- **App Settings**: Currency preferences, auto-save, and data management
- **Data Export/Import**: Backup and restore functionality

## 🛠️ Technical Stack

### Frontend

- **React 19** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **Radix UI** for accessible components

### State Management

- **Redux Toolkit** for centralized state management
- **React Router v7** for navigation
- Structured slices for meals, expenses, deposits, users, and cycles

### Data Persistence

- **localStorage** integration for data persistence
- **Mock Database** system for development
- Seeded data for testing and development

### Key Libraries

- **decimal.js**: Precise financial calculations
- **React Hook Form**: Form handling and validation
- **TypeScript**: Type safety and developer experience

## 🚀 Getting Started

### Prerequisites

- **Bun** (recommended) or npm/yarn
- Node.js 18+

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/rayhan2392/Aynaghor-meal-management.git
   cd aynnaghor-meal-management
   ```

2. **Install dependencies**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Start development server**

   ```bash
   bun run dev
   # or
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
bun run build
# or
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   ├── layout/         # App layout components
│   └── ui/             # Base UI components
├── features/           # Redux slices and state management
│   ├── cycles/         # Monthly cycles management
│   ├── deposits/       # Deposit tracking
│   ├── expenses/       # Expense management
│   ├── meals/          # Meal tracking
│   └── users/          # User management
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Meals.tsx       # Meal management
│   ├── Expenses.tsx    # Expense tracking
│   ├── Deposits.tsx    # Deposit management
│   ├── ClosePage.tsx   # Monthly settlement
│   └── SettingsPage.tsx # App settings
├── services/           # External services
│   ├── api/            # API-like services
│   ├── mock/           # Mock data and database
│   └── storage/        # localStorage utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── currency.ts     # Currency formatting
│   ├── money.ts        # Precise money calculations
│   └── settlement.ts   # Settlement logic
└── validation/         # Form validation schemas
```

## 🏠 Usage Example

### Monthly Workflow

1. **Daily Operations**

   - Record meals using Dashboard quick entry or Meals page
   - Add expenses as they occur
   - Track deposits when members contribute money

2. **Throughout the Month**

   - Monitor KPI cards on Dashboard
   - View individual totals and balances
   - Check meal history for accuracy

3. **End of Month**
   - Go to Close Month page
   - Review settlement summary
   - Follow settlement instructions (who pays/receives from manager)
   - Close the month to start fresh

### Settlement Logic

The system uses a **manager-centric** settlement model:

- **Manager/Admin**: Central person who handles all money
- **If member owes money**: They pay the manager
- **If member receives money**: They get it from the manager
- **No direct member-to-member** transactions

Example settlement:

```
Shawn owes 500 BDT → pays to Manager
Sadi receives 400 BDT → gets from Manager
```

## 🎯 Key Business Rules

### Meal Rules

- **One lunch + one dinner** per user per day maximum
- **Guest meals** unlimited (for visitors)
- **Daily restrictions** reset each day

### Financial Rules

- **Shared expenses**: Split equally among active members
- **Individual deposits**: Credited to specific member
- **Monthly settlement**: Net calculation of meals taken vs. money contributed

### User Management

- **5 regular members** + 1 manager/admin
- **Active/Inactive** status affects settlement calculations
- **Historical data** preserved when users are deactivated

## 🔧 Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint

### Adding Features

1. Create Redux slice in `src/features/`
2. Add API service in `src/services/api/`
3. Create page component in `src/pages/`
4. Add route in `src/App.tsx`
5. Update types in `src/types/`

## 📱 Responsive Design

The application is fully responsive and works on:

- **Desktop**: Full feature set with optimal layout
- **Tablet**: Adapted layouts with touch-friendly interactions
- **Mobile**: Compact design with essential features accessible

## 🚀 Deployment

The application can be deployed to:

- **Vercel**: Zero-config deployment
- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting for public repos
- **Any static host**: After running `bun run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

- **Rayhan** - _Initial work_ - [rayhan2392](https://github.com/rayhan2392)

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Inspired by real-world shared living expense management needs
- Designed for simplicity and ease of use

---

**Happy Meal Management!** 🍽️✨
