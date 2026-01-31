// --- FIREBASE CONFIGURATION (REPLACE WITH YOUR KEYS) ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

// State to track if user is already logged in
let currentUser = null;

// --- AUTHENTICATION LOGIC ---

// 1. Check Login State immediately when page loads
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in.
        currentUser = user;
        console.log("User already logged in:", user.displayName);
        
        // Optional: Update UI to welcome them
        const greeting = document.getElementById('user-greeting');
        if(greeting) {
            greeting.innerText = `Welcome back, ${user.displayName.split(' ')[0]}`;
            greeting.style.opacity = 1;
        }
    } else {
        // No user is signed in.
        currentUser = null;
    }
});

// 2. Handle "Begin Setup" Click
function handleStartClick() {
    if (currentUser) {
        // If already logged in, SKIP login card, go straight to Q1 (Card 2)
        nextCardSpecific(1, 2); 
    } else {
        // If not logged in, go to Login (Card Login)
        // Card Login is technically card-login, so we custom transition
        transitionToCard('card-1', 'card-login');
    }
}

// 3. Handle Google Sign In
function signInWithGoogle() {
    auth.signInWithPopup(provider)
        .then((result) => {
            // Successful login
            currentUser = result.user;
            // Move to first question (Card 2)
            transitionToCard('card-login', 'card-2');
        })
        .catch((error) => {
            alert("Login Failed: " + error.message);
        });
}

function skipLogin() {
    // User chose to continue as guest
    transitionToCard('card-login', 'card-2');
}

// --- STANDARD NAVIGATION FUNCTIONS ---

// Function to handle "Next" button clicks with Validation
function validateAndNext(currentCardId) {
    const card = document.getElementById(`card-${currentCardId}`);
    const type = card.getAttribute('data-type');
    let isValid = false;

    if (type === 'input') {
        const input = card.querySelector('input');
        if (input && input.value.trim() !== "") isValid = true;
    } else if (type === 'checkbox') {
        const checkboxes = card.querySelectorAll('input[type="checkbox"]:checked');
        if (checkboxes.length > 0) isValid = true;
    } else {
        isValid = true;
    }

    if (isValid) {
        const errorMsg = document.getElementById(`error-${currentCardId}`);
        if(errorMsg) errorMsg.style.display = 'none';
        nextCard(currentCardId);
    } else {
        const errorMsg = document.getElementById(`error-${currentCardId}`);
        if(errorMsg) errorMsg.style.display = 'block';
    }
}

// Standard sequential transition
function nextCard(currentCardId) {
    const nextId = currentCardId + 1;
    nextCardSpecific(currentCardId, nextId);
}

// Helper to transition between specific IDs
function nextCardSpecific(currentId, nextId) {
    transitionToCard(`card-${currentId}`, `card-${nextId}`);
}

// Core Transition Logic
function transitionToCard(currentCardDivId, nextCardDivId) {
    const currentCard = document.getElementById(currentCardDivId);
    const nextCard = document.getElementById(nextCardDivId);

    if (currentCard) {
        currentCard.classList.remove('active');
        currentCard.classList.add('slide-out');
        setTimeout(() => {
            currentCard.style.display = 'none';
        }, 600);
    }

    if (nextCard) {
        nextCard.style.display = 'flex'; 
        setTimeout(() => {
            nextCard.classList.add('active');
        }, 50);
    }
}

// Option Selection (Auto-advance)
function selectOption(btn, currentCardId) {
    // Visual feedback
    btn.style.backgroundColor = "#1F2A36"; 
    btn.style.color = "#ffffff";
    btn.style.borderColor = "#1F2A36";
    
    // Auto advance
    setTimeout(() => {
        nextCard(currentCardId);
    }, 300);
}

// ... [KEEP FIREBASE CONFIG & AUTH LOGIC AT THE TOP] ...

// [ADD THIS TO THE END OF YOUR SCRIPT]

// --- DASHBOARD LOGIC ---

function enterDashboard() {
    // 1. Hide Setup Wizard
    const wizard = document.getElementById('setup-wizard');
    wizard.style.opacity = '0';
    
    setTimeout(() => {
        wizard.style.display = 'none';
        
        // 2. Show Dashboard
        const dash = document.getElementById('dashboard-view');
        dash.style.display = 'flex';
        
        // 3. Initialize Dashboard Data
        initDashboard();
    }, 500);
}

function initDashboard() {
    // Set Name
    if (currentUser && currentUser.displayName) {
        document.getElementById('dash-name').innerText = currentUser.displayName.split(' ')[0];
    }

    // Set Date
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'short' };
    const today = new Date();
    document.getElementById('current-date').innerText = today.toLocaleDateString('en-GB', dateOptions);

    // Generate Calendar Strip (Current Week)
    generateCalendar();
    
    // Refresh Icons (if using Lucide)
    if(window.lucide) lucide.createIcons();
}

function generateCalendar() {
    const calendarEl = document.getElementById('week-calendar');
    calendarEl.innerHTML = ''; // Clear
    
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Create previous 2 days, today, and next 2 days (5 days total for mobile fit)
    for (let i = -2; i <= 2; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
        
        const dayName = days[d.getDay()];
        const dayNum = d.getDate();
        const isActive = i === 0 ? 'active-day' : '';

        const html = `
            <div class="day-col ${isActive}">
                <span class="day-name">${dayName}</span>
                <span class="day-num">${dayNum}</span>
            </div>
        `;
        calendarEl.innerHTML += html;
    }
}