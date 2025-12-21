# Paris Stay - Availability Calendar

A simple and clean GitHub Pages website for managing stay bookings at your Paris place. Visitors can view availability, select check-in/check-out dates, and submit booking requests via GitHub Issues.

## 🌟 Features

- **Full-page calendar** with easy date selection
- **Check-in/check-out date picker** for multi-day stays
- **Visual availability indicators** (available, unavailable, selected)
- **Booking form** collecting name, email, number of guests, and message
- **GitHub Issues integration** for booking request submissions
- **Easy management** via a simple JSON file

## 🚀 Setup Instructions

### 1. Configure GitHub Repository

1. Go to your repository settings
2. Navigate to **Pages** section (under "Code and automation")
3. Under "Source", select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**

### 2. Update Configuration

Edit `script.js` and replace the following variables at the top of the file:

```javascript
const REPO_OWNER = 'YOUR_GITHUB_USERNAME'; // Replace with your GitHub username
const REPO_NAME = 'YOUR_REPO_NAME'; // Replace with your repository name (e.g., 'paris-availability')
```

### 3. Manage Unavailable Dates

Edit `bookings.json` to add or remove unavailable dates:

```json
{
  "unavailable": [
    "2024-12-25",
    "2024-12-26",
    "2025-01-01"
  ]
}
```

- Dates should be in `YYYY-MM-DD` format
- Add dates that are already booked or unavailable
- Commit and push changes to update the calendar

### 4. Access Your Website

Your website will be available at:
```
https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/
```

## 📝 How It Works

1. **Visitors** select check-in and check-out dates on the calendar
2. They fill out the booking form with their details
3. Upon submission, a **GitHub Issue** is created automatically with all booking details
4. You review the issue and respond to confirm or decline
5. Once confirmed, add those dates to `bookings.json` to mark them as unavailable

## 🔧 Managing Bookings

### Adding Unavailable Dates

1. Open `bookings.json`
2. Add the date(s) in `YYYY-MM-DD` format to the "unavailable" array
3. Commit and push the changes
4. The calendar will automatically update

### Processing Booking Requests

1. Go to your repository's **Issues** tab
2. Review new booking requests (they'll have the "booking" label)
3. Respond to the guest via email or issue comments
4. If confirmed, add the dates to `bookings.json`
5. Close the issue

## 🎨 Customization

### Colors
Edit `styles.css` to change the color scheme. The main brand color is `#667eea` (purple-blue).

### Text
Edit `index.html` to change the title, subtitle, or any text content.

### Form Fields
Modify `index.html` and `script.js` to add or remove form fields as needed.

## 📱 Mobile Friendly

The calendar is fully responsive and works great on mobile devices.

## 🐛 Troubleshooting

- **Calendar not showing unavailable dates**: Check that `bookings.json` is properly formatted and dates are in `YYYY-MM-DD` format
- **GitHub Issues not opening**: Make sure you've updated `REPO_OWNER` and `REPO_NAME` in `script.js`
- **Website not loading**: Check GitHub Pages settings and ensure the site is deployed from the correct branch

## 📄 License

Free to use and modify as needed.
