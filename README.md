# 📋 Software License Monitor

A comprehensive web application for managing and monitoring software licenses, user access, and expiration dates with Excel export functionality.

## ✨ Features

### License Management
- **Add/Delete Licenses**: Manage software licenses with key information
- **Track Seats**: Monitor total, used, and available seats for each license
- **Expiration Tracking**: Automatic status updates (Active, Expiring Soon, Expired)
- **Visual Dashboard**: Real-time statistics and alerts

### User Management
- **User Database**: Store user information (name, email, department)
- **Active Licenses**: Track how many licenses each user has
- **Easy Management**: Add and remove users with a simple interface

### License Assignments
- **Assign Licenses to Users**: Track who has access to which software
- **Access Date Tracking**: Record when users received their licenses
- **Expiration Monitoring**: See days remaining for each assignment
- **Automatic Seat Management**: Used seats update automatically

### Alerts & Notifications
- **Expiring Soon Warnings**: Alerts for licenses expiring within 30 days
- **Expired Licenses**: Critical alerts for expired licenses
- **Low Availability**: Warnings when available seats run low
- **User Impact**: See how many users are affected by expiring licenses

### Excel Export (Multiple Sheets)
Export complete database to Excel with 4 separate sheets:
1. **Licenses Sheet**: All license details with availability
2. **Users Sheet**: Complete user directory with license counts
3. **Assignments Sheet**: Detailed assignment records
4. **Expiration Report**: Sorted by urgency with affected users

## 🚀 How to Use

### Getting Started
1. Open `index.html` in a web browser
2. The app comes pre-loaded with sample data for demonstration
3. Data is automatically saved to browser localStorage

### Managing Licenses
1. Click **"+ Add License"** on the Licenses tab
2. Fill in:
   - Software Name
   - License Key
   - Total Seats
   - Expiration Date
3. View license status with color-coded badges:
   - 🟢 Green = Active
   - 🟡 Yellow = Expiring Soon (≤30 days)
   - 🔴 Red = Expired

### Managing Users
1. Click **"+ Add User"** on the Users tab
2. Enter user details (name, email, department)
3. See active license count for each user

### Assigning Licenses
1. Click **"+ Assign License"** on the Assignments tab
2. Select:
   - User from dropdown
   - Software (only shows licenses with available seats)
   - Access date
3. The system automatically:
   - Updates used/available seats
   - Prevents duplicate assignments
   - Blocks assignment if no seats available

### Monitoring Expirations
1. Go to **Dashboard** tab to see all alerts
2. Check expiration warnings sorted by urgency
3. View affected users for each license

### Exporting to Excel
1. Click **"📊 Export to Excel"** button (top right)
2. File downloads automatically with current date in filename
3. Open in Excel/Google Sheets/LibreOffice to view all sheets:
   - Review license inventory
   - Analyze user assignments
   - Plan for upcoming expirations
   - Share reports with management

## 📊 Dashboard Statistics

The top of the Licenses tab shows:
- **Total Licenses**: Count of all software licenses
- **Available**: Total available seats across all licenses
- **Expiring Soon**: Licenses expiring within 30 days
- **Expired**: Licenses that have already expired

## 💾 Data Storage

- All data is stored in browser **localStorage**
- Data persists between sessions
- No server or internet connection required
- To reset: Clear browser data or delete items manually

## 🎨 User Interface

- **Modern Design**: Clean, professional gradient interface
- **Color-Coded Status**: Easy visual identification of license states
- **Responsive Layout**: Works on desktop and mobile devices
- **Tabbed Navigation**: Organized sections for different views
- **Modal Dialogs**: Clean forms for adding/editing data

## 📱 Responsive Design

The app is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling with gradients, animations, and flexbox/grid
- **Vanilla JavaScript**: All functionality without frameworks
- **SheetJS (xlsx)**: Excel file generation library
- **localStorage API**: Client-side data persistence

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

### File Structure
```
license-monitor/
├── index.html     # Main HTML structure
├── styles.css     # All styling and animations
├── script.js      # Application logic and data management
└── README.md      # This file
```

## 🎯 Use Cases

- **IT Departments**: Track company software licenses
- **License Managers**: Monitor expiration dates and renewals
- **Finance Teams**: Budget planning for license renewals
- **Compliance**: Ensure proper license allocation
- **Small Businesses**: Simple license inventory management

## 📈 Future Enhancements

Potential features for future versions:
- Email notifications for expiring licenses
- Cost tracking per license
- Historical usage reports
- Import from Excel
- Multiple organization support
- Recurring renewal reminders

## 📝 License

This project is free to use and modify for personal or commercial purposes.

## 🙋 Support

For issues or questions:
1. Check the browser console for errors
2. Ensure JavaScript is enabled
3. Try clearing localStorage and refreshing
4. Verify you're using an up-to-date browser

---

**Last Updated**: February 2026  
**Version**: 1.0.0
