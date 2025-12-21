// Configuration
const WEB3FORMS_ACCESS_KEY = '56831448-cd53-4aca-8e41-0e87d94e0b2d'; // Get your free key from https://web3forms.com

// State
let currentDate = new Date();
let checkInDate = null;
let checkOutDate = null;
let unavailableDates = [];
let currentLang = 'hy'; // Default language: Armenian

// Translations
const translations = {
    en: {
        checkIn: 'Check-in:',
        checkOut: 'Check-out:',
        duration: 'Duration:',
        nights: 'night',
        nightsPlural: 'nights',
        sending: 'Sending...',
        submitBtn: 'Submit Booking Request',
        successMsg: '🎉 Booking request sent successfully! We will contact you at',
        successMsgEnd: 'shortly.',
        errorMsg: '❌ Failed to send booking request:',
        errorMsgEnd: '\n\nPlease try again or contact us directly.',
        networkError: '❌ Failed to send booking request. Error:',
        networkErrorEnd: '\n\nPlease check your internet connection and try again.',
        unavailableAlert: 'Some dates in your selected range are unavailable. Please select different dates.',
        dayHeaders: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    hy: {
        checkIn: 'Ժամանում:',
        checkOut: 'Մեկնում:',
        duration: 'Տևողություն:',
        nights: 'գիշեր',
        nightsPlural: 'գիշեր',
        sending: 'Ուղարկվում է...',
        submitBtn: 'Ուղարկել Ամրագրման Հայտը',
        successMsg: '🎉 Ամրագրման հայտը հաջողությամբ ուղարկվել է։ Մենք կկապվենք ձեզ հետ',
        successMsgEnd: 'հասցեով։',
        errorMsg: '❌ Չհաջողվեց ուղարկել ամրագրման հայտը:',
        errorMsgEnd: '\n\nԽնդրում ենք փորձել կրկին կամ կապվել մեզ հետ ուղղակիորեն։',
        networkError: '❌ Չհաջողվեց ուղարկել ամրագրման հայտը։ Սխալ:',
        networkErrorEnd: '\n\nԽնդրում ենք ստուգել ձեր ինտերնետ կապը և փորձել կրկին։',
        unavailableAlert: 'Ձեր ընտրված ամսաթվերից մի քանիսը զբաղված են։ Խնդրում ենք ընտրել այլ ամսաթվեր։',
        dayHeaders: ['Կիր', 'Երկ', 'Երք', 'Չոր', 'Հնգ', 'Ուր', 'Շաբ'],
        months: ['Հունվար', 'Փետրվար', 'Մարտ', 'Ապրիլ', 'Մայիս', 'Հունիս', 'Հուլիս', 'Օգոստոս', 'Սեպտեմբեր', 'Հոկտեմբեր', 'Նոյեմբեր', 'Դեկտեմբեր']
    }
};

// Get current translation
const t = (key) => translations[currentLang][key];

// Switch language
function switchLanguage(lang) {
    currentLang = lang;
    
    // Update HTML lang attribute
    document.documentElement.lang = lang === 'hy' ? 'hy' : 'en';
    
    // Update all elements with data-en and data-hy attributes
    document.querySelectorAll('[data-en][data-hy]').forEach(element => {
        element.textContent = lang === 'hy' ? element.getAttribute('data-hy') : element.getAttribute('data-en');
    });
    
    // Update language buttons
    document.getElementById('langAm').classList.toggle('active', lang === 'hy');
    document.getElementById('langEn').classList.toggle('active', lang === 'en');
    
    // Re-render calendar with new language
    renderCalendar();
    updateFormVisibility();
}

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
    const day = date.getDate();
    const month = t('months')[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
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
    const monthName = t('months')[month];
    document.getElementById('monthYear').textContent = `${monthName} ${year}`;
    
    // Add day headers
    const dayHeaders = t('dayHeaders');
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
            alert(t('unavailableAlert'));
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
        const nightsText = nights === 1 ? t('nights') : t('nightsPlural');
        selectedDatesDiv.innerHTML = `
            <strong>${t('checkIn')}</strong> ${formatDisplayDate(checkInDate)}<br>
            <strong>${t('checkOut')}</strong> ${formatDisplayDate(checkOutDate)}<br>
            <strong>${t('duration')}</strong> ${nights} ${nightsText}
        `;
    } else {
        form.classList.remove('visible');
    }
}

// Handle form submission
document.getElementById('submitForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = t('sending');
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const guests = document.getElementById('guests').value;
    const message = document.getElementById('message').value;
    
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Prepare form data for Web3Forms
    const formData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Paris Stay Booking Request: ${formatDisplayDate(checkInDate)} - ${formatDisplayDate(checkOutDate)}`,
        name: name,
        email: email,
        message: `
Booking Details:
━━━━━━━━━━━━━━━━
Check-in: ${formatDisplayDate(checkInDate)}
Check-out: ${formatDisplayDate(checkOutDate)}
Duration: ${nights} night${nights > 1 ? 's' : ''}
Number of Guests: ${guests}

${message ? 'Guest Message:\n' + message : 'No additional message.'}
        `.trim()
    };
    
    try {
        console.log('Submitting booking request...', formData);
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        console.log('Web3Forms response:', result);
        
        if (result.success) {
            alert(`${t('successMsg')} ${email} ${t('successMsgEnd')}`);
            
            // Reset form
            checkInDate = null;
            checkOutDate = null;
            document.getElementById('submitForm').reset();
            updateFormVisibility();
            renderCalendar();
        } else {
            console.error('Web3Forms error:', result);
            alert(`${t('errorMsg')} ${result.message || 'Unknown error'}${t('errorMsgEnd')}`);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert(`${t('networkError')} ${error.message}${t('networkErrorEnd')}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
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

// Language switcher buttons
document.getElementById('langAm').addEventListener('click', () => {
    switchLanguage('hy');
});

document.getElementById('langEn').addEventListener('click', () => {
    switchLanguage('en');
});

// Initialize
async function init() {
    await loadUnavailableDates();
    renderCalendar();
}

init();

