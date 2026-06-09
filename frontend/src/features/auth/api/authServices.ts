/**
 * Basic authentication service for admin login.
 * @param {string} username - The admin username.
 * @param {string} password - The admin password.
 * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the login was successful.
 */
export async function loginAdmin(username: string, password: string): Promise<boolean> {
  try {
    //DONT EDIT THE URL IT WAS LOOKING ON PORT 5127 BEFORE THIS 5000 IS THE BACKEND PORT
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            throw new Error('Failed to login: ' + response.statusText);
        }
        return true;
    } catch (error) {
        console.error('Error during admin login:', error);
        return false;
    }
}
