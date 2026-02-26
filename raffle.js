// ========================================
// SUPABASE CONFIG
// ========================================
const SUPABASE_URL = 'https://jlpjwfuqwyzwphihwgql.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscGp3ZnVxd3l6d3BoaWh3Z3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNzI0NTYsImV4cCI6MjA4Njk0ODQ1Nn0.9ZOPqguWwMr3HvtCWLPaKJ51-dVMxhRuGfoV0L-M_XE';
const ADMIN_USERS = {
    'gimenezl': 'gimenez2003',
    'gambitstill': 'gambit777',
    'klassique': 'klassiquescammer123',
    'dinorex': 'papidinomamidino321'
};

function getLoggedAdmin() {
    return sessionStorage.getItem('raffle_admin_user') || 'unknown';
}

let supabaseClient;

// Initialize Supabase client
function initSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
}

// ========================================
// TICKET CALCULATION
// ========================================
function calculateTickets(wagered, bonusTickets) {
    const wagerTickets = Math.floor((wagered || 0) / 1000);
    return wagerTickets + (bonusTickets || 0);
}

// ========================================
// MONTHLY COUNTDOWN TIMER
// ========================================
function initCountdown() {
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-mins');
    const secondsEl = document.getElementById('countdown-secs');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function getEndOfMonth() {
        const now = new Date();
        // Last day of the current month, 23:59:59.999
        return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    function update() {
        const now = new Date();
        const end = getEndOfMonth();
        let diff = end - now;

        if (diff <= 0) {
            // Month has ended, reset to next month
            diff = 0;
            setTimeout(() => {
                update();
            }, 1000);
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(mins).padStart(2, '0');
        secondsEl.textContent = String(secs).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

// ========================================
// PUBLIC RAFFLE PAGE LOGIC
// ========================================
async function loadPublicTickets() {
    const totalEl = document.getElementById('total-tickets');
    const listEl = document.getElementById('ticket-list');

    if (!totalEl || !listEl) return;

    try {
        initSupabase();
        const { data, error } = await supabaseClient
            .from('raffle_tickets')
            .select('*')
            .order('tickets', { ascending: false });

        if (error) throw error;

        // Update total
        const total = data.reduce((sum, entry) => sum + entry.tickets, 0);
        animateCounter(totalEl, total);

        // Update list
        if (data.length === 0) {
            listEl.innerHTML = '<div class="ticket-list-empty">No entries yet. Be the first to join!</div>';
            return;
        }

        listEl.innerHTML = data.map((entry, i) => {
            const wagered = entry.wagered || 0;
            const formattedWager = '$' + wagered.toLocaleString();
            return `
            <div class="ticket-list-item ${i < 3 ? 'ticket-top-' + (i + 1) : ''}">
                <div class="ticket-user">
                    <span class="ticket-position">${i + 1}</span>
                    <span class="ticket-username">${escapeHtml(entry.username)}</span>
                </div>
                <div class="ticket-wagered">${formattedWager}</div>
                <div class="ticket-count">${entry.tickets} 🎟️</div>
            </div>
        `;
        }).join('');

    } catch (err) {
        console.error('Error loading tickets:', err);
        if (listEl) {
            listEl.innerHTML = '<div class="ticket-list-empty">Failed to load entries. Please try again later.</div>';
        }
    }
}

function animateCounter(element, target) {
    const duration = 1500;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment >= 0 && current >= target) || (increment < 0 && current <= target)) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString();
    }, 16);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// ADMIN DASHBOARD LOGIC
// ========================================
function initAdmin() {
    const loginSection = document.getElementById('admin-login');
    const dashboardSection = document.getElementById('admin-dashboard');
    const loginBtn = document.getElementById('admin-login-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const usernameInput = document.getElementById('admin-username');
    const passwordInput = document.getElementById('admin-password');
    const errorEl = document.getElementById('admin-error');

    if (!loginSection || !dashboardSection) return;

    // Check if already logged in
    if (sessionStorage.getItem('raffle_admin') === 'true' && sessionStorage.getItem('raffle_admin_user')) {
        showDashboard();
    }

    // Login
    loginBtn?.addEventListener('click', () => {
        const user = usernameInput?.value.trim().toLowerCase();
        const pwd = passwordInput.value;

        if (user && ADMIN_USERS[user] && ADMIN_USERS[user] === pwd) {
            sessionStorage.setItem('raffle_admin', 'true');
            sessionStorage.setItem('raffle_admin_user', user);
            showDashboard();
        } else {
            errorEl.textContent = 'Invalid username or password. Try again.';
            errorEl.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    });

    passwordInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') loginBtn.click();
    });

    usernameInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') passwordInput?.focus();
    });

    // Logout
    logoutBtn?.addEventListener('click', () => {
        sessionStorage.removeItem('raffle_admin');
        sessionStorage.removeItem('raffle_admin_user');
        location.reload();
    });

    // Add tickets
    const addBtn = document.getElementById('add-ticket-btn');
    addBtn?.addEventListener('click', addTickets);

    document.getElementById('ticket-username')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    // Clear all
    document.getElementById('clear-all-btn')?.addEventListener('click', clearAllTickets);

    // Copy list
    document.getElementById('copy-list-btn')?.addEventListener('click', copyExpandedList);

    // Live preview of total tickets in admin form
    const wageredInput = document.getElementById('ticket-wagered');
    const bonusInput = document.getElementById('ticket-bonus');
    const previewEl = document.getElementById('ticket-preview');

    function updatePreview() {
        if (!wageredInput || !bonusInput || !previewEl) return;
        const wagered = parseFloat(wageredInput.value) || 0;
        const bonus = parseInt(bonusInput.value) || 0;
        const total = calculateTickets(wagered, bonus);
        const wagerTickets = Math.floor(wagered / 1000);
        previewEl.textContent = `${wagerTickets} (wager) + ${bonus} (bonus) = ${total} total tickets`;
    }

    wageredInput?.addEventListener('input', updatePreview);
    bonusInput?.addEventListener('input', updatePreview);
    updatePreview();

    function showDashboard() {
        loginSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        // Show logged-in admin name
        const welcomeEl = document.getElementById('admin-welcome');
        if (welcomeEl) welcomeEl.textContent = `Logged in as: ${getLoggedAdmin()}`;
        loadAdminTickets();
    }
}

async function loadAdminTickets() {
    const tbody = document.getElementById('admin-ticket-tbody');
    const totalTicketsEl = document.getElementById('admin-total-tickets');
    const totalUsersEl = document.getElementById('admin-total-users');

    if (!tbody) return;

    try {
        initSupabase();
        const { data, error } = await supabaseClient
            .from('raffle_tickets')
            .select('*')
            .order('tickets', { ascending: false });

        if (error) throw error;

        // Update stats
        const totalTickets = data.reduce((sum, e) => sum + e.tickets, 0);
        if (totalTicketsEl) totalTicketsEl.textContent = totalTickets.toLocaleString();
        if (totalUsersEl) totalUsersEl.textContent = data.length;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">No tickets yet.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((entry, i) => {
            const wagered = entry.wagered || 0;
            const bonusTickets = entry.bonus_tickets || 0;
            const wagerTickets = Math.floor(wagered / 1000);
            const addedBy = entry.added_by || '—';
            return `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${escapeHtml(entry.username)}</strong></td>
                <td class="admin-wagered-cell">$${wagered.toLocaleString()}</td>
                <td>${wagerTickets}</td>
                <td>${bonusTickets}</td>
                <td class="admin-tickets-cell">${entry.tickets}</td>
                <td class="admin-added-by-cell">${escapeHtml(addedBy)}</td>
                <td class="admin-actions-cell">
                    <button class="admin-btn-edit" onclick="editTicket(${entry.id}, '${escapeHtml(entry.username)}', ${wagered}, ${bonusTickets})" aria-label="Edit ${escapeHtml(entry.username)}">✏️</button>
                    <button class="admin-btn-delete" onclick="deleteTicket(${entry.id})" aria-label="Delete ${escapeHtml(entry.username)}">🗑️</button>
                </td>
            </tr>
        `;
        }).join('');

    } catch (err) {
        console.error('Error loading admin tickets:', err);
        tbody.innerHTML = '<tr><td colspan="8" class="admin-table-empty">Error loading data.</td></tr>';
    }
}

async function addTickets() {
    const usernameInput = document.getElementById('ticket-username');
    const wageredInput = document.getElementById('ticket-wagered');
    const bonusInput = document.getElementById('ticket-bonus');

    const username = usernameInput.value.trim();
    const wagered = parseFloat(wageredInput.value) || 0;
    const bonusTickets = parseInt(bonusInput.value) || 0;
    const totalTickets = calculateTickets(wagered, bonusTickets);

    if (!username) {
        alert('Please enter a valid username.');
        return;
    }

    if (wagered <= 0 && bonusTickets <= 0) {
        alert('Please enter a wagered amount or bonus tickets.');
        return;
    }

    // Confirmation dialog
    if (!confirm(`Add entry for "${username}"?\n\nWagered: $${wagered.toLocaleString()}\nBonus Tickets: ${bonusTickets}\nTotal Tickets: ${totalTickets}\n\nThis will update the raffle entries.`)) {
        return;
    }

    try {
        initSupabase();

        // Check if user already exists
        const { data: existing } = await supabaseClient
            .from('raffle_tickets')
            .select('*')
            .eq('username', username)
            .single();

        if (existing) {
            // Update existing user — replace wagered and bonus, recalculate tickets
            const newWagered = wagered;
            const newBonus = bonusTickets;
            const newTotal = calculateTickets(newWagered, newBonus);

            const { error } = await supabaseClient
                .from('raffle_tickets')
                .update({
                    wagered: newWagered,
                    bonus_tickets: newBonus,
                    tickets: newTotal,
                    added_by: getLoggedAdmin(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);

            if (error) throw error;
        } else {
            // Insert new user
            const { error } = await supabaseClient
                .from('raffle_tickets')
                .insert({
                    username,
                    wagered,
                    bonus_tickets: bonusTickets,
                    tickets: totalTickets,
                    added_by: getLoggedAdmin()
                });

            if (error) throw error;
        }

        usernameInput.value = '';
        wageredInput.value = '';
        bonusInput.value = '0';
        usernameInput.focus();

        // Reset preview
        const previewEl = document.getElementById('ticket-preview');
        if (previewEl) previewEl.textContent = '0 (wager) + 0 (bonus) = 0 total tickets';

        loadAdminTickets();

    } catch (err) {
        console.error('Error adding tickets:', err);
        alert('Error adding tickets: ' + err.message);
    }
}

async function editTicket(id, username, currentWagered, currentBonus) {
    const newWagered = prompt(`Edit wagered amount for "${username}"\nCurrent: $${currentWagered.toLocaleString()}\n\nEnter new wagered amount ($):`);

    if (newWagered === null) return;
    const wagered = parseFloat(newWagered);
    if (isNaN(wagered) || wagered < 0) {
        alert('Please enter a valid wagered amount.');
        return;
    }

    const newBonus = prompt(`Edit bonus tickets for "${username}"\nCurrent: ${currentBonus}\n\nEnter new bonus ticket count:`);

    if (newBonus === null) return;
    const bonus = parseInt(newBonus);
    if (isNaN(bonus) || bonus < 0) {
        alert('Please enter a valid bonus ticket count.');
        return;
    }

    const totalTickets = calculateTickets(wagered, bonus);

    if (!confirm(`Update "${username}"?\n\nWagered: $${wagered.toLocaleString()}\nBonus Tickets: ${bonus}\nTotal Tickets: ${totalTickets}`)) {
        return;
    }

    try {
        initSupabase();
        const { error } = await supabaseClient
            .from('raffle_tickets')
            .update({
                wagered: wagered,
                bonus_tickets: bonus,
                tickets: totalTickets,
                added_by: getLoggedAdmin(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
        loadAdminTickets();

    } catch (err) {
        console.error('Error editing ticket:', err);
        alert('Error editing ticket: ' + err.message);
    }
}

async function deleteTicket(id) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
        initSupabase();
        const { error } = await supabaseClient
            .from('raffle_tickets')
            .delete()
            .eq('id', id);

        if (error) throw error;
        loadAdminTickets();

    } catch (err) {
        console.error('Error deleting ticket:', err);
        alert('Error deleting ticket: ' + err.message);
    }
}

async function clearAllTickets() {
    if (!confirm('⚠️ Are you sure you want to DELETE ALL tickets? This cannot be undone!')) return;
    if (!confirm('This is your last chance. Delete everything?')) return;

    try {
        initSupabase();
        const { error } = await supabaseClient
            .from('raffle_tickets')
            .delete()
            .neq('id', 0); // Delete all rows

        if (error) throw error;
        loadAdminTickets();

    } catch (err) {
        console.error('Error clearing tickets:', err);
        alert('Error clearing tickets: ' + err.message);
    }
}

async function copyExpandedList() {
    try {
        initSupabase();
        const { data, error } = await supabaseClient
            .from('raffle_tickets')
            .select('*')
            .order('username', { ascending: true });

        if (error) throw error;

        if (data.length === 0) {
            alert('No tickets to copy. Add some users first.');
            return;
        }

        // Generate expanded list: each username repeated by ticket count
        const expandedList = [];
        data.forEach(entry => {
            for (let i = 0; i < entry.tickets; i++) {
                expandedList.push(entry.username);
            }
        });

        // Join with newlines and copy to clipboard
        const textToCopy = expandedList.join('\n');
        await navigator.clipboard.writeText(textToCopy);

        alert(`✅ Copied ${expandedList.length} entries to clipboard!`);

    } catch (err) {
        console.error('Error copying list:', err);
        alert('Error copying list: ' + err.message);
    }
}

// ========================================
// INIT
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    loadPublicTickets();
    initCountdown();
    initAdmin();
});
