// Auth utilities for the portfolio application

// Hardcoded credentials for the simple admin interface
// In a production environment, you would use a database
const ADMIN_USER = {
  username: 'aziz3d',
  // This would typically be a hashed password in a real application
  // For simplicity, we're storing the plain password here
  password: 'azizkhan'
};

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    return true;
  }
  return false;
}
