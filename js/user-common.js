/* js/user-common.js - Persistent Sidebar Navigation, Toast Notifications & Custom Logout Modal */

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconSvg = type === 'success' 
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  toast.innerHTML = `<span style="display:flex;align-items:center;">${iconSvg}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Custom Glassmorphic Logout Confirmation Modal
function getOrCreateLogoutModal() {
  let modal = document.getElementById('logoutModalOverlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'logoutModalOverlay';
    modal.className = 'logout-modal-overlay';
    modal.innerHTML = `
      <div class="logout-modal-card">
        <div class="logout-icon-wrapper">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </div>
        <h3 class="logout-modal-title">ยืนยันการออกจากระบบ</h3>
        <p class="logout-modal-subtitle">คุณต้องการออกจากระบบใช่หรือไม่?</p>
        <div class="logout-modal-actions">
          <button type="button" id="btnCancelLogout" class="btn btn-outline" style="flex: 1; justify-content: center; padding: 0.75rem;">ยกเลิก</button>
          <button type="button" id="btnConfirmLogout" class="btn btn-danger" style="flex: 1; justify-content: center; padding: 0.75rem;">ออกจากระบบ</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const cancelBtn = modal.querySelector('#btnCancelLogout');
    const confirmBtn = modal.querySelector('#btnConfirmLogout');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = `<span>กำลังออกจากระบบ...</span>`;
        localStorage.removeItem('currentUser');
        try {
          await fetch('../api/logout.php', { method: 'POST' });
          window.location.href = '../login.html';
        } catch (err) {
          window.location.href = '../login.html';
        }
      });
    }
  }
  return modal;
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle & Backdrop Overlay
  const toggleBtn = document.querySelector('.mobile-toggle-btn');
  const sidebar = document.querySelector('.app-sidebar');
  if (toggleBtn && sidebar) {
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    const toggleSidebar = () => {
      const isShow = sidebar.classList.toggle('show');
      backdrop.classList.toggle('active', isShow);
    };

    toggleBtn.addEventListener('click', toggleSidebar);

    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('show');
      backdrop.classList.remove('active');
    });

    sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) {
          sidebar.classList.remove('show');
          backdrop.classList.remove('active');
        }
      });
    });
  }

  // Custom Glassmorphic Logout Handler
  const logoutBtns = document.querySelectorAll('.btn-sidebar-logout, .btn-logout-action');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = getOrCreateLogoutModal();
      const confirmBtn = modal.querySelector('#btnConfirmLogout');
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<span>ออกจากระบบ</span>`;
      }
      modal.classList.add('active');
    });
  });
});

// Universal Heartbeat Preloader Controller
function initPreloader() {
  let preloader = document.getElementById('app-preloader');
  if (!preloader && document.body) {
    preloader = document.createElement('div');
    preloader.id = 'app-preloader';
    preloader.innerHTML = `
      <div class="preloader-content-box">
        <div class="preloader-heart-wrapper">
          <div class="preloader-pulse-ring"></div>
          <div class="preloader-pulse-ring"></div>
          <div class="preloader-heart-circle">
            <svg class="preloader-heart-icon" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="#ef4444" stroke="#ffffff"></path>
            </svg>
          </div>
        </div>
        <div class="preloader-brand-title">ดูแลสุขภาพใจ</div>
        <div class="preloader-subtitle-text">
          <span>กำลังโหลดข้อมูล</span>
          <span class="preloader-loading-dots">
            <span></span><span></span><span></span>
          </span>
        </div>
        <svg class="preloader-ecg-line" viewBox="0 0 140 28" fill="none">
          <polyline class="preloader-ecg-polyline" points="0,14 35,14 45,4 55,24 65,9 75,19 85,14 140,14" stroke="rgba(255,255,255,0.9)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    `;
    document.body.insertBefore(preloader, document.body.firstChild);
  }

  const dismissPreloader = () => {
    const el = document.getElementById('app-preloader');
    if (el) {
      setTimeout(() => {
        el.classList.add('loaded');
        setTimeout(() => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }, 500);
      }, 450);
    }
  };

  if (document.readyState === 'complete') {
    dismissPreloader();
  } else {
    window.addEventListener('load', dismissPreloader);
    setTimeout(dismissPreloader, 1500);
  }
}

if (document.body) {
  initPreloader();
} else {
  document.addEventListener('DOMContentLoaded', initPreloader);
}

