/* js/admin.js - Admin Panel JavaScript (No Emojis) */

document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuthGuard('admin');
  if (!user) return;

  if (document.getElementById('adminFullnameNav')) {
    document.getElementById('adminFullnameNav').textContent = user.fullname || user.username;
  }

  const adminVideoTableBody = document.getElementById('adminVideoTableBody');
  const addVideoBtn = document.getElementById('addVideoBtn');
  const videoModal = document.getElementById('adminVideoModal');
  const videoForm = document.getElementById('adminVideoForm');
  const closeModalBtn = document.getElementById('closeAdminModalBtn');
  const modalTitle = document.getElementById('adminModalTitle');

  loadAdminVideos();

  async function loadAdminVideos() {
    if (!adminVideoTableBody) return;

    try {
      const res = await fetch('../api/videos.php');
      const data = await res.json();

      if (data.status === 'success') {
        const videos = data.data.videos;
        if (videos.length === 0) {
          adminVideoTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">ยังไม่มีวิดีโอในระบบ</td></tr>';
          return;
        }

        adminVideoTableBody.innerHTML = videos.map((vid, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${vid.title}</strong></td>
            <td><a href="${vid.video_url}" target="_blank" style="font-size: 0.85rem;">${vid.video_url}</a></td>
            <td>
              <span class="badge" style="background-color: ${vid.status === 'active' ? 'var(--accent-light)' : 'var(--danger-light)'}; color: ${vid.status === 'active' ? 'var(--accent-color)' : 'var(--danger-color)'};">
                ${vid.status === 'active' ? 'แสดงผล' : 'ซ่อน'}
              </span>
            </td>
            <td>${new Date(vid.created_at).toLocaleDateString('th-TH')}</td>
            <td>
              <button class="btn btn-outline edit-video-btn" data-video='${JSON.stringify(vid).replace(/'/g, "&apos;")}' style="padding: 0.25rem 0.6rem; font-size: 0.85rem;">แก้ไข</button>
              <button class="btn btn-danger delete-video-btn" data-id="${vid.id}" style="padding: 0.25rem 0.6rem; font-size: 0.85rem;">ลบ</button>
            </td>
          </tr>
        `).join('');

        document.querySelectorAll('.edit-video-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const videoData = JSON.parse(btn.getAttribute('data-video'));
            openModal('edit', videoData);
          });
        });

        document.querySelectorAll('.delete-video-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm('คุณต้องการลบวิดีโอนี้ใช่หรือไม่?')) {
              try {
                const res = await fetch('../api/videos.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'delete', id: id })
                });
                const resData = await res.json();
                if (resData.status === 'success') {
                  showToast('ลบวิดีโอเรียบร้อยแล้ว');
                  loadAdminVideos();
                } else {
                  showToast(resData.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
                }
              } catch (e) {
                showToast('ไม่สามารถเชื่อมต่อระบบได้', 'error');
              }
            }
          });
        });
      }
    } catch (err) {
      adminVideoTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger-color);">เกิดข้อผิดพลาดในการโหลดข้อมูล</td></tr>';
    }
  }

  function openModal(mode, data = null) {
    if (!videoModal) return;
    videoModal.classList.add('active');

    if (mode === 'add') {
      modalTitle.textContent = 'เพิ่มวิดีโอใหม่';
      document.getElementById('videoId').value = '';
      document.getElementById('videoAction').value = 'add';
      videoForm.reset();
    } else {
      modalTitle.textContent = 'แก้ไขวิดีโอ';
      document.getElementById('videoId').value = data.id;
      document.getElementById('videoAction').value = 'edit';
      document.getElementById('title').value = data.title;
      document.getElementById('description').value = data.description || '';
      document.getElementById('video_url').value = data.video_url;
      document.getElementById('thumbnail').value = data.thumbnail || '';
      document.getElementById('status').value = data.status;
    }
  }

  if (addVideoBtn) {
    addVideoBtn.addEventListener('click', () => openModal('add'));
  }

  if (closeModalBtn && videoModal) {
    closeModalBtn.addEventListener('click', () => videoModal.classList.remove('active'));
  }

  const cancelModalBtn = document.getElementById('cancelAdminModalBtn');
  if (cancelModalBtn && videoModal) {
    cancelModalBtn.addEventListener('click', () => videoModal.classList.remove('active'));
  }

  // Auto-detect YouTube thumbnail for admin convenience
  const videoUrlInput = document.getElementById('video_url');
  const thumbnailInput = document.getElementById('thumbnail');
  if (videoUrlInput && thumbnailInput) {
    videoUrlInput.addEventListener('blur', () => {
      const val = videoUrlInput.value.trim();
      const match = val.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/i);
      if (match && match[1] && !thumbnailInput.value.trim()) {
        thumbnailInput.value = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    });
  }

  if (videoForm) {
    videoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const action = document.getElementById('videoAction').value;
      const id = document.getElementById('videoId').value;
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const video_url = document.getElementById('video_url').value.trim();
      const thumbnail = document.getElementById('thumbnail').value.trim();
      const status = document.getElementById('status').value;

      try {
        const res = await fetch('../api/videos.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: action,
            id: id,
            title: title,
            description: description,
            video_url: video_url,
            thumbnail: thumbnail,
            status: status
          })
        });

        const resData = await res.json();
        if (resData.status === 'success') {
          showToast(resData.message || 'บันทึกข้อมูลสำเร็จ');
          videoModal.classList.remove('active');
          loadAdminVideos();
        } else {
          showToast(resData.message || 'เกิดข้อผิดพลาด', 'error');
        }
      } catch (err) {
        showToast('ไม่สามารถเชื่อมต่อระบบได้', 'error');
      }
    });
  }
});
