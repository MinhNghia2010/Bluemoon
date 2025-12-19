# BlueMoon v1.0 - Apartment Fee Management System
## Complete Code Documentation

---

## 📁 Project Structure Overview

```
/
├── App.tsx                          # Main application entry point
├── components/
│   ├── Login.tsx                    # Login page component
│   ├── Dashboard.tsx                # Main dashboard container
│   ├── Sidebar.tsx                  # Navigation sidebar
│   ├── Header.tsx                   # Top header with search and user menu
│   ├── HouseholdsView.tsx          # Households management view
│   ├── FeeCategoriesView.tsx       # Fee categories management
│   ├── FeeCollectionView.tsx       # Fee collection tracking
│   ├── StatisticsView.tsx          # Statistics and reports
│   └── SettingsView.tsx            # Settings and configuration
├── imports/
│   └── svg-uiac8iywkt.ts           # SVG path data from Figma
├── styles/
│   └── globals.css                  # Global styles and Tailwind config
└── CODE_DOCUMENTATION.md            # This file
```

---

## 📄 File-by-File Explanation

### 1. **App.tsx** - Application Entry Point
**Purpose:** The root component that handles authentication state and routing between Login and Dashboard.

**Key Features:**
- Manages authentication state using `useState`
- Conditionally renders Login or Dashboard based on auth status
- Simple routing without external router libraries

**Code Breakdown:**
```typescript
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }
  
  return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
}
```

**State:**
- `isAuthenticated`: Boolean - Controls which view to show (Login vs Dashboard)

---

### 2. **components/Login.tsx** - Login Page
**Purpose:** Provides a login interface with demo credentials for system access.

**Key Features:**
- Username and password input fields
- Simple validation (admin/admin)
- Error message display
- BlueMoon branding with logo
- Styled with purple theme (#5030e5)

**Components Inside:**
- `VuesaxBulkColorfilter`: SVG logo icon component

**State:**
- `username`: String - Stores username input
- `password`: String - Stores password input
- `error`: String - Displays validation errors

**Props:**
- `onLogin`: Function - Callback when login is successful

**Styling:**
- White card on gray background
- 450px width, centered on screen
- Purple focus states on inputs
- Demo credentials shown at bottom

---

### 3. **components/Dashboard.tsx** - Main Dashboard Container
**Purpose:** The main application shell that holds the sidebar, header, and view routing.

**Key Features:**
- View navigation system (households, fee categories, etc.)
- Sidebar collapse state management
- Renders appropriate view based on selection
- Two-column layout (sidebar + content)

**View Types:**
- `households`: Manage apartment units and residents
- `feeCategories`: Define fee types
- `feeCollection`: Track payments
- `statistics`: View reports
- `settings`: System configuration

**State:**
- `currentView`: View type - Which section is currently displayed
- `isSidebarCollapsed`: Boolean - Sidebar expanded/collapsed state

**Props:**
- `onLogout`: Function - Callback to return to login

**Layout:**
- Flexbox container with full viewport height
- Sidebar on left (collapsible)
- Content area on right (scrollable)
- Gray background (#neutral-100)

---

### 4. **components/Sidebar.tsx** - Navigation Sidebar
**Purpose:** Left sidebar navigation with menu items and collapsible functionality.

**Key Features:**
- 5 main navigation items with icons
- Smooth collapse/expand animation
- Active state highlighting
- BlueMoon logo at top
- Version info at bottom
- Toggle button to collapse/expand

**Menu Items:**
1. **Households** (VuesaxOutlineCategory icon)
2. **Fee Categories** (VuesaxLinearMessage icon)
3. **Fee Collection** (VuesaxLinearTaskSquare icon)
4. **Statistics** (VuesaxLinearProfile2User icon)
5. **Settings** (VuesaxLinearSetting icon)

**Props:**
- `currentView`: View - Currently active view
- `onViewChange`: Function - Changes the current view
- `isCollapsed`: Boolean - Sidebar state
- `onToggle`: Function - Toggles sidebar

**Dimensions:**
- Expanded: 337px width
- Collapsed: 100px width
- Transition duration: 300ms

**Styling:**
- White background with border
- Active items have purple tinted background
- Hover states on all items
- Icons remain visible when collapsed

---

### 5. **components/Header.tsx** - Top Header Bar
**Purpose:** Top navigation bar with search and user profile.

**Key Features:**
- Search bar (placeholder functionality)
- Notification icon with badge (3 notifications)
- Message icon
- User profile dropdown with logout

**Components:**
- `VuesaxTwotoneSearchNormal`: Search icon
- `VuesaxOutlineArrowDown`: Dropdown arrow

**Props:**
- `onLogout`: Function - Handles user logout

**Layout:**
- Fixed height: ~84px (44px + padding)
- Full width
- White background with bottom border
- Flexbox with space-between

**User Profile Section:**
- User avatar image
- User name: "Admin User"
- Role: "Administrator"
- Dropdown menu on hover
- Logout button in dropdown (red text)

---

### 6. **components/HouseholdsView.tsx** - Households Management
**Purpose:** Manage apartment units, residents, and household information.

**Key Features:**
- Grid display of household cards (3 columns desktop)
- Filter by payment status (All, Paid, Pending, Overdue)
- Add new household form
- Click to view detailed information modal
- Payment status badges with colors

**Data Structure (Household):**
```typescript
interface Household {
  id: string;           // Unique identifier
  unit: string;         // e.g., "A-101"
  ownerName: string;    // Resident name
  residents: number;    // Number of people
  status: 'paid' | 'pending' | 'overdue';
  balance: number;      // Outstanding amount
  phone: string;        // Contact number
  email: string;        // Email address
}
```

**State:**
- `filter`: Filter type - All/Paid/Pending/Overdue
- `selectedHousehold`: Household | null - For detail modal
- `showAddModal`: Boolean - Shows add household form
- `formData`: Object - Form input values

**Views:**
1. **List View** (default):
   - Filter buttons
   - Grid of household cards
   - Each card shows: unit, owner, status, residents, balance, avatars

2. **Add Form View** (when showAddModal = true):
   - Two-column layout (label | input)
   - Fields: Unit Number, Owner Name, Residents, Phone, Email
   - Add and Back buttons

3. **Detail Modal** (when household clicked):
   - Full household information
   - Edit Details button
   - View History button
   - Close (X) button

**Color Coding:**
- Paid: Green (#7AC555)
- Pending: Orange (#d58d49)
- Overdue: Red (#D34B5E)

---

### 7. **components/FeeCategoriesView.tsx** - Fee Categories Management
**Purpose:** Define and manage different types of fees charged to residents.

**Key Features:**
- Grid display of fee category cards
- Add new category functionality
- Edit existing categories
- Color-coded categories
- Automatic calculation of totals

**Data Structure (FeeCategory):**
```typescript
interface FeeCategory {
  id: string;           // Unique identifier
  name: string;         // e.g., "Monthly Maintenance"
  amount: number;       // Default fee amount
  frequency: string;    // e.g., "Monthly", "Quarterly"
  description: string;  // Fee description
  color: string;        // Visual identifier
}
```

**Mock Categories:**
1. Monthly Maintenance - $1,200/month
2. Water & Utilities - $150/month
3. Parking Fee - $100/month
4. Security Fee - $50/month
5. Amenities Fee - $75/month

**Layout:**
- 3-column grid
- White cards with colored left border
- Shows fee name, amount, frequency
- Edit icon on hover

---

### 8. **components/FeeCollectionView.tsx** - Fee Collection Tracking
**Purpose:** Track and manage fee payments from all households.

**Key Features:**
- Summary cards showing totals (Pending, Collected, Overdue)
- Filter by payment status
- Grid display of payment records (3 columns)
- Payment status badges
- Due date tracking

**Data Structure (Payment):**
```typescript
interface Payment {
  id: string;
  unit: string;         // Household unit
  ownerName: string;
  category: string;     // Fee category
  amount: number;
  status: 'pending' | 'collected' | 'overdue';
  dueDate: string;      // When payment is due
  paymentDate?: string; // When paid (if collected)
  method?: string;      // Payment method if paid
}
```

**State:**
- `filter`: Filter status (all/pending/collected/overdue)

**Layout:**
1. **Summary Cards** (top):
   - Total Pending: Sum and count
   - Total Collected: Sum and count
   - Total Overdue: Sum and count (red highlight)

2. **Filter Buttons**:
   - All, Pending, Collected, Overdue
   - Shows colored dot indicator

3. **Payment Grid**:
   - 3 columns
   - Each card shows: status, unit, owner, category, amount, date
   - Avatar at bottom
   - Color-coded by status

---

### 9. **components/StatisticsView.tsx** - Statistics & Reports
**Purpose:** Display analytics, charts, and reports for the apartment complex.

**Key Features:**
- Summary cards with key metrics
- Bar chart for monthly collection trends
- Pie chart for fee category distribution
- Collection rate percentage
- Month-over-month comparison

**Mock Data:**
- Total Units: 9
- Total Collected This Month: $45,600
- Collection Rate: 92%
- Outstanding Balance: $7,200

**Charts:**
1. **Monthly Collection Trend** (Bar Chart):
   - Last 6 months of data
   - Shows collected amounts per month
   - Using recharts library

2. **Fee Category Distribution** (Pie Chart):
   - Breakdown by fee type
   - Percentage of total revenue
   - Color-coded segments

**Layout:**
- Summary cards in grid (2 or 3 columns)
- Charts stacked vertically
- White background cards
- Responsive design

---

### 10. **components/SettingsView.tsx** - Settings & Configuration
**Purpose:** System settings, user profile, and configuration options.

**Key Features:**
- User profile section
- Change password form
- System settings
- Notification preferences
- Complex information display

**Sections:**
1. **Profile Settings**:
   - User name
   - Email
   - Role
   - Profile picture

2. **Change Password**:
   - Current password
   - New password
   - Confirm password
   - Update button

3. **System Settings**:
   - Total Households
   - Default payment due date
   - Late fee configuration
   - Currency settings

4. **Notifications**:
   - Email notifications toggle
   - SMS alerts toggle
   - Payment reminders

**Layout:**
- Vertical sections with white cards
- Form inputs aligned
- Save/Update buttons per section
- Info text in gray

---

## 🎨 Design System

### Color Palette
```css
Primary Purple: #5030e5
Dark Text: #0d062d
Gray Text: #787486
Background: #f5f5f5 (neutral-100)

Status Colors:
- Success/Paid: #7AC555 (green)
- Warning/Pending: #d58d49 (orange)
- Danger/Overdue: #D34B5E (red)
```

### Typography
- Font Family: Inter
- Weights: Regular (400), Medium (500), Semi Bold (600)
- Sizes: 12px - 32px
- Custom font loading from Figma import

### Spacing System
- Small: 8px, 12px
- Medium: 16px, 20px, 24px
- Large: 32px, 40px, 60px
- Border Radius: 4px, 6px, 16px

### Layout
- Desktop-first approach
- Fixed 3-column grids
- Max widths on forms (800px)
- Consistent padding: 20px, 32px, 40px

---

## 🔧 Technical Details

### State Management
- React useState hooks
- Local component state
- No global state management (Redux, Context)
- State lifted to parent when needed

### Data Flow
```
App.tsx (auth state)
  ↓
Dashboard.tsx (view routing)
  ↓
Individual Views (local state)
```

### Mock Data
All data is currently mocked with static arrays:
- 9 households
- 5 fee categories
- 27 payment records
- Ready to connect to real backend/API

### Styling Approach
- Tailwind CSS v4.0
- Inline utility classes
- Custom font declarations
- No separate CSS modules
- Figma-imported SVG icons

### Components
- Functional components only
- React Hooks (useState)
- TypeScript for type safety
- Props interface definitions

---

## 🚀 Key Features Summary

### Authentication
✅ Login page with demo credentials (admin/admin)
✅ Session management with state
✅ Logout functionality

### Households Management
✅ View all households in grid
✅ Filter by payment status
✅ Add new household (form view)
✅ View household details (modal)
✅ Color-coded status badges

### Fee Management
✅ Fee categories definition
✅ Payment tracking
✅ Status filtering
✅ Summary statistics

### User Interface
✅ Collapsible sidebar
✅ Responsive header
✅ Search bar (UI only)
✅ Notification badges
✅ User profile dropdown

### Visual Design
✅ Purple theme from Figma
✅ Consistent spacing
✅ Smooth animations
✅ Hover states
✅ Card-based layouts

---

## 📊 Data Relationships

```
Household (unit owner)
    ↓
Payment Records (transactions)
    ↓
Fee Categories (types)
```

Each payment links:
- To a Household (by unit)
- To a Fee Category (by name)
- Has status tracking
- Has date tracking

---

## 🔄 User Flows

### 1. Login Flow
```
Login Page → Enter Credentials → Validate → Dashboard
```

### 2. Add Household Flow
```
Households View → Click "Add Household" → Fill Form → Click "Add" → Back to List
```

### 3. View Details Flow
```
Households View → Click Card → See Modal → Edit/Close
```

### 4. Filter Flow
```
Any View with Filters → Click Filter Button → Grid Updates
```

### 5. Navigation Flow
```
Sidebar → Click Menu Item → Content Updates → Header Stays
```

---

## 💡 Implementation Notes

### Why This Structure?
- **Modular**: Each view is independent
- **Scalable**: Easy to add new views
- **Maintainable**: Clear file organization
- **Type-safe**: TypeScript interfaces
- **Consistent**: Shared design system

### Future Enhancements Ready For:
- Backend API integration
- Real authentication
- Database connection
- Payment processing
- PDF report generation
- Email notifications
- Multi-user roles

### Best Practices Used:
✅ Component composition
✅ Props drilling (simple app)
✅ TypeScript interfaces
✅ Consistent naming
✅ Reusable patterns
✅ Mock data separation
✅ Event handling
✅ Conditional rendering

---

## 🎯 Quick Reference

### Adding a New View
1. Create component in `/components/NewView.tsx`
2. Add to View type in `Dashboard.tsx`
3. Import in Dashboard
4. Add to render logic
5. Add menu item to `Sidebar.tsx`

### Modifying Colors
- Update hex values in Tailwind classes
- Main purple: `#5030e5` → change throughout
- Status colors in `getStatusColor()` functions

### Changing Layout
- Grid columns: `grid-cols-3` → `grid-cols-4`
- Sidebar width: `w-[337px]` → adjust in Sidebar.tsx
- Card spacing: `gap-[20px]` → change gap value

---

## 📝 Notes

- All monetary values are in USD ($)
- Dates are strings (not Date objects)
- SVG icons from Figma import
- Images imported as Figma assets
- Forms don't submit to backend yet
- Search is UI only (no functionality)
- All data resets on refresh

---

**Version:** 1.0  
**Last Updated:** November 2025  
**Framework:** React + TypeScript + Tailwind CSS v4.0  
**Design Source:** Figma Import (Project Management Dashboard)
