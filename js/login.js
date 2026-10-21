/* js/login.js - Login Page Handler (Always Show Login Screen) */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const alertBox  = document.getElementById('alertBox');
  const submitBtn = document.getElementById('submitBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeIcon = document.getElementById('eyeIcon');

  // Toggle Password Visibility
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      if (eyeIcon) {
        eyeIcon.innerHTML = isPassword
          ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`
          : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
      }
    });
  }



  // Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();

      if (!username || !password) {
        showAlert('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านให้ครบถ้วน', 'danger');
        return;
      }

      setLoading(true);

      try {
        const response = await fetch('api/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.status === 'success') {
          let targetPage = data.redirect || (data.data && data.data.redirect);
          if (!targetPage || targetPage === 'undefined') {
            targetPage = 'user/dashboard.html';
          }

          const userObj = (data.data && data.data.user) || {
            id: 1,
            username: username,
            fullname: username,
            role: username === 'admin' ? 'admin' : 'user'
          };
          localStorage.setItem('currentUser', JSON.stringify(userObj));

          const successModal = document.getElementById('loginSuccessModal');
          const successMsg = document.getElementById('successMessageText');
          
          const fullname = userObj.fullname || username;
          if (successMsg) {
            successMsg.textContent = `ยินดีต้อนรับ คุณ${fullname} เข้าสู่ระบบ`;
          }

          if (successModal) {
            successModal.classList.add('active');
          } else {
            showAlert('เข้าสู่ระบบสำเร็จ กำลังนำท่านไปยังระบบ...', 'success');
          }

          setTimeout(() => {
            window.location.href = targetPage;
          }, 1200);
        } else {
          setLoading(false);
          showAlert(data.message || 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง', 'danger');
        }
      } catch (err) {
        setLoading(false);
        console.error(err);
        showAlert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง', 'danger');
      }
    });
  }

  function showAlert(msg, type) {
    if (!alertBox) return;
    alertBox.style.display = 'flex';
    alertBox.className = `alert-box alert-${type}`;

    const iconSvg = type === 'success' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    alertBox.innerHTML = `${iconSvg} <span>${msg}</span>`;
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>กำลังเข้าสู่ระบบ...</span>`;
      submitBtn.style.opacity = '0.75';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>เข้าสู่ระบบ</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
    }
  }

  // Handle Preloader Dismissal
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
});

