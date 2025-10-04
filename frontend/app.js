
function showSignup() {
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('main-content').innerHTML = `
        <h2>Sign Up (Company & Admin)</h2>
        <form id="signupForm">
            <input type="text" name="company" placeholder="Company Name" required><br>
            <input type="text" name="country" placeholder="Country" required><br>
            <input type="text" name="currency" placeholder="Currency" required><br>
            <input type="text" name="admin_name" placeholder="Admin Name" required><br>
            <input type="email" name="admin_email" placeholder="Admin Email" required><br>
            <input type="password" name="admin_password" placeholder="Password" required><br>
            <button type="submit">Sign Up</button>
        </form>
        <div id="signupMsg"></div>
    `;
    document.getElementById('signupForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            company: form.company.value,
            country: form.country.value,
            currency: form.currency.value,
            admin_name: form.admin_name.value,
            admin_email: form.admin_email.value,
            admin_password: form.admin_password.value
        };
        const res = await fetch('../backend/api.php?action=signup', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        document.getElementById('signupMsg').innerText = result.success ? 'Signup successful! Please login.' : result.error;
    };
}

function showLogin() {
    document.getElementById('main-content').style.display = 'block';
    document.getElementById('main-content').innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <input type="email" name="email" placeholder="Email" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <button type="submit">Login</button>
        </form>
        <div id="loginMsg"></div>
    `;
    document.getElementById('loginForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            email: form.email.value,
            password: form.password.value
        };
        const res = await fetch('../backend/api.php?action=login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            showDashboard(result.user);
        } else {
            document.getElementById('loginMsg').innerText = result.error;
        }
    };
}

function showDashboard(user) {
    let html = `<h2>Welcome, ${user.name} (${user.role})</h2>`;
    if (user.role === 'admin') {
        html += `
            <button onclick="showCreateUser(${user.company_id})">Create User</button>
            <button onclick="showAllExpenses(${user.company_id})">View All Expenses</button>
        `;
    } else if (user.role === 'manager') {
        html += `
            <button onclick="showPendingApprovals(${user.id})">Pending Approvals</button>
            <button onclick="showTeamExpenses(${user.id})">Team Expenses</button>
        `;
    } else {
        html += `
            <button onclick="showSubmitExpense(${user.id},${user.company_id})">Submit Expense</button>
            <button onclick="showMyExpenses(${user.id})">My Expenses</button>
        `;
    }
    document.getElementById('main-content').innerHTML = html;
}

// Placeholder functions for dashboard actions
function showCreateUser(company_id) {
    document.getElementById('main-content').innerHTML += `
        <h3>Create User</h3>
        <form id="createUserForm">
            <input type="text" name="name" placeholder="Name" required><br>
            <input type="email" name="email" placeholder="Email" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <select name="role">
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
            </select><br>
            <button type="submit">Create</button>
        </form>
        <div id="createUserMsg"></div>
    `;
    document.getElementById('createUserForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            company_id,
            name: form.name.value,
            email: form.email.value,
            password: form.password.value,
            role: form.role.value
        };
        const res = await fetch('../backend/api.php?action=create_user', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        document.getElementById('createUserMsg').innerText = result.success ? 'User created!' : result.error;
    };
}

function showSubmitExpense(employee_id, company_id) {
    document.getElementById('main-content').innerHTML += `
        <h3>Submit Expense</h3>
        <form id="expenseForm">
            <input type="text" name="category" placeholder="Category" required><br>
            <input type="text" name="description" placeholder="Description" required><br>
            <input type="date" name="expense_date" required><br>
            <input type="number" name="amount" placeholder="Amount" required><br>
            <input type="text" name="currency" placeholder="Currency" required><br>
            <button type="submit">Submit</button>
        </form>
        <div id="expenseMsg"></div>
    `;
    document.getElementById('expenseForm').onsubmit = async function(e) {
        e.preventDefault();
        const form = e.target;
        const data = {
            employee_id,
            company_id,
            category: form.category.value,
            description: form.description.value,
            expense_date: form.expense_date.value,
            amount: form.amount.value,
            currency: form.currency.value
        };
        const res = await fetch('../backend/api.php?action=submit_expense', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        const result = await res.json();
        document.getElementById('expenseMsg').innerText = result.success ? 'Expense submitted!' : result.error;
    };
}
