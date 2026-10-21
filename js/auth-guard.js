/* js/auth-guard.js - Authentication & Role Authorization Guard */

async function checkAuthGuard(requiredRole = 'user') {
  let user = null;

  // 1. Check PHP backend session first
  try {
    const response = await fetch('../api/check_session.php');
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.data && data.data.user) {
        user = data.data.user;
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }
  } catch (err) {
    console.warn('Backend check_session error:', err);
  }

  // 2. Check localStorage session if network is delayed
  if (!user) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        user = JSON.parse(stored);
      } catch (e) {
        user = null;
      }
    }
  }

  // 3. If unauthenticated, redirect to login page
  if (!user || !user.role) {
    localStorage.removeItem('currentUser');
    window.location.href = '../login.html';
    return null;
  }

  // 4. Validate role matching
  if (requiredRole && requiredRole !== 'any') {
    if (user.role !== requiredRole) {
      if (user.role === 'admin') {
        window.location.href = '../admin/dashboard.html';
      } else {
        window.location.href = '../user/dashboard.html';
      }
      return null;
    }
  }

  return user;
}
