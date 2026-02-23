# Restaurant Point of Sale (POS) System

## Overview
A comprehensive restaurant Point of Sale system with order management, inventory tracking, financial reporting, staff management, and user authentication. The entire interface is in Albanian (Shqip) and optimized for tablets and POS terminals with responsive mobile support.

## Core Features

### Order and Table Management
- Create, edit, and close orders for dine-in tables, take-away, and delivery
- Real-time order display for kitchen staff
- Table status tracking (occupied, available, reserved)
- Order status updates (pending, preparing, ready, served)
- Split bills and payment processing

### Menu Display and Navigation
- Standard menu interface with category-based organization
- Touch-friendly menu item selection
- Category separation for easy navigation
- Responsive design ensuring optimal viewing on both desktop and mobile devices
- Clean and intuitive menu layout
- Complete menu pages and items fully restored from Draft Version 4

### Inventory and Supplier Management
- Track ingredient and product stock levels
- Low stock notifications and alerts
- Add, edit, and manage supplier information
- Record inventory purchases and usage
- Generate inventory reports

### Financial Reports and Invoicing
- Generate daily, weekly, and monthly sales reports
- Revenue and expense tracking
- Invoice generation and printing capability
- Payment method breakdown (cash, card, etc.)
- Profit margin analysis

### Staff Management Module
- **Menaxhimi i Stafit** tab in dashboard (manager-only access)
- Add new staff members with name and role selection (kamarier or kuzhinier)
- View list of all active staff with their assigned roles
- Edit existing staff member information and roles
- Staff details display with proper text wrapping and scrollable containers
- Integration with role assignment system using assignCallerUserRole function
- Confirmation messages for successful staff operations

### User Roles and Authentication
- **Waiter Role**: Access to order management, table assignments, and basic reporting
- **Cook Role**: Access to kitchen orders, order status updates, and inventory usage
- **Manager Role**: Full system access including reports, inventory management, user administration, and staff management
- Secure login system with role-based permissions

### Dashboard Navigation and Role Control
- Complete dashboard panel structure with all sections visible and functional: **Porositë**, **Kuzhina**, **Tavolinat**, **Menyja**, **Inventari**, **Raportet**, **Stafi**
- Role-based section visibility control ensuring each user type (kamarier, kuzhinier, menaxher) sees only their relevant sections
- Smooth navigation between sections with Albanian language labels
- Stable responsive design for both mobile and desktop devices
- Exact restoration of Draft Version 4 dashboard layout and functionality

## Backend Data Storage
- **Orders**: Order details, items, quantities, prices, table assignments, timestamps, status
- **Menu Items**: Product catalog with prices in Euros, categories, and availability
- **Inventory**: Stock levels, supplier information, purchase history, usage tracking
- **Tables**: Table numbers, capacity, current status
- **Users**: Staff accounts with roles and authentication credentials
- **Staff Profiles**: Staff member information including names, assigned roles, and status
- **Financial Data**: Sales transactions in Euros, expenses, payment methods
- **Suppliers**: Contact information, product catalogs, purchase history
- **User Permissions**: Role-based access control for dashboard sections

## Backend Operations
- Process order creation, updates, and completion
- Calculate totals, taxes, and discounts in Euro currency
- Track inventory changes and generate alerts
- Generate financial reports and analytics with Euro formatting
- Manage user authentication and authorization
- Handle staff member creation, updates, and role assignments
- Assign user roles using assignCallerUserRole function
- Store and retrieve staff profile information
- Handle real-time order updates between staff roles
- Format all monetary values with European standards (two decimal places)
- Validate user permissions for dashboard section access
- Manage role-based navigation and section visibility

## User Interface
- Clean, mobile-friendly design optimized for tablets and smartphones
- Touch-friendly buttons and navigation
- Real-time updates across all connected devices
- Print functionality for receipts and invoices
- Responsive layout for different screen sizes including mobile devices
- Staff management interface with proper responsive design
- All text and labels in Albanian language with "si" spelling (not "си")
- All monetary values displayed with Euro symbol (€) and European number formatting
- Order totals, reports, menu prices, and payment summaries show Euro currency
- Staff management interface consistent with existing dashboard styling

### Mobile Layout Requirements
- Stable mobile view where staff information and order texts display correctly without overlap
- Proper spacing and layout that prevents content overlap on mobile devices
- Responsive design that maintains readability and functionality across all screen sizes
- Clear visual separation between different sections and components
- Optimized touch interface for mobile devices

### Dashboard Design Requirements - Draft Version 4 Layout Restoration
- **Complete Dashboard Sections**: Restore all original sections (Porositë, Kuzhina, Tavolinat, Menyja, Inventari, Raportet, Stafi) exactly as they appeared in Draft Version 4
- **Exact Draft Version 4 Layout**: Restore the complete layout configuration, styling, and positioning from Draft Version 4
- **Role-Based Section Control**: Implement proper role control so only relevant users see their sections (kamarier, kuzhinier, menaxher)
- **Albanian Navigation Labels**: Complete navigation with Albanian language labels and smooth transitions between sections
- **Section Title Positioning**: Section titles like "Porositë", "Raportet Financiare", "Tavolinat", "Menyja" must appear clearly below the navigation menu without any overlap
- **Container Spacing**: Proper top padding and margin adjustments to ensure content starts below the fixed navigation bar exactly as in Draft Version 4
- **Consistent Visual Alignment**: All dashboard pages (OrdersPage, ReportsPage, TablesPage, MenuPage) maintain uniform spacing and positioning identical to Draft Version 4
- **No Content Overlap**: Navigation menu remains fixed at top with all page content positioned below it on both desktop and mobile views
- **Font and Sizing**: Restore all font sizes, weights, and styling configurations from Draft Version 4
- **Padding and Margins**: Apply exact padding and margin values used in Draft Version 4
- **Responsive Behavior**: Maintain the stable mobile layout behavior from Draft Version 4 where staff information displays correctly without text overlapping
- **UI Element Restoration**: All buttons, forms, cards, and interactive elements styled exactly as they appeared in Draft Version 4
- **Menu Pages Restoration**: Fully restore missing menu pages and items that were present in Draft Version 4
- **Complete Functionality Restoration**: Ensure all original functionality for staff management, order processing, table management, and financial reporting works exactly as in Draft Version 4
- **Remove Later Modifications**: Eliminate all slide menus, repositioned text, and other modifications made after Draft Version 4
- **Compact Title Typography**: Maintain the compact and clean title typography from Draft Version 4
- **Visual Hierarchy Restoration**: Restore the exact visual hierarchy and layout structure from Draft Version 4

## Key Workflows
1. **Order Process**: Waiter creates order → Kitchen receives notification → Cook updates status → Order completion
2. **Inventory Management**: Manager adds suppliers → Tracks stock → Receives low stock alerts → Places orders
3. **Staff Management**: Manager accesses staff module → Adds new staff → Assigns roles → Views staff list → Edits staff information
4. **Dashboard Navigation**: User logs in → System displays role-appropriate sections → User navigates smoothly between allowed sections
5. **Menu Navigation**: User accesses menu → Browses categories → Selects items with maintained Euro pricing display
6. **Reporting**: System generates automated reports → Manager reviews financial data → Export/print capabilities
7. **User Management**: Manager creates staff accounts → Assigns roles → Staff login with appropriate permissions

## Currency and Localization Requirements
- Use "si" spelling in Albanian text (not "си")
- Use Euro symbol (€) for all currency displays
- Format monetary values with European standards (two decimal places)
- Apply Euro formatting to order totals, financial reports, menu prices, and payment summaries
- All dashboard navigation and section labels in proper Albanian language

## Draft Version 4 Restoration Priority
- **Critical**: Restore exact mobile layout where content appears below navigation without overlap
- **Critical**: Restore all main menu sections (Porositë, Kuzhina, Tavolinat, Menyja, Inventari, Raportet, Stafi) with full functionality
- **Critical**: Maintain original staff management functionality including add, edit, and role assignment features
- **Critical**: Preserve original order processing, table management, and financial reporting capabilities
- **Critical**: Ensure Albanian language interface consistency throughout the application
- **Critical**: Remove all modifications made after Draft Version 4 including slide menus and repositioned elements
- **Critical**: Restore compact title typography and exact visual hierarchy from Draft Version 4
