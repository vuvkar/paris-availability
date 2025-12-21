// Configuration
const REPO_OWNER = 'vuvkar'; // Replace with your GitHub username
const REPO_NAME = 'paris-availability'; // Replace with your repository name

// State
let currentDate = new Date();
let checkInDate = null;
let checkOutDate = null;
let unavailableDates = [];

// Load unavailable dates from JSON file
async function loadUnavailableDates() {
    try {
        const response = await fetch('bookings.json');
        const data = await response.json();
        unavailableDates = data.unavailable.map(dateStr => new Date(dateStr));
    } catch (error) {
        console.error('Error loading unavailable dates:', error);
        unavailableDates = [];
    }
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display
function formatDisplayDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Check if date is unavailable
function isDateUnavailable(date) {
    const dateStr = formatDate(date);
    return unavailableDates.some(unavailableDate => 
        formatDate(unavailableDate) === dateStr
    );
}

// Check if date is in the past
function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

// Check if date is in selected range
function isDateInRange(date) {
    if (!checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
}

// Render calendar
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update month/year display
    document.getElementById('monthYear').textContent = 
        currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendar.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        const dateStr = formatDate(date);
        const checkInStr = checkInDate ? formatDate(checkInDate) : null;
        const checkOutStr = checkOutDate ? formatDate(checkOutDate) : null;
        
        if (isPastDate(date)) {
            dayElement.classList.add('past');
        } else if (isDateUnavailable(date)) {
            dayElement.classList.add('unavailable');
        } else {
            dayElement.classList.add('available');
            
            if (dateStr === checkInStr || dateStr === checkOutStr) {
                dayElement.classList.add('selected');
            } else if (isDateInRange(date)) {
                dayElement.classList.add('in-range');
            }
            
            dayElement.addEventListener('click', () => selectDate(date));
        }
        
        calendar.appendChild(dayElement);
    }
}

// Select date
function selectDate(date) {
    if (isPastDate(date) || isDateUnavailable(date)) return;
    
    // If no check-in or both dates are set, set as check-in
    if (!checkInDate || (checkInDate && checkOutDate)) {
        checkInDate = date;
        checkOutDate = null;
    } 
    // If check-in is set but no check-out
    else if (checkInDate && !checkOutDate) {
        // If selected date is before check-in, swap them
        if (date < checkInDate) {
            checkOutDate = checkInDate;
            checkInDate = date;
        } else {
            checkOutDate = date;
        }
        
        // Check if any dates in range are unavailable
        const datesInRange = getDatesInRange(checkInDate, checkOutDate);
        const hasUnavailable = datesInRange.some(d => isDateUnavailable(d));
        
        if (hasUnavailable) {
            alert('Some dates in your selected range are unavailable. Please select different dates.');
            checkInDate = null;
            checkOutDate = null;
        }
    }
    
    updateFormVisibility();
    renderCalendar();
}

// Get all dates in range
function getDatesInRange(start, end) {
    const dates = [];
    const current = new Date(start);
    
    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    
    return dates;
}

// Update form visibility and display selected dates
function updateFormVisibility() {
    const form = document.getElementById('bookingForm');
    const selectedDatesDiv = document.getElementById('selectedDates');
    
    if (checkInDate && checkOutDate) {
        form.classList.add('visible');
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        selectedDatesDiv.innerHTML = `
            <strong>Check-in:</strong> ${formatDisplayDate(checkInDate)}<br>
            <strong>Check-out:</strong> ${formatDisplayDate(checkOutDate)}<br>
            <strong>Duration:</strong> ${nights} night${nights > 1 ? 's' : ''}
        `;
    } else {
        form.classList.remove('visible');
    }
}

// Handle form submission
document.getElementById('submitForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const guests = document.getElementById('guests').value;
    const message = document.getElementById('message').value;
    
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Create GitHub issue content
    const issueTitle = `Booking Request: ${formatDisplayDate(checkInDate)} - ${formatDisplayDate(checkOutDate)}`;
    const issueBody = `
## Booking Request

**Check-in Date:** ${formatDisplayDate(checkInDate)}
**Check-out Date:** ${formatDisplayDate(checkOutDate)}
**Duration:** ${nights} night${nights > 1 ? 's' : ''}

**Name:** ${name}
**Email:** ${email}
**Number of Guests:** ${guests}

${message ? `**Message:**\n${message}` : ''}

---
*Submitted via Paris Stay Booking Calendar*
    `.trim();
    
    // Create GitHub issue URL
    const githubIssueUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=booking`;
    
    // Open GitHub issue creation page
    window.open(githubIssueUrl, '_blank');
    
    // Reset form
    setTimeout(() => {
        if (confirm('Booking request submitted! Would you like to make another booking?')) {
            checkInDate = null;
            checkOutDate = null;
            document.getElementById('submitForm').reset();
            updateFormVisibility();
            renderCalendar();
        }
    }, 1000);
});

// Navigation buttons
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Initialize
async function init() {
    await loadUnavailableDates();
    renderCalendar();
}

init();

