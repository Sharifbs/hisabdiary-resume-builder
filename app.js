// State Management
let adminPassword = localStorage.getItem('adminPassword') || 'admin123';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

let usersDB = JSON.parse(localStorage.getItem('usersDB')) || [
  { name: 'Admin', email: 'admin@hisabdiary.com', pass: adminPassword, role: 'admin' }
];

let jobsDB = JSON.parse(localStorage.getItem('jobsDB')) || [
  {
    id: 1,
    title: 'Senior Accounts Executive',
    company: 'HisabDiary Solutions',
    location: 'Dhaka, Bangladesh',
    salary: 'BDT 45,000 - 60,000',
    details: 'Responsible for audit management, tax filing, financial ledger analysis, and client consulting.'
  },
  {
    id: 2,
    title: 'Frontend Developer (JavaScript / PWA)',
    company: 'TechCorp Solutions',
    location: 'Remote / Dhaka',
    salary: 'BDT 50,000 - 80,000',
    details: 'Seeking a skilled developer proficient in JS, HTML5, CSS3, and Progressive Web Applications.'
  }
];

let authMode = 'login'; 
let photoBase64 = '';
let activeJob = null;

// DOM Initialization
window.addEventListener('DOMContentLoaded', () => {
  updateUserUI();
  addExperienceField();
  addEducationField();
  loadSavedResume();
  loadJobs();
  registerPWA();
});

// Mobile Navbar Toggle
function toggleMobileMenu() {
  const nav = document.getElementById('nav-links');
  nav.classList.toggle('active');
}

// Single Page Routing
function showSection(secId) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
  document.getElementById(secId).classList.add('active');
  
  // Auto-close mobile menu after click
  const nav = document.getElementById('nav-links');
  if (nav) nav.classList.remove('active');

  if (secId === 'admin') loadAdminDashboard();
  if (secId === 'jobs') loadJobs();
}

function selectTemplateFromHero(modelId) {
  document.getElementById('templateSelect').value = modelId;
  changeTemplate(modelId);
  showSection('resume');
}

// Jobs Functionality
function loadJobs() {
  const container = document.getElementById('jobs-list');
  if (!container) return;
  container.innerHTML = '';

  jobsDB.forEach(job => {
    container.innerHTML += `
      <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <h3 style="font-size: 1.15rem; color: #0f172a; margin-bottom: 4px;">${job.title}</h3>
          <p style="color: #2563eb; font-weight: 600; font-size: 0.9rem; margin-bottom: 12px;"><i class="fa-solid fa-building"></i> ${job.company}</p>
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.85rem; color: #475569; margin-bottom: 15px;">
            <span><i class="fa-solid fa-location-dot"></i> ${job.location}</span>
            <span><i class="fa-solid fa-money-bill-wave"></i> ${job.salary}</span>
          </div>
        </div>
        <button style="width: 100%; padding: 8px; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 6px; font-weight: 600; cursor: pointer;" onclick="openJobDetails(${job.id})">View Circular & Apply</button>
      </div>
    `;
  });
}

function openJobDetails(jobId) {
  activeJob = jobsDB.find(j => j.id === jobId);
  if (!activeJob) return;

  document.getElementById('job-modal-title').innerText = activeJob.title;
  document.getElementById('job-modal-sub').innerText = activeJob.company;
  document.getElementById('job-modal-loc').innerText = activeJob.location;
  document.getElementById('job-modal-sal').innerText = activeJob.salary;
  document.getElementById('job-modal-desc').innerText = activeJob.details;

  toggleJobModal();
}

function toggleJobModal() {
  const modal = document.getElementById('job-modal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function applyJobWithBuilder() {
  toggleJobModal();
  alert(`Applied Successfully!\nYour application for "${activeJob ? activeJob.title : 'Job'}" has been submitted.`);
  showSection('resume');
}

function adminAddJob() {
  const title = document.getElementById('jobTitle').value.trim();
  const company = document.getElementById('jobCompany').value.trim();
  const location = document.getElementById('jobLocation').value.trim();
  const salary = document.getElementById('jobSalary').value.trim();
  const details = document.getElementById('jobDetails').value.trim();

  if (!title || !company) return alert('Please enter Title and Company Name!');

  const newJob = {
    id: Date.now(),
    title, company, location: location || 'N/A', salary: salary || 'Negotiable', details: details || 'No additional details provided.'
  };

  jobsDB.push(newJob);
  localStorage.setItem('jobsDB', JSON.stringify(jobsDB));
  alert('Job Circular Published Successfully!');

  document.getElementById('jobTitle').value = '';
  document.getElementById('jobCompany').value = '';
  document.getElementById('jobLocation').value = '';
  document.getElementById('jobSalary').value = '';
  document.getElementById('jobDetails').value = '';

  loadAdminDashboard();
}

function adminDeleteJob(jobId) {
  if (confirm('Delete this job circular?')) {
    jobsDB = jobsDB.filter(j => j.id !== jobId);
    localStorage.setItem('jobsDB', JSON.stringify(jobsDB));
    loadAdminDashboard();
  }
}

// Field Updater Helper
function updateField(elemId, val, defaultText) {
  const target = document.getElementById(elemId);
  if (target) {
    target.innerText = val.trim().length > 0 ? val : defaultText;
  }
}

// Photo Handling
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      photoBase64 = evt.target.result;
      const img = document.getElementById('pv-photo');
      img.src = photoBase64;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

function removePhoto() {
  photoBase64 = '';
  document.getElementById('photoInput').value = '';
  const img = document.getElementById('pv-photo');
  img.src = '';
  img.style.display = 'none';
}

// Theme & Design Switchers
function changeTemplate(tpl) {
  const paper = document.getElementById('cv-preview');
  paper.className = `cv-paper ${tpl}`;
}

function changeThemeColor(color) {
  document.documentElement.style.setProperty('--primary-color', color);
}

// Skills Tag Rendering
function updateSkills(val) {
  const container = document.getElementById('pv-skills-list');
  container.innerHTML = '';
  if (!val.trim()) {
    container.innerHTML = '<span class="skill-tag">HTML</span><span class="skill-tag">CSS</span>';
    return;
  }
  const skills = val.split(',');
  skills.forEach(s => {
    if (s.trim()) {
      container.innerHTML += `<span class="skill-tag">${s.trim()}</span>`;
    }
  });
}

// Dynamic Experience Entries
function addExperienceField() {
  const container = document.getElementById('experience-inputs-container');
  const id = Date.now();
  const card = document.createElement('div');
  card.className = 'dynamic-card';
  card.id = `exp-card-${id}`;
  card.innerHTML = `
    <button onclick="removeDynamicCard('exp-card-${id}', renderExperience)" class="btn-small-danger remove-card">&times;</button>
    <input type="text" placeholder="Company Name" class="exp-company" oninput="renderExperience()">
    <input type="text" placeholder="Designation / Role" class="exp-role" oninput="renderExperience()">
    <input type="text" placeholder="Duration (e.g. 2022 - Present)" class="exp-date" oninput="renderExperience()">
    <textarea placeholder="Key Responsibilities..." class="exp-desc" oninput="renderExperience()"></textarea>
  `;
  container.appendChild(card);
}

function renderExperience() {
  const pv = document.getElementById('pv-exp-list');
  pv.innerHTML = '';
  const cards = document.querySelectorAll('#experience-inputs-container .dynamic-card');
  cards.forEach(c => {
    const comp = c.querySelector('.exp-company').value;
    const role = c.querySelector('.exp-role').value;
    const date = c.querySelector('.exp-date').value;
    const desc = c.querySelector('.exp-desc').value;
    if (comp || role) {
      pv.innerHTML += `
        <div class="entry-item">
          <div class="entry-head"><span>${role || 'Role'} - ${comp || 'Company'}</span><span>${date}</span></div>
          <p>${desc}</p>
        </div>
      `;
    }
  });
}

// Dynamic Education Entries
function addEducationField() {
  const container = document.getElementById('education-inputs-container');
  const id = Date.now();
  const card = document.createElement('div');
  card.className = 'dynamic-card';
  card.id = `edu-card-${id}`;
  card.innerHTML = `
    <button onclick="removeDynamicCard('edu-card-${id}', renderEducation)" class="btn-small-danger remove-card">&times;</button>
    <input type="text" placeholder="Degree / Qualification" class="edu-degree" oninput="renderEducation()">
    <input type="text" placeholder="Institution Name" class="edu-inst" oninput="renderEducation()">
    <input type="text" placeholder="Passing Year / GPA" class="edu-year" oninput="renderEducation()">
  `;
  container.appendChild(card);
}

function renderEducation() {
  const pv = document.getElementById('pv-edu-list');
  pv.innerHTML = '';
  const cards = document.querySelectorAll('#education-inputs-container .dynamic-card');
  cards.forEach(c => {
    const deg = c.querySelector('.edu-degree').value;
    const inst = c.querySelector('.edu-inst').value;
    const yr = c.querySelector('.edu-year').value;
    if (deg || inst) {
      pv.innerHTML += `
        <div class="entry-item">
          <div class="entry-head"><span>${deg || 'Degree'}</span><span>${yr}</span></div>
          <div class="entry-sub">${inst}</div>
        </div>
      `;
    }
  });
}

// Dynamic Project Entries
function addProjectField() {
  const container = document.getElementById('project-inputs-container');
  const id = Date.now();
  const card = document.createElement('div');
  card.className = 'dynamic-card';
  card.id = `proj-card-${id}`;
  card.innerHTML = `
    <button onclick="removeDynamicCard('proj-card-${id}', renderProjects)" class="btn-small-danger remove-card">&times;</button>
    <input type="text" placeholder="Project Title" class="proj-title" oninput="renderProjects()">
    <textarea placeholder="Project description and results..." class="proj-desc" oninput="renderProjects()"></textarea>
  `;
  container.appendChild(card);
}

function renderProjects() {
  const pv = document.getElementById('pv-proj-list');
  pv.innerHTML = '';
  const cards = document.querySelectorAll('#project-inputs-container .dynamic-card');
  cards.forEach(c => {
    const title = c.querySelector('.proj-title').value;
    const desc = c.querySelector('.proj-desc').value;
    if (title) {
      pv.innerHTML += `
        <div class="entry-item">
          <div class="entry-head"><span>${title}</span></div>
          <p>${desc}</p>
        </div>
      `;
    }
  });
}

function removeDynamicCard(cardId, callback) {
  const el = document.getElementById(cardId);
  if (el) el.remove();
  if (callback) callback();
}

// Form Reset
function clearForm() {
  if (confirm('Are you sure you want to clear all form fields?')) {
    document.querySelectorAll('.form-section input, .form-section textarea').forEach(i => i.value = '');
    document.getElementById('experience-inputs-container').innerHTML = '';
    document.getElementById('education-inputs-container').innerHTML = '';
    document.getElementById('project-inputs-container').innerHTML = '';
    removePhoto();
    addExperienceField();
    addEducationField();
  }
}

// PDF Download
function downloadPDF() {
  const element = document.getElementById('cv-preview');
  const opt = {
    margin: 0.15,
    filename: `${currentUser ? currentUser.name : 'HisabDiary'}_Resume.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(element).save();
}

// Data Storage Logic
function saveResumeData() {
  if (!currentUser) {
    alert('Please Login/Signup to save your CV online!');
    toggleAuthModal();
    return;
  }
  
  const data = {
    name: document.getElementById('nameInput').value,
    title: document.getElementById('titleInput').value,
    email: document.getElementById('emailInput').value,
    phone: document.getElementById('phoneInput').value,
    summary: document.getElementById('summaryInput').value,
    skills: document.getElementById('skillsInput').value,
    photo: photoBase64
  };

  localStorage.setItem(`resume_${currentUser.email}`, JSON.stringify(data));
  alert('Resume data saved successfully!');
}

function loadSavedResume() {
  if (!currentUser) return;
  const saved = localStorage.getItem(`resume_${currentUser.email}`);
  if (saved) {
    const data = JSON.parse(saved);
    document.getElementById('nameInput').value = data.name || '';
    document.getElementById('titleInput').value = data.title || '';
    document.getElementById('emailInput').value = data.email || '';
    document.getElementById('phoneInput').value = data.phone || '';
    document.getElementById('summaryInput').value = data.summary || '';
    document.getElementById('skillsInput').value = data.skills || '';
    
    if (data.photo) {
      photoBase64 = data.photo;
      const img = document.getElementById('pv-photo');
      img.src = photoBase64;
      img.style.display = 'block';
    }
  }
}

// Auth Handlers & Modal Switcher
function toggleAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function switchAuthMode(mode) {
  if (mode) {
    authMode = mode;
  } else {
    authMode = authMode === 'signup' ? 'login' : 'signup';
  }

  const nameGroup = document.getElementById('name-group');
  const forgotWrapper = document.getElementById('forgot-pass-wrapper');
  const passInput = document.getElementById('auth-password');
  const submitBtn = document.getElementById('auth-submit-btn').querySelector('span');
  const title = document.getElementById('modal-title');
  const subtitle = document.getElementById('modal-subtitle');
  const toggleMsg = document.getElementById('toggle-msg');
  const toggleLink = document.getElementById('toggle-link');

  if (authMode === 'signup') {
    title.innerText = 'Create Account';
    subtitle.innerText = 'Sign up to start building & saving your resumes';
    nameGroup.style.display = 'block';
    forgotWrapper.style.display = 'none';
    passInput.placeholder = 'Password';
    submitBtn.innerText = 'Sign Up';
    toggleMsg.innerText = 'Already have an account?';
    toggleLink.innerText = 'Login';
  } else if (authMode === 'forgot') {
    title.innerText = 'Reset Password';
    subtitle.innerText = 'Enter your email and new password to update';
    nameGroup.style.display = 'none';
    forgotWrapper.style.display = 'none';
    passInput.placeholder = 'New Password';
    submitBtn.innerText = 'Reset Password';
    toggleMsg.innerText = 'Remembered your password?';
    toggleLink.innerText = 'Login';
  } else {
    authMode = 'login';
    title.innerText = 'Welcome Back';
    subtitle.innerText = 'Sign in to save and edit your resumes anytime';
    nameGroup.style.display = 'none';
    forgotWrapper.style.display = 'block';
    passInput.placeholder = 'Password';
    submitBtn.innerText = 'Login';
    toggleMsg.innerText = "Don't have an account?";
    toggleLink.innerText = 'Create Account';
  }
}

function handleAuth(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-password').value.trim();
  const name = document.getElementById('auth-name').value.trim();

  if (authMode === 'forgot') {
    if (email === 'admin@hisabdiary.com') {
      adminPassword = pass;
      localStorage.setItem('adminPassword', adminPassword);
      const adminObj = usersDB.find(u => u.role === 'admin');
      if (adminObj) adminObj.pass = adminPassword;
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
      alert('Admin password reset successfully!');
    } else {
      const user = usersDB.find(u => u.email === email);
      if (!user) return alert('No account found with this email!');
      user.pass = pass;
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
      alert('Password reset successfully! You can now login.');
    }
    switchAuthMode('login');
    return;
  }

  if (email === 'admin@hisabdiary.com' && pass === adminPassword) {
    currentUser = { name: 'Admin', email: 'admin@hisabdiary.com', role: 'admin' };
  } else if (authMode === 'signup') {
    const exists = usersDB.find(u => u.email === email);
    if (exists) return alert('An account with this email already exists!');
    
    const newUser = { name: name || 'User', email, pass, role: 'user' };
    usersDB.push(newUser);
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    currentUser = newUser;
  } else {
    const user = usersDB.find(u => u.email === email && u.pass === pass);
    if (!user) return alert('Invalid Email or Password');
    currentUser = user;
  }

  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  updateUserUI();
  toggleAuthModal();
}

function updateUserUI() {
  const uDisp = document.getElementById('user-display');
  const aBtn = document.getElementById('auth-btn');
  const admNav = document.getElementById('admin-nav-item');

  if (currentUser) {
    uDisp.innerText = `Hi, ${currentUser.name}`;
    aBtn.innerText = 'Logout';
    aBtn.onclick = () => { localStorage.removeItem('currentUser'); location.reload(); };
    if (currentUser.role === 'admin') admNav.style.display = 'block';
  }
}

// Admin Panel Actions
function changeAdminPassword() {
  const newPass = document.getElementById('newAdminPass').value.trim();
  if (newPass.length < 4) return alert('Password must be at least 4 characters long!');
  
  adminPassword = newPass;
  localStorage.setItem('adminPassword', adminPassword);
  
  const adminObj = usersDB.find(u => u.role === 'admin');
  if (adminObj) adminObj.pass = adminPassword;
  localStorage.setItem('usersDB', JSON.stringify(usersDB));

  alert('Admin password updated successfully!');
  document.getElementById('newAdminPass').value = '';
}

function adminAddNewUser() {
  const name = document.getElementById('adminAddName').value.trim();
  const email = document.getElementById('adminAddEmail').value.trim();
  const pass = document.getElementById('adminAddPass').value.trim();

  if (!email || !pass) return alert('Please enter Email and Password!');
  
  const exists = usersDB.find(u => u.email === email);
  if (exists) return alert('User already exists!');

  usersDB.push({ name: name || 'User', email, pass, role: 'user' });
  localStorage.setItem('usersDB', JSON.stringify(usersDB));
  
  alert('New user added successfully!');
  document.getElementById('adminAddName').value = '';
  document.getElementById('adminAddEmail').value = '';
  document.getElementById('adminAddPass').value = '';
  
  loadAdminDashboard();
}

function adminDeleteUser(email) {
  if (email === 'admin@hisabdiary.com') return alert('Admin account cannot be deleted!');
  if (confirm(`Are you sure you want to delete user: ${email}?`)) {
    usersDB = usersDB.filter(u => u.email !== email);
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    localStorage.removeItem(`resume_${email}`);
    loadAdminDashboard();
  }
}

function adminResetUserPass(email) {
  const newPass = prompt(`Enter new password for ${email}:`);
  if (newPass && newPass.trim().length > 0) {
    const user = usersDB.find(u => u.email === email);
    if (user) {
      user.pass = newPass.trim();
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
      alert(`Password for ${email} updated successfully!`);
    }
  }
}

function loadAdminDashboard() {
  document.getElementById('stat-users').innerText = usersDB.length;
  document.getElementById('stat-jobs').innerText = jobsDB.length;

  // Render Jobs Table
  const jBody = document.getElementById('admin-jobs-table');
  if (jBody) {
    jBody.innerHTML = '';
    jobsDB.forEach(j => {
      jBody.innerHTML += `
        <tr>
          <td>${j.title}</td>
          <td>${j.company}</td>
          <td>${j.location}</td>
          <td><span class="btn-action-del" onclick="adminDeleteJob(${j.id})">Delete</span></td>
        </tr>
      `;
    });
  }

  // Render Users Table
  const tbody = document.getElementById('admin-user-table');
  tbody.innerHTML = '';
  usersDB.forEach(u => {
    const isMainAdmin = u.email === 'admin@hisabdiary.com';
    tbody.innerHTML += `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          <a href="mailto:${u.email}">Email</a>
          ${!isMainAdmin ? `
            | <span class="btn-action-reset" onclick="adminResetUserPass('${u.email}')">Reset Pass</span>
            | <span class="btn-action-del" onclick="adminDeleteUser('${u.email}')">Delete</span>
          ` : ''}
        </td>
      </tr>
    `;
  });
}

// PWA Logic
let deferredPrompt;
function registerPWA() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW reg error:', err));
  }

  const installBtn = document.getElementById('install-btn');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'inline-block';
  });

  installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          installBtn.style.display = 'none';
        }
        deferredPrompt = null;
      });
    }
  });
}