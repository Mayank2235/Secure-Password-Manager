// Store secret
async function storeSecret() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Username and Password are required!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/store-secret', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            alert('Secret stored successfully');
        } else {
            const errorData = await response.json();
            console.error('Error storing secret:', errorData);
            alert('Failed to store secret');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to store secret');
    }
}

// Retrieve secret by username
async function retrieveSecret() {
    const username = document.getElementById('retrieve-username').value;

    if (!username) {
        alert('Username is required to retrieve secret!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/retrieve-secret', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Retrieved Password for ${username}: ${data.password}`);
        } else {
            const errorData = await response.json();
            console.error('Error retrieving secret:', errorData);
            alert('Failed to retrieve secret');
        }
    } catch (error) {
        console.error('Error retrieving secret:', error);
        alert('Failed to retrieve secret');
    }
}

// Generate a strong random password
function generateStrongPassword() {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    document.getElementById('password').value = password;
}

// Add event listeners for buttons
document.getElementById('generatePasswordBtn').addEventListener('click', generateStrongPassword);
document.getElementById('storePasswordBtn').addEventListener('click', storeSecret);
document.getElementById('retrievePasswordBtn').addEventListener('click', retrieveSecret);
