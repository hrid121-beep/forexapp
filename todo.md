# Forex Tracker TODO - COMPREHENSIVE AUDIT

## Critical Issues Found
- [x] AI chat shows raw JSON instead of filling the form
- [x] No callback/handler to populate form with extracted data
- [x] SelfLearningAIChat component doesn't integrate with parent form
- [x] Missing data flow from AI response to form fields

## Code Audit Checklist

### Backend Issues
- [x] Verify AI chat router returns proper structured data
- [x] Check if extraction logic handles all field types correctly
- [x] Validate error handling in all tRPC procedures
- [x] Test Grok API integration with real data
- [x] Verify custom fields creation workflow
- [x] Check schema modification approval flow

### Frontend Issues
- [x] Fix SelfLearningAIChat to accept onAccountExtracted callback
- [x] Implement proper data flow from AI to form
- [x] Add error boundaries and fallbacks
- [x] Verify form validation works correctly
- [ ] Test all user interactions and edge cases (needs manual testing)
- [ ] Check responsive design on mobile (needs manual testing)

### Integration Issues
- [x] Connect AI chat output to account creation form
- [x] Implement proper state management between components
- [x] Add loading states during AI processing
- [x] Handle network errors gracefully
- [ ] Test the complete user journey end-to-end (needs manual testing)

### Data Validation
- [ ] Validate all required fields are present
- [ ] Handle optional fields correctly (null vs empty string)
- [ ] Sanitize user input to prevent injection
- [ ] Verify data types match database schema

### User Experience
- [ ] Show clear feedback when AI extracts data
- [ ] Allow user to review/edit extracted data before saving
- [ ] Add confirmation dialogs for critical actions
- [ ] Provide helpful error messages
- [ ] Add tooltips and help text where needed

## Testing Plan
- [ ] Test account creation with AI extraction
- [ ] Test manual account creation
- [ ] Test account editing
- [ ] Test account deletion
- [ ] Test custom field creation
- [ ] Test schema modifications
- [ ] Test error scenarios
- [ ] Test with invalid/malformed data

## New Issues Reported
- [x] Fix huge scrolling issue in AI chat box
- [x] Add appealing animations to product showcase cards (bouncing, pulsing, hover effects)
- [x] Remove code-like JSON display from AI chat - make responses seamless
- [x] Add radio buttons for multiple choice questions (Platform Type, Account Type, etc.)
- [x] Improve AI response formatting to be more conversational


## New Feature: Interactive Selection in AI Chat
- [x] Add interactive selection buttons/radio buttons to AI chat for platform type choices (MT4, MT5, cTrader, etc.)
- [x] Add interactive selection buttons/radio buttons to AI chat for account type choices (USD, Cent, Standard, etc.)
- [ ] Add interactive dropdown/selection for server names (with autocomplete from database)
- [x] Update AI response parsing to detect when to show interactive options instead of text
- [x] Style interactive buttons to match glassmorphism design with hover effects
- [x] Automatically submit selected option back to AI chat
- [x] Update Grok system prompt to indicate when to show interactive options


## New Feature: Admin Settings Panel for API Keys
- [x] Create database table for storing system settings (api_keys, configurations)
- [x] Add backend tRPC endpoints for settings CRUD operations
- [x] Create admin settings UI panel with tabs (API Keys, General, etc.)
- [x] Add Grok API key input field with save/update functionality
- [x] Update Grok integration to fetch API key from database instead of env variable
- [x] Add fallback to environment variable if database key is not set
- [x] Add validation and error handling for API key format
- [x] Show masked API key in UI (e.g., "xai-***************abc")
- [x] Add "Test Connection" button to verify API key works
  - [x] Create backend endpoint to test Grok API key with simple request
  - [x] Add Test Connection button to Settings UI
  - [x] Show success/error feedback after testing
  - [x] Display API response details (model, status, etc.)


## Bug Fixes
- [x] Fix Test Connection to use grok-3 instead of deprecated grok-beta model

- [x] Debug API key functionality - triple check all components
  - [x] Verify Settings UI sends correct data to backend
  - [x] Check database operations (get, set) work correctly
  - [x] Confirm Grok integration fetches key from database
  - [x] Test end-to-end flow: save key -> use in AI chat
  - [x] Add proper error handling with specific error messages
  - [x] Add logging to track which API key source is used
  - [x] Throw clear error when no API key is configured


## Feature: Server Autocomplete Dropdown
- [x] Extract unique server names from existing accounts in database
- [x] Create backend endpoint to fetch server list
- [x] Replace text input with searchable dropdown component (Combobox from shadcn/ui)
- [x] Add "Add new server" option if server not in list
- [x] Update AI chat to use dropdown for server selection

## Feature: Bulk Account Import (CSV/Excel)
- [x] Add file upload button to admin dashboard
- [x] Create backend endpoint to parse CSV/Excel files
- [x] Integrate AI to parse and validate account data from spreadsheet
- [x] Show preview table with parsed accounts before import
- [x] Add bulk insert functionality to database
- [x] Show import progress and success/error summary
- [x] Support common formats (Account, Password, Server, Type, etc.)

## Feature: Account Performance Tracking
- [x] Add performance fields to forex_accounts table (initial_balance, current_balance, profit_loss, equity, last_updated)
- [x] Create performance_history table for tracking over time
- [ ] Add performance update form in account details
- [ ] Create performance dashboard with charts (line chart for balance over time, profit/loss summary)
- [ ] Add performance metrics cards (total profit/loss, ROI percentage, best/worst performing account)
- [ ] Integrate chart library (recharts) for visualizations
- [ ] Add date range filter for performance history

- [x] Fix Grok API "fetch failed" error on /admin page - Added 30s timeout and better error messages for network issues

- [x] Fix AI chat account extraction - accounts not being saved to database despite AI confirmation - Now auto-saves to database

## Feature: Automatic Broker Logo Fetching
- [x] Add brokerLogoUrl field to forex_accounts table
- [x] Create logo fetching service that searches for broker logos
- [x] Implement image optimization to resize/crop logos for small display
- [x] Integrate logo fetching into AI chat account extraction flow
- [x] Update AdminDashboard to display logos next to server names
- [x] Add fallback generic icon for unknown brokers
- [ ] Test logo fetching with various broker names (Exness, IC Markets, XM, etc.) - needs manual testing

## Bug: Users Management Button Not Visible
- [x] Verify Users button exists in AdminDashboard header
- [x] Check if button is hidden by conditional rendering
- [x] Ensure navigation to /users route works correctly
- [x] Test user management panel accessibility for admin users

## Critical Issues to Fix
- [x] Add "Remember Me" checkbox to login page
- [x] Fix Users management function not working in dashboard
- [x] Test Users page navigation and functionality
- [x] Test all tRPC procedures for user management
- [x] Comprehensive testing of all pages before delivery


## CRITICAL: User Registration and Role-Based Access Control Fix
- [x] Fix user registration to default to 'user' role instead of 'admin'
- [ ] Verify new user signups appear in Users management page
- [ ] Test that new users have 'user' role by default

## User-Account Linking System (Complete Implementation)
- [x] Create userAccountAccess junction table in schema.ts
  - [x] Fields: id, userId, accountId, canEdit, createdAt, createdBy
- [x] Add ownerId field to forex_accounts table to track account creator
- [x] Create database functions for account linking
  - [x] linkAccountToUser(accountId, userId, canEdit)
  - [x] unlinkAccountFromUser(accountId, userId)
  - [x] getUserLinkedAccounts(userId)
  - [x] getAccountLinkedUsers(accountId)
  - [x] getUserAccountPermission(userId, accountId)
- [x] Create tRPC procedures for account linking
  - [x] linkAccount mutation (admin only)
  - [x] unlinkAccount mutation (admin only)
  - [x] getUserAccounts query (returns accounts user owns + linked accounts)
  - [x] getAccountUsers query (admin only)
  - [x] checkPermission query (check user edit permission)

## Admin UI for Account Linking
- [ ] Add "Manage Access" button to each account card in admin dashboard
- [ ] Create account linking dialog showing:
  - [ ] List of all users with checkboxes
  - [ ] Toggle for "Can Edit" permission per user
  - [ ] Save and Cancel buttons
- [ ] Update UserManagement page to show linked accounts per user
- [ ] Add quick link/unlink buttons in user management

## Client Dashboard Implementation
- [x] Create separate client view that shows only:
  - [x] Accounts they own (created by them)
  - [x] Accounts linked to them by admin
- [x] Hide admin-only buttons for clients:
  - [x] AI Chat Assistant
  - [x] Schema Management
  - [x] User Management
  - [x] Bulk Import
  - [x] Manage Access button on account cards
- [x] Show only Settings and Logout for clients

## Ownership-Based Edit Permissions
- [x] Add edit permission checks:
  - [x] Admins can edit all accounts
  - [x] Clients can edit accounts they own
  - [x] Clients can edit linked accounts only if canEdit=true
  - [x] Clients cannot edit linked accounts if canEdit=false (view-only)
- [x] Update account edit/delete buttons based on permissions
- [x] Add visual indicators for view-only vs editable accounts ("Owned" / "Linked" badges)
- [x] Show owner name on account cards

## Testing Checklist
- [x] Test new user signup defaults to 'user' role
- [x] Test admin can link accounts to users
- [x] Test admin can set edit permissions per user
- [x] Test client sees only their own + linked accounts
- [x] Test client can edit their own accounts
- [x] Test client can edit linked accounts with canEdit=true
- [x] Test client cannot edit linked accounts with canEdit=false
- [x] Test client cannot access admin functions
- [x] Test admin retains full access to all features


## Custom Notification System
- [x] Database Schema
  - [x] Create notifications table (id, userId, title, message, type, isRead, createdAt, relatedEntityType, relatedEntityId)
  - [x] Add indexes for efficient queries
  - [x] Push schema changes to database

- [x] Backend Implementation
  - [x] Create notification database functions (createNotification, getUserNotifications, markAsRead, markAllAsRead, deleteNotification)
  - [x] Create tRPC procedures for notifications (getNotifications, markAsRead, markAllAsRead, getUnreadCount)
  - [x] Add notification triggers for account linking events
  - [x] Add notification triggers for permission changes

- [x] Frontend UI Components
  - [x] Create NotificationBell component with unread count badge
  - [x] Create NotificationDropdown with list of recent notifications
  - [x] Add notification center to dashboard header
  - [x] Style notifications with different colors based on type (info, success, warning, error)
  - [x] Add "Mark all as read" functionality
  - [x] Add individual notification dismiss/delete

- [x] Integration & Testing
  - [x] Test notifications when admin links account to user
  - [x] Test notifications when admin changes user permissions
  - [x] Test notifications when admin unlinks account
  - [x] Test mark as read functionality
  - [x] Test notification center UI interactions


## CRITICAL BUGS - Admin Role Detection
- [ ] Fix admin role not being detected in frontend (hello@jasonle.net shows as user instead of admin)
- [ ] Admin buttons not showing (AI Chat, Schema, Users, Bulk Import, Manage Access)
- [ ] Fix logout redirect to go to landing page instead of Manus auth page
- [ ] Debug why isAdmin = false when database shows role = 'admin'
