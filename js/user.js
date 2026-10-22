/* js/user.js - User pages dynamic interactions (No Emojis, Pure SVG Icons & Vector UI) */

function getYouTubeVideoId(url) {
  if (!url) return '';
  url = url.trim();
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/|watch\?.+&v=))([\w-]{11})/i);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  return '';
}

function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : url;
}

function getYouTubeThumbnail(url, fallbackThumb = '') {
  const videoId = getYouTubeVideoId(url);
  if (fallbackThumb && fallbackThumb.trim() !== '' && !fallbackThumb.includes('unsplash.com')) {
    return fallbackThumb;
  }
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return fallbackThumb || 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
}

// ---------------------------------------------------------------------
// 0. Dashboard Page Handler
// ---------------------------------------------------------------------
function initDashboardPage(user) {
  const dateEl = document.getElementById('dashCurrentDate');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('th-TH', options);
  }

  const hour = new Date().getHours();
  let timeGreeting = 'สวัสดีครับ';
  if (hour < 12) timeGreeting = 'สวัสดีตอนเช้าครับ';
  else if (hour < 17) timeGreeting = 'สวัสดีตอนบ่ายครับ';
  else timeGreeting = 'สวัสดีตอนเย็นครับ';

  const greetingEl = document.getElementById('dashTimeGreeting');
  const userWelcomeName = document.getElementById('userWelcomeName');
  if (userWelcomeName && user) {
    userWelcomeName.textContent = user.fullname || user.username;
  }
  if (greetingEl && user) {
    greetingEl.innerHTML = `${timeGreeting}คุณ <span id="userWelcomeName">${user.fullname || user.username}</span>`;
  }

  const quotes = [
    "ไม่ว่าวันนี้จะเจอเรื่องเหนื่อยแค่ไหน จำไว้ว่าคุณกำลังทำได้ดีที่สุดแล้ว",
    "การดูแลสุขภาพใจของตัวเองในทุกๆ วัน คือความรักตัวเองที่ดีที่สุด",
    "ให้โอกาสตัวเองพักผ่อน พรุ่งนี้คือวันใหม่ที่เต็มไปด้วยความเป็นไปได้",
    "ความรู้สึกทุกอารมณ์คือเรื่องธรรมชาติ ยอมรับและใจดีกับตัวเองให้มากที่สุด"
  ];
  const quoteEl = document.getElementById('dailyQuoteText');
  if (quoteEl) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = `"${randomQuote}"`;
  }

  const dashMoodBtns = document.querySelectorAll('.dash-mood-btn');
  const moodStatusContainer = document.getElementById('dashMoodStatusContainer');
  const moodStatusText = document.getElementById('dashMoodStatusText');

  const moodLabels = {
    '1': 'เสียใจมาก (ระดับ 1)',
    '2': 'กังวล (ระดับ 2)',
    '3': 'เฉยๆ / ปกติ (ระดับ 3)',
    '4': 'ผ่อนคลาย (ระดับ 4)',
    '5': 'มีความสุข (ระดับ 5)'
  };

  const updateMoodDisplay = (level) => {
    dashMoodBtns.forEach(b => {
      if (b.getAttribute('data-level') === String(level)) {
        b.classList.add('selected');
      } else {
        b.classList.remove('selected');
      }
    });

    if (moodStatusContainer && moodStatusText && level) {
      moodStatusContainer.style.display = 'flex';
      moodStatusText.textContent = moodLabels[level] || `ระดับ ${level}`;
    }
  };

  // Restore saved mood state if present in localStorage
  const savedMood = localStorage.getItem('todayMood');
  if (savedMood) {
    updateMoodDisplay(savedMood);
  }

  if (dashMoodBtns.length > 0) {
    dashMoodBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const mood = btn.getAttribute('data-level');
        localStorage.setItem('todayMood', mood);
        updateMoodDisplay(mood);

        try {
          const res = await fetch('../api/diary.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mood: mood,
              symptoms: [],
              note: 'เช็กอินด่วนจาก Dashboard',
              diary_date: new Date().toISOString().split('T')[0]
            })
          });
          const data = await res.json();
          if (data.status === 'success') {
            showToast(`เช็กอินอารมณ์เรียบร้อยแล้ว: ${moodLabels[mood] || mood}`, 'success');
          }
        } catch (e) {
          showToast(`บันทึกอารมณ์สำเร็จ: ${moodLabels[mood] || mood}`, 'success');
        }
      });
    });
  }

  fetch('../api/get_history.php')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success' && data.data.history.length > 0) {
        const latest = data.data.history[0];
        const statusVal = document.getElementById('dashLatestScore');
        const statusBadge = document.getElementById('dashLatestBadge');
        if (statusVal) statusVal.textContent = `${latest.total_score} / 9 คะแนน`;
        if (statusBadge) {
          statusBadge.textContent = latest.level;
          statusBadge.className = `badge ${latest.level === 'ระดับปานกลาง' ? 'badge-medium' : (latest.level.includes('สูง') || latest.level.includes('รุนแรง') ? 'badge-high' : 'badge-low')}`;
        }
      }
    }).catch(e => {});
}

// ---------------------------------------------------------------------
// 1. Assessment Page Handler
// ---------------------------------------------------------------------
function initAssessmentPage() {
  const form = document.getElementById('assessmentForm');
  if (!form) return;

  const progressBar = document.getElementById('assessmentProgressFill');
  const progressText = document.getElementById('assessmentProgressText');

  function updateProgress() {
    const allRadios = form.querySelectorAll('input[type="radio"]');
    if (allRadios.length === 0) return;

    // Get unique group names
    const groupNames = Array.from(new Set(Array.from(allRadios).map(r => r.name)));
    let answeredCount = 0;

    groupNames.forEach(name => {
      const groupRadios = Array.from(form.querySelectorAll(`input[name="${name}"]`));
      const checkedRadio = groupRadios.find(r => r.checked) || form.querySelector(`input[name="${name}"]:checked`);
      
      groupRadios.forEach(r => {
        const item = r.closest('.choice-item');
        if (item) {
          if (r === checkedRadio || r.checked) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        }
      });

      if (checkedRadio || groupRadios.some(r => r.checked)) {
        answeredCount++;
      }
    });

    const totalQuestions = groupNames.length || 1;
    const percentage = Math.round((answeredCount / totalQuestions) * 100);

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
    if (progressText) {
      progressText.textContent = `${percentage}% (${answeredCount}/${totalQuestions} ข้อ)`;
    }
  }

  // Helper to run progress calculation after browser commits input state
  const scheduleUpdate = () => {
    updateProgress();
    setTimeout(updateProgress, 0);
    requestAnimationFrame(updateProgress);
  };

  // 1. Listen for change and input on form and all radios
  form.addEventListener('change', scheduleUpdate);
  form.addEventListener('input', scheduleUpdate);

  const allInputs = form.querySelectorAll('input[type="radio"]');
  allInputs.forEach(radio => {
    radio.addEventListener('change', scheduleUpdate);
    radio.addEventListener('click', scheduleUpdate);
  });

  // 2. Delegated click handler on choice items
  form.addEventListener('click', (e) => {
    const item = e.target.closest('.choice-item');
    if (item) {
      const radio = item.querySelector('input[type="radio"]');
      if (radio) {
        radio.checked = true;
      }
      scheduleUpdate();
    }
  });

  // 3. Initial sync
  scheduleUpdate();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');
    const q3 = document.querySelector('input[name="q3"]:checked');

    if (!q1 || !q2 || !q3) {
      showToast('กรุณาตอบคำถามให้ครบถ้วนทุกข้อ', 'error');
      return;
    }

    const totalScore = parseInt(q1.value) + parseInt(q2.value) + parseInt(q3.value);

    let level = 'ระดับปกติ';
    let adviceList = [];
    if (totalScore <= 2) {
      level = 'ระดับปกติ';
      adviceList = [
        'คุณมีสภาวะสุขภาพใจที่ดีอยู่ในเกณฑ์ปกติ สามารถรับมือกับความตึงเครียดได้ดี',
        'ควรหมั่นออกกำลังกายอย่างน้อย 30 นาทีต่อวัน 3-5 วัน/สัปดาห์ เพื่อกระตุ้นสารความสุข (Endorphins)',
        'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อวัน และเข้านอนตรงเวลา',
        'ฝึกการหายใจลึกๆ (Deep Breathing) และทำกิจกรรมงานอดิเรกที่ชื่นชอบเมื่อรู้สึกเหนื่อยล้า',
        'ทำแบบประเมินและบันทึกอารมณ์สัปดาห์ละ 1-2 ครั้งเพื่อติดตามสุขภาพใจอย่างต่อเนื่อง'
      ];
    } else if (totalScore <= 5) {
      level = 'ระดับซึมเศร้าเล็กน้อย';
      adviceList = [
        'คุณเริ่มมีความรู้สึกเศร้าหรือความตึงเครียดสะสมเป็นบางครั้ง ควรเริ่มเพิ่มการดูแลตนเองอย่างใกล้ชิด',
        'ลองพูดคุยระบายความรู้สึกกับเพื่อนสนิท ครอบครัว หรือคนที่ไว้วางใจ ไม่ควรเก็บความตึงเครียดไว้คนเดียว',
        'ปรับเปลี่ยนบรรยากาศ ออกไปสัมผัสธรรมชาติ หรือทำกิจกรรมกลางแจ้งเพื่อผ่อนคลายจิตใจ',
        'รับชมวิดีโอบำบัดและฝึกสมาธิ (มีให้บริการในเมนูวิดีโอบำบัด) เพื่อลดความกระวนกระวายใจ',
        'แนะนำให้ทำแบบประเมินซ้ำอีกครั้งใน 1-2 สัปดาห์ข้างหน้าเพื่อติดตามการเปลี่ยนแปลง'
      ];
    } else if (totalScore <= 7) {
      level = 'ระดับซึมเศร้าปานกลาง';
      adviceList = [
        'สภาวะสุขภาพใจของคุณเริ่มส่งผลกระทบต่อความรู้สึกและการใช้ชีวิตประจำวัน',
        'ควรพิจารณานัดหมายปรึกษาจิตแพทย์หรือผู้เชี่ยวชาญด้านสุขภาพจิต (ดูรายชื่อในเมนูปรึกษาผู้เชี่ยวชาญ)',
        'หลีกเลี่ยงการอยู่คนเดียวนานเกินไป และพยายามทำกิจกรรมเบาๆ ร่วมกับผู้อื่น',
        'งดเว้นการใช้สารเสพติดหรือเครื่องดื่มแอลกอฮอล์เพื่อดับความรู้สึกเศร้า',
        'หากรู้สึกตึงเครียดมาก สามารถโทรขอรับคำปรึกษาฟรีที่ สายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง)'
      ];
    } else {
      level = 'ระดับซึมเศร้ารุนแรง';
      adviceList = [
        'สภาวะสุขภาพใจของคุณอยู่ในระดับที่ต้องการการดูแลและช่วยเหลือจากแพทย์ผู้เชี่ยวชาญโดยเร็ว',
        'ข้อแนะนำสำคัญ: ควรเข้ารับการตรวจประเมินกับจิตแพทย์ที่โรงพยาบาลหรือคลินิกเฉพาะทางทันที',
        'สายด่วนฉุกเฉิน: โทร สายด่วนสุขภาพจิต 1323 (โทรฟรี ตลอด 24 ชั่วโมง)',
        'แจ้งคนใกล้ชิดหรือครอบครัวให้ทราบถึงสภาวะอารมณ์ของคุณ เพื่อให้มีผู้ดูแลและช่วยเหลืออย่างใกล้ชิด',
        'จำไว้ว่าคุณไม่ได้อยู่ตัวคนเดียว และสภาวะนี้สามารถรักษาและดีขึ้นได้ด้วยการดูแลที่ถูกต้อง'
      ];
    }

    const localPayload = {
      result_id: Date.now(),
      total_score: totalScore,
      level: level,
      result_text: adviceList.join('\n'),
      advice_list: adviceList
    };

    sessionStorage.setItem('last_result', JSON.stringify(localPayload));
    localStorage.setItem('last_result', JSON.stringify(localPayload));

    try {
      const res = await fetch('../api/save_assessment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id: 1,
          total_score: totalScore
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          sessionStorage.setItem('last_result', JSON.stringify(data.data));
          localStorage.setItem('last_result', JSON.stringify(data.data));
        }
      }
    } catch (err) {
      console.warn('Backend save_assessment fallback to local payload:', err);
    }

    window.location.href = `result.html?id=${localPayload.result_id}`;
  });
}

// ---------------------------------------------------------------------
// 2. Result Page Handler
// ---------------------------------------------------------------------
function initResultPage() {
  const container = document.getElementById('resultContainer');
  if (!container) return;

  function renderResult(data) {
    if (!data) return;
    let levelClass = 'result-level-low';
    let levelBadgeBg = 'badge-low';
    let levelTitle = data.level || 'ระดับปกติ';

    if (levelTitle.includes('ปานกลาง')) {
      levelClass = 'result-level-medium';
      levelBadgeBg = 'badge-medium';
    } else if (levelTitle.includes('สูง') || levelTitle.includes('รุนแรง')) {
      levelClass = 'result-level-high';
      levelBadgeBg = 'badge-high';
    }

    let adviceItems = [];
    if (Array.isArray(data.advice_list) && data.advice_list.length > 0) {
      adviceItems = data.advice_list;
    } else if (data.result_text) {
      adviceItems = data.result_text.split('\n').filter(line => line.trim().length > 0);
    }

    if (adviceItems.length === 0) {
      const score = data.total_score || 0;
      if (score <= 2) {
        adviceItems = [
          'คุณมีสภาวะสุขภาพใจที่ดีอยู่ในเกณฑ์ปกติ สามารถรับมือกับความตึงเครียดได้ดี',
          'ควรหมั่นออกกำลังกายอย่างน้อย 30 นาทีต่อวัน 3-5 วัน/สัปดาห์ เพื่อกระตุ้นสารความสุข (Endorphins)',
          'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อวัน และเข้านอนตรงเวลา',
          'ฝึกการหายใจลึกๆ (Deep Breathing) และทำกิจกรรมงานอดิเรกที่ชื่นชอบเมื่อรู้สึกเหนื่อยล้า',
          'ทำแบบประเมินและบันทึกอารมณ์สัปดาห์ละ 1-2 ครั้งเพื่อติดตามสุขภาพใจอย่างต่อเนื่อง'
        ];
      } else if (score <= 5) {
        adviceItems = [
          'คุณเริ่มมีความรู้สึกเศร้าหรือความตึงเครียดสะสมเป็นบางครั้ง ควรเริ่มเพิ่มการดูแลตนเองอย่างใกล้ชิด',
          'ลองพูดคุยระบายความรู้สึกกับเพื่อนสนิท ครอบครัว หรือคนที่ไว้วางใจ ไม่ควรเก็บความตึงเครียดไว้คนเดียว',
          'ปรับเปลี่ยนบรรยากาศ ออกไปสัมผัสธรรมชาติ หรือทำกิจกรรมกลางแจ้งเพื่อผ่อนคลายจิตใจ',
          'รับชมวิดีโอบำบัดและฝึกสมาธิ (มีให้บริการในเมนูวิดีโอบำบัด) เพื่อลดความกระวนกระวายใจ',
          'แนะนำให้ทำแบบประเมินซ้ำอีกครั้งใน 1-2 สัปดาห์ข้างหน้าเพื่อติดตามการเปลี่ยนแปลง'
        ];
      } else if (score <= 7) {
        adviceItems = [
          'สภาวะสุขภาพใจของคุณเริ่มส่งผลกระทบต่อความรู้สึกและการใช้ชีวิตประจำวัน',
          'ควรพิจารณานัดหมายปรึกษาจิตแพทย์หรือผู้เชี่ยวชาญด้านสุขภาพจิต (ดูรายชื่อในเมนูปรึกษาผู้เชี่ยวชาญ)',
          'หลีกเลี่ยงการอยู่คนเดียวนานเกินไป และพยายามทำกิจกรรมเบาๆ ร่วมกับผู้อื่น',
          'งดเว้นการใช้สารเสพติดหรือเครื่องดื่มแอลกอฮอล์เพื่อดับความรู้สึกเศร้า',
          'หากรู้สึกตึงเครียดมาก สามารถโทรขอรับคำปรึกษาฟรีที่ สายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง)'
        ];
      } else {
        adviceItems = [
          'สภาวะสุขภาพใจของคุณอยู่ในระดับที่ต้องการการดูแลและช่วยเหลือจากแพทย์ผู้เชี่ยวชาญโดยเร็ว',
          'ข้อแนะนำสำคัญ: ควรเข้ารับการตรวจประเมินกับจิตแพทย์ที่โรงพยาบาลหรือคลินิกเฉพาะทางทันที',
          'สายด่วนฉุกเฉิน: โทร สายด่วนสุขภาพจิต 1323 (โทรฟรี ตลอด 24 ชั่วโมง)',
          'แจ้งคนใกล้ชิดหรือครอบครัวให้ทราบถึงสภาวะอารมณ์ของคุณ เพื่อให้มีผู้ดูแลและช่วยเหลืออย่างใกล้ชิด',
          'จำไว้ว่าคุณไม่ได้อยู่ตัวคนเดียว และสภาวะนี้สามารถรักษาและดีขึ้นได้ด้วยการดูแลที่ถูกต้อง'
        ];
      }
    }

    const adviceListHtml = adviceItems.map(item => `
      <li style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem; font-size: 0.96rem; line-height: 1.6; color: var(--text-primary);">
        <div style="width: 22px; height: 22px; border-radius: 50%; background: #e6f4f2; color: #0e5c54; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 0.15rem;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span>${item}</span>
      </li>
    `).join('');

    const score = data.total_score ?? 0;
    const scorePercent = Math.min(Math.max((score / 9) * 100, 4), 96);

    container.innerHTML = `
      <div class="result-card-container">
        <h2 style="font-size: 1.6rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem;">ผลการประเมินและคำแนะนำสุขภาพใจ</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.75rem;">ประเมินสภาวะทางอารมณ์และรับแนวทางการปฏิบัติตนที่เหมาะสม</p>
        
        <div class="result-score-badge">
          <span class="result-score-num">${score}</span>
          <span class="result-score-label">จากเต็ม 9 คะแนน</span>
        </div>
        
        <div class="result-level-title ${levelClass}">
          <span class="badge ${levelBadgeBg}" style="font-size: 1.05rem; padding: 0.5rem 1.35rem;">${levelTitle}</span>
        </div>
        
        <!-- Visual Assessment Score Bar Gauge -->
        <div class="result-visual-bar-box" style="margin: 2rem 0; background: #ffffff; padding: 1.75rem; border-radius: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; flex-wrap: wrap; gap: 0.5rem;">
            <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0e5c54" stroke-width="2.2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              <span>แถบวัดระดับสภาวะสุขภาพใจ (Visual Score Gauge)</span>
            </h3>
            <span style="font-size: 0.88rem; font-weight: 600; color: #0e5c54; background: #e6f4f2; padding: 0.3rem 0.85rem; border-radius: 20px;">
              คะแนนของคุณ: ${score} / 9
            </span>
          </div>

          <!-- Multi-Segment Range Track -->
          <div style="position: relative; margin: 2.2rem 0 1rem 0;">
            <!-- Floating Score Marker -->
            <div style="position: absolute; left: ${scorePercent}%; top: -38px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; z-index: 5; transition: left 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);">
              <span style="background: #0e5c54; color: #ffffff; font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 8px; white-space: nowrap; box-shadow: 0 4px 10px rgba(14, 92, 84, 0.3);">
                คุณอยู่ที่นี่ (${score})
              </span>
              <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #0e5c54;"></div>
            </div>

            <!-- Segmented Gauge Track -->
            <div style="height: 16px; width: 100%; border-radius: 999px; overflow: hidden; display: flex; box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);">
              <div style="width: 22.2%; background: #10b981;" title="0-2: ปกติ"></div>
              <div style="width: 33.3%; background: #3b82f6;" title="3-5: เล็กน้อย"></div>
              <div style="width: 22.2%; background: #f59e0b;" title="6-7: ปานกลาง"></div>
              <div style="width: 22.2%; background: #ef4444;" title="8-9: รุนแรง"></div>
            </div>
          </div>

          <!-- Range Legend Labels -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; text-align: center; margin-top: 0.85rem;">
            <div style="font-size: 0.8rem; color: #047857; font-weight: 600; background: #ecfdf5; padding: 0.4rem 0.2rem; border-radius: 8px;">0-2 ปกติ</div>
            <div style="font-size: 0.8rem; color: #1d4ed8; font-weight: 600; background: #eff6ff; padding: 0.4rem 0.2rem; border-radius: 8px;">3-5 เล็กน้อย</div>
            <div style="font-size: 0.8rem; color: #b45309; font-weight: 600; background: #fffbeb; padding: 0.4rem 0.2rem; border-radius: 8px;">6-7 ปานกลาง</div>
            <div style="font-size: 0.8rem; color: #b91c1c; font-weight: 600; background: #fef2f2; padding: 0.4rem 0.2rem; border-radius: 8px;">8-9 รุนแรง</div>
          </div>
        </div>

        <div class="recommendation-box" style="margin-top: 2rem;">
          <div class="recommendation-title" style="margin-bottom: 1.25rem;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0e5c54" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <span style="font-size: 1.1rem; color: #0e5c54; font-weight: 700;">คำแนะนำและแนวทางปฏิบัติเฉพาะคุณ:</span>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0;">
            ${adviceListHtml}
          </ul>
        </div>

        ${(data.total_score ?? 0) >= 6 ? `
          <div class="card" style="background: linear-gradient(135deg, #fef2f2, #fff1f1); border-left: 5px solid var(--danger-color); margin-top: 1.5rem; text-align: left;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--danger-color); color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <h4 style="color: var(--danger-color); font-weight: 700; font-size: 1.05rem;">ต้องการคำปรึกษาเร่งด่วน?</h4>
                <p style="color: #991b1b; font-size: 0.92rem; margin-top: 0.15rem;">โทรขอรับคำปรึกษาฟรีที่ สายด่วนสุขภาพจิต 1323 (ตลอด 24 ชั่วโมง)</p>
              </div>
            </div>
          </div>
        ` : ''}

        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
          <a href="assessment.html" class="btn btn-outline">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
            <span>ทำแบบประเมินอีกครั้ง</span>
          </a>
          <a href="diary.html" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>บันทึกอาการประจำวัน</span>
          </a>
          <a href="consultation.html" class="btn btn-primary" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span>ปรึกษาผู้เชี่ยวชาญ</span>
          </a>
        </div>
      </div>
    `;
  }

  // 1. Render stored result immediately if present
  const storedData = sessionStorage.getItem('last_result') || localStorage.getItem('last_result');
  if (storedData) {
    try {
      const data = JSON.parse(storedData);
      renderResult(data);
    } catch (e) {
      renderDefault();
    }
  } else {
    renderDefault();
  }

  function renderDefault() {
    renderResult({
      total_score: 1,
      level: 'ระดับปกติ',
      advice_list: [
        'คุณมีสภาวะสุขภาพใจที่ดีอยู่ในเกณฑ์ปกติ สามารถรับมือกับความตึงเครียดได้ดี',
        'ควรหมั่นออกกำลังกายอย่างน้อย 30 นาทีต่อวัน 3-5 วัน/สัปดาห์ เพื่อกระตุ้นสารความสุข (Endorphins)',
        'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมงต่อวัน และเข้านอนตรงเวลา',
        'ฝึกการหายใจลึกๆ (Deep Breathing) และทำกิจกรรมงานอดิเรกที่ชื่นชอบเมื่อรู้สึกเหนื่อยล้า',
        'ทำแบบประเมินและบันทึกอารมณ์สัปดาห์ละ 1-2 ครั้งเพื่อติดตามสุขภาพใจอย่างต่อเนื่อง'
      ]
    });
  }

  // 2. Fetch history asynchronously in background
  fetch('../api/get_history.php')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success' && data.data && data.data.history && data.data.history.length > 0) {
        const latest = data.data.history[0];
        renderResult({
          total_score: latest.total_score,
          level: latest.level,
          result_text: latest.result_text
        });
      }
    })
    .catch(() => {});
}

// ---------------------------------------------------------------------
// 3. Diary Page Handler
// ---------------------------------------------------------------------
function initDiaryPage() {
  const form = document.getElementById('diaryForm');
  const selectedMoodInput = document.getElementById('selectedMood');
  const historyContainer = document.getElementById('diaryHistoryList');

  const moodBtns = document.querySelectorAll('.mood-card-option, .mood-btn');

  // Pre-select saved mood or default to Level 3 if available
  const savedMood = localStorage.getItem('todayMood') || '3';
  if (selectedMoodInput && !selectedMoodInput.value) {
    selectedMoodInput.value = savedMood;
  }

  if (moodBtns.length > 0) {
    moodBtns.forEach(btn => {
      const level = btn.getAttribute('data-mood') || btn.getAttribute('data-level');
      if (level === selectedMoodInput.value) {
        btn.classList.add('selected');
      }

      btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const chosen = btn.getAttribute('data-mood') || btn.getAttribute('data-level');
        selectedMoodInput.value = chosen;
        localStorage.setItem('todayMood', chosen);
      });
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let mood = selectedMoodInput ? selectedMoodInput.value : '';
      if (!mood) {
        mood = '3'; // Default to normal
        if (selectedMoodInput) selectedMoodInput.value = mood;
      }

      const checkboxes = document.querySelectorAll('input[name="symptoms"]:checked');
      const symptoms = Array.from(checkboxes).map(cb => cb.value);
      const noteInput = document.getElementById('diaryNote');
      const note = noteInput ? noteInput.value.trim() : '';
      const todayStr = new Date().toISOString().split('T')[0];

      const newEntry = {
        id: Date.now(),
        mood: parseInt(mood, 10),
        symptoms: symptoms.join(', '),
        note: note,
        diary_date: todayStr
      };

      // 1. Save to localStorage immediately as reliable client cache
      try {
        const localList = JSON.parse(localStorage.getItem('user_diaries') || '[]');
        localList.unshift(newEntry);
        localStorage.setItem('user_diaries', JSON.stringify(localList));
      } catch (e) {}

      // 2. Post to backend API
      try {
        const res = await fetch('../api/diary.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mood: mood,
            symptoms: symptoms,
            note: note,
            diary_date: todayStr
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.status === 'success' && data.data && data.data.entry) {
            newEntry.id = data.data.entry.id;
          }
        }
      } catch (err) {
        console.warn('Backend diary sync fallback to local cache:', err);
      }

      showToast('บันทึกอาการและอารมณ์วันนี้เรียบร้อยแล้ว', 'success');

      if (noteInput) noteInput.value = '';
      checkboxes.forEach(cb => cb.checked = false);

      loadDiaryHistory();
    });
  }

  async function loadDiaryHistory() {
    if (!historyContainer) return;

    const moodLabels = {
      1: 'เสียใจมาก',
      2: 'กังวล / ไม่สบายใจ',
      3: 'ปกติ / เฉยๆ',
      4: 'ผ่อนคลาย',
      5: 'มีความสุขมาก'
    };

    function renderList(diaries) {
      if (!diaries || diaries.length === 0) {
        historyContainer.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-secondary);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" style="margin-bottom: 0.75rem;"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <p style="font-size: 0.95rem; font-weight: 500;">ยังไม่มีบันทึกประวัติประจำวัน</p>
            <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.25rem;">เริ่มบันทึกอารมณ์ของคุณวันนี้ได้เลย</p>
          </div>
        `;
        return;
      }

      historyContainer.innerHTML = diaries.map(d => `
        <div class="diary-item-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 14px; padding: 1.15rem; margin-bottom: 0.85rem; box-shadow: 0 2px 6px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <strong style="color: var(--text-primary); font-size: 0.95rem;">วันที่ ${d.diary_date}</strong>
            <span class="badge" style="background-color: var(--primary-light); color: var(--primary-color); font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 8px;">
              ${moodLabels[d.mood] || 'อารมณ์ระดับ ' + d.mood}
            </span>
          </div>
          ${d.symptoms ? `<p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.4rem;"><strong>อาการที่พบ:</strong> ${escapeHtml(d.symptoms)}</p>` : ''}
          ${d.note ? `<p style="font-size: 0.92rem; color: var(--text-primary); margin-top: 0.25rem;"><strong>บันทึก:</strong> ${escapeHtml(d.note)}</p>` : ''}
        </div>
      `).join('');
    }

    // First render cached local entries if available
    try {
      const cached = JSON.parse(localStorage.getItem('user_diaries') || '[]');
      if (cached.length > 0) {
        renderList(cached);
      }
    } catch (e) {}

    // Fetch from backend to sync
    try {
      const res = await fetch('../api/diary.php');
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.data.diaries)) {
          if (data.data.diaries.length > 0) {
            renderList(data.data.diaries);
            localStorage.setItem('user_diaries', JSON.stringify(data.data.diaries));
          }
        }
      }
    } catch (e) {}
  }

  if (historyContainer) loadDiaryHistory();
}

// ---------------------------------------------------------------------
// 4. History Page Handler
// ---------------------------------------------------------------------
function initHistoryPage() {
  const tableBody = document.getElementById('historyTableBody');
  const clearBtn = document.getElementById('btnClearHistory');

  if (tableBody) {
    loadHistory();
  }

  async function loadHistory() {
    try {
      const res = await fetch('../api/get_history.php');
      const data = await res.json();

      if (data.status === 'success') {
        const history = data.data.history;

        const statCount = document.getElementById('statCount');
        const statLatestScore = document.getElementById('statLatestScore');
        const statLatestLevel = document.getElementById('statLatestLevel');
        
        if (statCount) statCount.textContent = history.length;
        if (history.length > 0) {
          if (statLatestScore) statLatestScore.textContent = `${history[0].total_score} / 9`;
          if (statLatestLevel) statLatestLevel.textContent = history[0].level;
        } else {
          if (statLatestScore) statLatestScore.textContent = '-';
          if (statLatestLevel) statLatestLevel.textContent = '-';
        }

        // Render Chart.js Score Trend Line Chart
        const canvas = document.getElementById('scoreTrendChart');
        if (canvas && typeof Chart !== 'undefined' && history.length > 0) {
          const reversedHistory = [...history].reverse();
          const labels = reversedHistory.map(item => new Date(item.created_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }));
          const scores = reversedHistory.map(item => item.total_score);

          if (window.myTrendChart) {
            window.myTrendChart.destroy();
          }

          const ctx = canvas.getContext('2d');
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          gradient.addColorStop(0, 'rgba(13, 148, 136, 0.35)');
          gradient.addColorStop(1, 'rgba(13, 148, 136, 0.0)');

          window.myTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
              labels: labels,
              datasets: [{
                label: 'คะแนนการประเมิน (0 - 9)',
                data: scores,
                borderColor: '#0d9488',
                borderWidth: 3,
                backgroundColor: gradient,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#0d9488',
                pointRadius: 6,
                pointHoverRadius: 9
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  min: 0,
                  max: 9,
                  ticks: { stepSize: 1 }
                }
              }
            }
          });
        }

        if (history.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">ไม่พบประวัติการประเมิน</td></tr>';
          return;
        }

        tableBody.innerHTML = history.map((item, idx) => {
          let badgeClass = 'badge-low';
          if (item.level === 'ระดับปานกลาง') badgeClass = 'badge-medium';
          if (item.level === 'ระดับสูง' || item.level === 'ระดับรุนแรง') badgeClass = 'badge-high';

          return `
            <tr>
              <td>${idx + 1}</td>
              <td><strong>${item.assessment_title || 'แบบประเมินสุขภาพจิต'}</strong></td>
              <td><strong style="color: var(--primary-color); font-size: 1.05rem;">${item.total_score}</strong> / 9</td>
              <td><span class="badge ${badgeClass}">${item.level}</span></td>
              <td style="color: var(--text-secondary); font-size: 0.88rem;">${new Date(item.created_at).toLocaleString('th-TH')}</td>
            </tr>
          `;
        }).join('');
      }
    } catch (err) {
      tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger-color); padding: 1.5rem;">เกิดข้อผิดพลาดในการดึงข้อมูล</td></tr>';
    }
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการประเมินทั้งหมด?')) {
        try {
          const res = await fetch('../api/clear_history.php', { method: 'POST' });
          const data = await res.json();
          if (data.status === 'success') {
            showToast('ลบประวัติการประเมินเรียบร้อยแล้ว');
            loadHistory();
          }
        } catch (e) {
          showToast('ไม่สามารถลบประวัติได้', 'error');
        }
      }
    });
  }
}

// ---------------------------------------------------------------------
// 5. Doctors / Consultation Page Handler
// ---------------------------------------------------------------------
function initConsultationPage() {
  const doctorGrid = document.getElementById('doctorGrid');
  if (!doctorGrid) return;

  fetch('../api/doctors.php')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const doctors = data.data.doctors;
        if (doctors.length === 0) {
          doctorGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">ยังไม่มีรายชื่อแพทย์ในระบบ</p>';
          return;
        }

        doctorGrid.innerHTML = doctors.map(doc => `
          <div class="doctor-card">
            <div>
              <div class="doctor-info-header">
                <div class="doctor-avatar">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div>
                  <h3 style="font-size: 1.1rem; color: var(--text-primary);">${doc.name}</h3>
                  <span class="badge" style="background-color: var(--secondary-light); color: var(--secondary-color);">${doc.specialty || 'จิตแพทย์'}</span>
                </div>
              </div>
              <div class="doctor-details">
                <p><strong>โทรศัพท์:</strong> ${doc.phone || '-'}</p>
                <p><strong>อีเมล:</strong> ${doc.email || '-'}</p>
                <p><strong>LINE ID:</strong> ${doc.line_id || '-'}</p>
                <p><strong>วันทำการ:</strong> ${doc.working_days || 'จันทร์ - ศุกร์'}</p>
                <p><strong>เวลาทำการ:</strong> ${doc.working_time || '09:00 - 16:00'}</p>
              </div>
            </div>
            <div>
              ${doc.phone ? `<a href="tel:${doc.phone}" class="btn btn-outline btn-block">โทรติดต่อแพทย์</a>` : ''}
            </div>
          </div>
        `).join('');
      }
    })
    .catch(err => {
      doctorGrid.innerHTML = '<p style="color: var(--danger-color); padding: 2rem; text-align: center;">ไม่สามารถโหลดข้อมูลผู้เชี่ยวชาญได้</p>';
    });
}

// ---------------------------------------------------------------------
// 6. Videos Page Handler
// ---------------------------------------------------------------------
function initVideosPage() {
  const videoGrid = document.getElementById('videoGrid');
  const searchInput = document.getElementById('videoSearch');
  const modal = document.getElementById('videoModal');
  const modalIframe = document.getElementById('modalIframe');
  const modalTitle = document.getElementById('modalTitle');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (!videoGrid) return;

  loadVideos('');

  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loadVideos(e.target.value.trim());
      }, 300);
    });
  }

  async function loadVideos(search = '') {
    try {
      const res = await fetch(`../api/videos.php?search=${encodeURIComponent(search)}`);
      const data = await res.json();

      if (data.status === 'success') {
        const videos = data.data.videos;
        if (videos.length === 0) {
          videoGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">ไม่พบวิดีโอบำบัด</p>';
          return;
        }

        videoGrid.innerHTML = videos.map(vid => {
          const embedUrl = getYouTubeEmbedUrl(vid.video_url);
          const thumbUrl = getYouTubeThumbnail(vid.video_url, vid.thumbnail);

          return `
            <div class="video-card">
              <div class="video-thumb" data-url="${embedUrl}" data-title="${vid.title}" data-id="${vid.id}">
                <img src="${thumbUrl}" alt="${vid.title}">
                <div class="play-badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
              </div>
              <div class="video-body">
                <div>
                  ${vid.is_watched == 1 ? '<span class="watched-tag">รับชมแล้ว</span>' : ''}
                  <h4 class="video-title">${vid.title}</h4>
                  <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 1rem;">${vid.description || ''}</p>
                </div>
                <button class="btn btn-primary btn-block play-btn" data-url="${embedUrl}" data-title="${vid.title}" data-id="${vid.id}">รับชมวิดีโอ</button>
              </div>
            </div>
          `;
        }).join('');

        document.querySelectorAll('.video-thumb, .play-btn').forEach(el => {
          el.addEventListener('click', () => {
            const url = el.getAttribute('data-url');
            const title = el.getAttribute('data-title');
            const id = el.getAttribute('data-id');
            openVideoModal(url, title, id);
          });
        });
      }
    } catch (e) {
      videoGrid.innerHTML = '<p style="color: var(--danger-color); padding: 2rem; text-align: center;">เกิดข้อผิดพลาดในการโหลดวิดีโอ</p>';
    }
  }

  function openVideoModal(url, title, id) {
    if (!modal || !modalIframe) return;
    modalTitle.textContent = title;
    modalIframe.src = url;
    modal.classList.add('active');

    fetch('../api/videos.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'watch', video_id: id })
    }).then(() => loadVideos(searchInput ? searchInput.value : ''));
  }

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      modalIframe.src = '';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        modalIframe.src = '';
      }
    });
  }
}

// ---------------------------------------------------------------------
// 7. Profile Page Handler
// ---------------------------------------------------------------------
function initProfilePage() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  fetch('../api/profile.php')
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success' && data.data.user) {
        const u = data.data.user;
        document.getElementById('username').value = u.username || '';
        document.getElementById('fullname').value = u.fullname || '';
        document.getElementById('email').value = u.email || '';
        document.getElementById('phone').value = u.phone || '';
      }
    });

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch('../api/profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, phone, password })
      });

      const data = await res.json();
      if (data.status === 'success') {
        showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
        document.getElementById('password').value = '';
      } else {
        showToast(data.message || 'เกิดข้อผิดพลาดในการบันทึก', 'error');
      }
    } catch (err) {
      showToast('ไม่สามารถบันทึกข้อมูลได้', 'error');
    }
  });
}
