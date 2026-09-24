"use strict";

/* =========================================================
   DOM HELPERS
   ========================================================= */
function $(selector, scope) {
  return (scope || document).querySelector(selector);
}
function $all(selector, scope) {
  return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
}
function on(el, event, handler) {
  if (el) el.addEventListener(event, handler);
}
function show(el) { if (el) el.classList.remove("hidden"); }
function hide(el) { if (el) el.classList.add("hidden"); }
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
   LOCAL STORAGE KEYS — ALL DATA KEYED PER-USER (BY EMAIL)
   ========================================================= */
const LS_ACCOUNTS = "smartCampusAccounts";        // { "email@x.com": {name,email,studentId,password} }
const LS_PROFILES = "smartCampusProfiles";        // { "email@x.com": {name,email,studentId,branch,year,cgpa} }
const LS_ASSIGNMENTS = "smartCampusAssignmentsByUser"; // { "email@x.com": { a1:true, a2:false, ... } }
const LS_CURRENT_USER = "smartCampusCurrentUser"; // "email@x.com" or null

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("localStorage read failed for", key, e);
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("localStorage write failed for", key, e);
    return false;
  }
}

/* ---- Accounts (email -> account) ---- */
function getAllAccounts() { return lsGet(LS_ACCOUNTS, {}); }
function saveAllAccounts(map) { lsSet(LS_ACCOUNTS, map); }
function getAccountByEmail(email) {
  const all = getAllAccounts();
  return all[email] || null;
}

/* ---- Profiles (email -> profile) ---- */
function getAllProfiles() { return lsGet(LS_PROFILES, {}); }
function saveAllProfiles(map) { lsSet(LS_PROFILES, map); }
function getProfileByEmail(email) {
  const all = getAllProfiles();
  return all[email] || null;
}
function saveProfileForEmail(email, profile) {
  const all = getAllProfiles();
  all[email] = profile;
  saveAllProfiles(all);
}

/* ---- Assignments (email -> {id:true}) ---- */
function getAllAssignmentsMap() { return lsGet(LS_ASSIGNMENTS, {}); }
function getAssignmentsForEmail(email) {
  const all = getAllAssignmentsMap();
  return all[email] || {};
}
function saveAssignmentsForEmail(email, submittedMap) {
  const all = getAllAssignmentsMap();
  all[email] = submittedMap;
  lsSet(LS_ASSIGNMENTS, all);
}

/* ---- Current logged-in user ---- */
function getCurrentUserEmail() { return lsGet(LS_CURRENT_USER, null); }
function setCurrentUserEmail(email) { lsSet(LS_CURRENT_USER, email); }
function clearCurrentUserEmail() { lsSet(LS_CURRENT_USER, null); }

/* =========================================================
   STATIC DATA (shared across all users — college-wide info)
   ========================================================= */
const ATTENDANCE_DATA = [
  { subject: "Data Structures", code: "CS301", present: 52, total: 60 },
  { subject: "Database Management", code: "CS302", present: 48, total: 55 },
  { subject: "Operating Systems", code: "CS303", present: 35, total: 50 },
  { subject: "Computer Networks", code: "CS304", present: 40, total: 45 },
  { subject: "Software Engineering", code: "CS305", present: 36, total: 40 }
];

const TIMETABLE_SECTIONS = {
  "Section A": { room: "LAB14", mentor: "NH Kavitha" },
  "Section B": { room: "LAB15", mentor: "Dr Srinivas" },
  "Section C": { room: "LH-12", mentor: "Mr Somesh" },
  "Section D": { room: "LH-11", mentor: "Mrs Sirlekha" },
  "Section E": { room: "LAB-13 / LH-13", mentor: "Mr L Sankar" }
};

const SUBJECT_POOL = ["DS", "DBMS", "OS", "CN", "SE", "ML", "AI Lab", "Mentoring"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function buildTimetableGrid(sectionName) {
  let seed = 0;
  for (let i = 0; i < sectionName.length; i++) seed += sectionName.charCodeAt(i);
  const grid = [];
  DAYS.forEach(function (day, dIdx) {
    const row = [day];
    for (let period = 0; period < 6; period++) {
      const idx = (seed + dIdx * 3 + period * 2) % SUBJECT_POOL.length;
      row.push(SUBJECT_POOL[idx]);
    }
    grid.push(row);
  });
  return grid;
}

const ASSIGNMENTS_SEED = [
  { id: "a1", subject: "Data Structures", title: "Balanced Binary Tree Implementation", due: "2026-10-02", desc: "Implement AVL tree insertion, deletion and rotation logic in a language of your choice." },
  { id: "a2", subject: "Database Management", title: "Normalization Case Study", due: "2026-10-05", desc: "Normalize the given college database schema up to 3NF with justification." },
  { id: "a3", subject: "Operating Systems", title: "CPU Scheduling Simulator", due: "2026-10-08", desc: "Simulate FCFS, SJF and Round Robin scheduling and compare average waiting time." },
  { id: "a4", subject: "Computer Networks", title: "Subnetting Worksheet", due: "2026-09-30", desc: "Solve the given subnetting problems for a /24 network with 5 departments." },
  { id: "a5", subject: "Software Engineering", title: "SRS Document", due: "2026-10-10", desc: "Prepare a complete Software Requirements Specification for Smart Campus 360." },
  { id: "a6", subject: "Machine Learning", title: "Linear Regression Mini Project", due: "2026-10-12", desc: "Build and evaluate a linear regression model on a chosen dataset with metrics." }
];

const NOTICES_SEED = [
  { title: "1-1 Supplementary Examinations Schedule Released", date: "2026-09-20", category: "Examinations", desc: "1-1 supplementary examination timetable has been released. Students must check hall tickets on the portal." },
  { title: "1-2 Supplementary Examinations Notification", date: "2026-09-18", category: "Examinations", desc: "Applications for 1-2 supplementary examinations are now open. Last date to apply is given in the circular." },
  { title: "2-1 Supplementary Examinations Fee Due Date", date: "2026-09-15", category: "Examinations", desc: "Students with backlogs in 2-1 must pay the supplementary exam fee before the due date to avoid late fine." },
  { title: "2-2 Supplementary Examinations Results", date: "2026-09-10", category: "Examinations", desc: "2-2 supplementary examination results have been published. Revaluation requests open for one week." },
  { title: "Smart India Hackathon 2026 — Internal Screening", date: "2026-09-22", category: "Hackathon", desc: "Internal screening round for Smart India Hackathon 2026 will be conducted in the CSE seminar hall." },
  { title: "AWS Cloud Club Weekly Session", date: "2026-09-21", category: "Clubs", desc: "AWS Cloud Club is conducting a hands-on session on EC2 and S3 fundamentals for all interested students." },
  { title: "Campus Placement Drive — TCS", date: "2026-09-19", category: "Placements", desc: "TCS is conducting an on-campus placement drive for pre-final and final year students. Register on the portal." },
  { title: "Technical Club Recruitment Open", date: "2026-09-17", category: "Clubs", desc: "Coding Club and IEEE Student Chapter are recruiting new members for the academic year." },
  { title: "Placement Drive — Infosys", date: "2026-09-14", category: "Placements", desc: "Infosys placement drive eligibility list has been published. Eligible students must confirm participation." },
  { title: "College Annual Tech Fest — Registrations Open", date: "2026-09-12", category: "Announcements", desc: "Registrations are now open for the annual technical fest with coding, robotics and paper presentation events." }
];

const BUS_ROUTES_SEED = [
  { no: "R1", name: "MVP Colony Route", start: "MVP Colony", stops: "Siripuram, Dwaraka Nagar, NAD Junction", timing: "7:15 AM / 4:30 PM", status: "Active" },
  { no: "R2", name: "Gajuwaka Route", start: "Gajuwaka", stops: "Kancharapalem, Aganampudi, Duvvada", timing: "7:00 AM / 4:30 PM", status: "Active" },
  { no: "R3", name: "Simhachalam Route", start: "Simhachalam", stops: "Pendurthi, Anandapuram", timing: "7:20 AM / 4:30 PM", status: "Active" },
  { no: "R4", name: "Madhurawada Route", start: "Madhurawada", stops: "Rushikonda, Sagar Nagar", timing: "7:10 AM / 4:30 PM", status: "Active" },
  { no: "R5", name: "Vizianagaram Route", start: "Vizianagaram Bus Stand", stops: "Gajapathinagaram, Kothavalasa", timing: "6:30 AM / 4:30 PM", status: "Active" },
  { no: "R6", name: "Bheemili Route", start: "Bheemunipatnam", stops: "Sontyam, Anandapuram", timing: "7:05 AM / 4:30 PM", status: "Delayed Today" }
];

const SCHOLARSHIPS_SEED = [
  { name: "Merit Scholarship", eligibility: "CGPA 8.5 and above, no backlogs", info: "Awarded to top academic performers each semester based on SGPA/CGPA ranking.", status: "Applications Open" },
  { name: "Government Scholarship (AP)", eligibility: "Family income below prescribed limit", info: "State government scholarship for eligible SC/ST/BC/EWS category students.", status: "Applications Open" },
  { name: "Post-Matric Scholarship", eligibility: "Students pursuing studies after 10th standard from eligible categories", info: "Central/state assistance covering tuition and maintenance charges.", status: "Applications Closed" },
  { name: "EAPCET Rank Scholarship", eligibility: "EAPCET rank holders under fee reimbursement scheme", info: "Fee reimbursement opportunity linked to EAPCET counseling allotment.", status: "Applications Open" },
  { name: "Raghu Engineering College Merit Award", eligibility: "Top 3 rank holders per branch per year", info: "Institution-specific cash award and certificate for outstanding academic performance.", status: "Applications Open" }
];

const PLACEMENT_DRIVES_SEED = [
  { company: "TCS", role: "Assistant System Engineer", eligibility: "CGPA 6.5+, No active backlogs", status: "Open" },
  { company: "Infosys", role: "Systems Engineer", eligibility: "CGPA 7.0+, No active backlogs", status: "Open" },
  { company: "Wipro", role: "Project Engineer", eligibility: "CGPA 6.0+, No active backlogs", status: "Closed" },
  { company: "Cognizant", role: "Programmer Analyst", eligibility: "CGPA 6.5+, No active backlogs", status: "Upcoming" },
  { company: "Amazon", role: "SDE Intern", eligibility: "CGPA 8.0+, Strong DSA skills", status: "Upcoming" }
];

/* =========================================================
   AUTHENTICATION
   ========================================================= */
function handleSignup(e) {
  e.preventDefault();
  const nameEl = $("#signupName");
  const emailEl = $("#signupEmail");
  const idEl = $("#signupStudentId");
  const branchEl = $("#signupBranch");
  const yearEl = $("#signupYear");
  const cgpaEl = $("#signupCgpa");
  const passEl = $("#signupPassword");
  const confirmEl = $("#signupConfirmPassword");
  const errorEl = $("#signupError");
  if (!nameEl || !emailEl || !idEl || !passEl || !confirmEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim().toLowerCase();
  const studentId = idEl.value.trim();
  const branch = (branchEl && branchEl.value.trim()) || "CSE (AI & ML)";
  const year = (yearEl && yearEl.value.trim()) || "3rd Year";
  const cgpa = (cgpaEl && cgpaEl.value.trim()) || "--";
  const password = passEl.value;
  const confirm = confirmEl.value;

  if (errorEl) errorEl.textContent = "";

  if (!name || !email || !studentId || !password || !confirm) {
    if (errorEl) errorEl.textContent = "Please fill in all required fields.";
    return;
  }
  if (password.length < 4) {
    if (errorEl) errorEl.textContent = "Password must be at least 4 characters.";
    return;
  }
  if (password !== confirm) {
    if (errorEl) errorEl.textContent = "Passwords do not match.";
    return;
  }

  const accounts = getAllAccounts();
  if (accounts[email]) {
    if (errorEl) errorEl.textContent = "An account with this email already exists. Please login instead.";
    return;
  }

  // Save the new account under its OWN email key — never overwrites anyone else's account
  accounts[email] = { name: name, email: email, studentId: studentId, password: password };
  saveAllAccounts(accounts);

  // Save a profile scoped ONLY to this email
  const profile = {
    name: name,
    email: email,
    studentId: studentId,
    branch: branch,
    year: year,
    cgpa: cgpa
  };
  saveProfileForEmail(email, profile);

  openModal("success", "Account Created", "Your account has been created successfully. You can now log in with your own email and password.", function () {
    closeModal();
    showLoginForm();
    const loginEmail = $("#loginEmail");
    if (loginEmail) loginEmail.value = email;
    const form = $("#signupForm");
    if (form) form.reset();
  });
}

function handleLogin(e) {
  e.preventDefault();
  const emailEl = $("#loginEmail");
  const passEl = $("#loginPassword");
  const errorEl = $("#loginError");
  if (!emailEl || !passEl) return;

  const email = emailEl.value.trim().toLowerCase();
  const password = passEl.value;
  if (errorEl) errorEl.textContent = "";

  const account = getAccountByEmail(email);
  if (!account) {
    if (errorEl) errorEl.textContent = "No account found with this email. Please create an account first.";
    return;
  }
  if (account.password !== password) {
    if (errorEl) errorEl.textContent = "Invalid email or password.";
    return;
  }

  // This is the key fix: we remember WHICH email is logged in
  setCurrentUserEmail(email);
  enterApp();
}

function handleLogout() {
  clearCurrentUserEmail();
  const appRoot = $("#appRoot");
  const authScreen = $("#authScreen");
  hide(appRoot);
  show(authScreen);
  showLoginForm();
  closeNavDrawer();

  const loginForm = $("#loginForm");
  if (loginForm) loginForm.reset();
}

function showLoginForm() {
  show($("#loginForm"));
  hide($("#signupForm"));
}
function showSignupForm() {
  hide($("#loginForm"));
  show($("#signupForm"));
}

/* =========================================================
   NAVIGATION
   ========================================================= */
const SECTION_TITLES = {
  "dashboard": "Dashboard",
  "attendance": "Attendance",
  "timetable": "Timetable",
  "assignments": "Assignments",
  "notices": "Notices",
  "campus-map": "Campus Map",
  "bus-routes": "Bus Routes",
  "scholarships": "Scholarships",
  "placement": "Placement Hub",
  "settings": "Settings"
};

function goToSection(sectionId) {
  const target = $("#" + sectionId);
  if (!target) return;

  $all(".page-section").forEach(function (sec) { hide(sec); });
  show(target);

  $all(".nav-link").forEach(function (link) {
    if (link.getAttribute("data-section") === sectionId) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  const pageTitle = $("#pageTitle");
  if (pageTitle) pageTitle.textContent = SECTION_TITLES[sectionId] || "Dashboard";

  closeNavDrawer();

  try {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    window.scrollTo(0, 0);
  }
}

function initNavigation() {
  $all(".nav-link").forEach(function (link) {
    on(link, "click", function () {
      const sectionId = link.getAttribute("data-section");
      if (sectionId) goToSection(sectionId);
    });
  });

  $all("[data-goto]").forEach(function (el) {
    on(el, "click", function () {
      const sectionId = el.getAttribute("data-goto");
      if (sectionId) goToSection(sectionId);
    });
  });
}

/* =========================================================
   MOBILE MENU
   ========================================================= */
function openNavDrawer() {
  const nav = $("#sideNav");
  const backdrop = $("#navBackdrop");
  const btn = $("#hamburgerBtn");
  if (nav) nav.classList.add("open");
  if (backdrop) show(backdrop);
  if (btn) {
    btn.classList.add("active");
    btn.setAttribute("aria-expanded", "true");
  }
}
function closeNavDrawer() {
  const nav = $("#sideNav");
  const backdrop = $("#navBackdrop");
  const btn = $("#hamburgerBtn");
  if (nav) nav.classList.remove("open");
  if (backdrop) hide(backdrop);
  if (btn) {
    btn.classList.remove("active");
    btn.setAttribute("aria-expanded", "false");
  }
}
function initMobileMenu() {
  const hamburger = $("#hamburgerBtn");
  const backdrop = $("#navBackdrop");
  const nav = $("#sideNav");

  on(hamburger, "click", function () {
    if (nav && nav.classList.contains("open")) {
      closeNavDrawer();
    } else {
      openNavDrawer();
    }
  });
  on(backdrop, "click", closeNavDrawer);

  const mobileAvatar = $("#mobileAvatarBtn");
  on(mobileAvatar, "click", function () {
    goToSection("settings");
  });
}

/* =========================================================
   DASHBOARD — always renders the CURRENT logged-in user's data
   ========================================================= */
function computeOverallAttendance() {
  let totalPresent = 0;
  let totalClasses = 0;
  ATTENDANCE_DATA.forEach(function (row) {
    totalPresent += row.present;
    totalClasses += row.total;
  });
  if (totalClasses === 0) return 0;
  return Math.round((totalPresent / totalClasses) * 1000) / 10;
}

function renderDashboard(profile) {
  const attendanceEl = $("#dashAttendance");
  if (attendanceEl) attendanceEl.textContent = computeOverallAttendance() + "%";

  const email = getCurrentUserEmail();
  const submitted = email ? getAssignmentsForEmail(email) : {};
  let pendingCount = 0;
  ASSIGNMENTS_SEED.forEach(function (a) {
    if (submitted[a.id] !== true) pendingCount++;
  });
  const assignmentsEl = $("#dashAssignments");
  if (assignmentsEl) assignmentsEl.textContent = String(pendingCount);

  const noticesEl = $("#dashNotices");
  if (noticesEl) noticesEl.textContent = String(NOTICES_SEED.length);

  const welcomeMsg = $("#welcomeMsg");
  if (welcomeMsg) {
    const firstName = ((profile && profile.name) || "Student").split(" ")[0];
    welcomeMsg.textContent = "Welcome back, " + firstName + "!";
  }

  const dashCgpaEl = $("#dashCgpa");
  if (dashCgpaEl) dashCgpaEl.textContent = (profile && profile.cgpa) || "--";
}

/* =========================================================
   ATTENDANCE
   ========================================================= */
function attendanceStatus(pct) {
  if (pct >= 75) return { label: "Good", cls: "status-good" };
  if (pct >= 65) return { label: "Warning", cls: "status-warn" };
  return { label: "Shortage", cls: "status-bad" };
}

function renderAttendance() {
  const tbody = $("#attendanceTbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  ATTENDANCE_DATA.forEach(function (row) {
    const pct = row.total > 0 ? Math.round((row.present / row.total) * 1000) / 10 : 0;
    const status = attendanceStatus(pct);
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + escapeHtml(row.subject) + "</td>" +
      "<td>" + escapeHtml(row.code) + "</td>" +
      "<td>" + row.present + "</td>" +
      "<td>" + row.total + "</td>" +
      "<td>" + pct + "%</td>" +
      "<td><span class='status-pill " + status.cls + "'>" + status.label + "</span></td>";
    tbody.appendChild(tr);
  });
}

/* =========================================================
   TIMETABLE
   ========================================================= */
let currentTimetableSection = "Section A";

function renderTimetableTabs() {
  const wrap = $("#timetableTabs");
  if (!wrap) return;
  wrap.innerHTML = "";
  Object.keys(TIMETABLE_SECTIONS).forEach(function (sectionName) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = sectionName;
    if (sectionName === currentTimetableSection) btn.classList.add("active");
    on(btn, "click", function () {
      currentTimetableSection = sectionName;
      renderTimetableTabs();
      renderTimetableTable();
    });
    wrap.appendChild(btn);
  });
}

function renderTimetableTable() {
  const tbody = $("#timetableTbody");
  const meta = $("#timetableMeta");
  if (!tbody) return;
  tbody.innerHTML = "";

  const grid = buildTimetableGrid(currentTimetableSection);
  grid.forEach(function (row) {
    const tr = document.createElement("tr");
    tr.innerHTML = row.map(function (cell) { return "<td>" + escapeHtml(cell) + "</td>"; }).join("");
    tbody.appendChild(tr);
  });

  const info = TIMETABLE_SECTIONS[currentTimetableSection];
  if (meta && info) {
    meta.innerHTML = "<strong>" + escapeHtml(currentTimetableSection) + "</strong> &nbsp;|&nbsp; Room: " +
      escapeHtml(info.room) + " &nbsp;|&nbsp; Mentor: " + escapeHtml(info.mentor);
  }
}

function renderTimetable() {
  renderTimetableTabs();
  renderTimetableTable();
}

/* =========================================================
   ASSIGNMENTS — submitted state stored per logged-in user
   ========================================================= */
function renderAssignments() {
  const grid = $("#assignmentsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  const email = getCurrentUserEmail();
  const submittedMap = email ? getAssignmentsForEmail(email) : {};

  ASSIGNMENTS_SEED.forEach(function (a) {
    const isSubmitted = submittedMap[a.id] === true;
    const card = document.createElement("div");
    card.className = "assignment-card";
    card.innerHTML =
      "<span class='assignment-subject'>" + escapeHtml(a.subject) + "</span>" +
      "<h4>" + escapeHtml(a.title) + "</h4>" +
      "<p class='assignment-desc'>" + escapeHtml(a.desc) + "</p>" +
      "<p class='assignment-due'><i class='fa-regular fa-calendar'></i> Due: " + escapeHtml(a.due) + "</p>" +
      "<div class='assignment-footer'>" +
        "<span class='status-pill " + (isSubmitted ? "status-submitted" : "status-pending") + "'>" +
          (isSubmitted ? "Submitted" : "Pending") +
        "</span>" +
        "<button class='btn btn-primary' data-assignment-id='" + a.id + "' " + (isSubmitted ? "disabled" : "") + ">" +
          (isSubmitted ? "<i class=\"fa-solid fa-check\"></i> Done" : "<i class=\"fa-solid fa-paper-plane\"></i> Submit") +
        "</button>" +
      "</div>";
    grid.appendChild(card);
  });

  $all("[data-assignment-id]", grid).forEach(function (btn) {
    on(btn, "click", function () {
      const id = btn.getAttribute("data-assignment-id");
      submitAssignment(id);
    });
  });
}

function submitAssignment(id) {
  const email = getCurrentUserEmail();
  if (!email) return;
  const submittedMap = getAssignmentsForEmail(email);
  submittedMap[id] = true;
  saveAssignmentsForEmail(email, submittedMap);
  renderAssignments();
  const profile = getProfileByEmail(email);
  renderDashboard(profile);
  openModal("success", "Assignment Submitted", "Your assignment has been marked as submitted successfully.", closeModal);
}

/* =========================================================
   NOTICES
   ========================================================= */
function renderNotices() {
  const list = $("#noticesList");
  if (!list) return;
  list.innerHTML = "";

  NOTICES_SEED.forEach(function (n) {
    const card = document.createElement("div");
    card.className = "notice-card";
    card.innerHTML =
      "<span class='notice-cat'>" + escapeHtml(n.category) + "</span>" +
      "<div class='notice-top'>" +
        "<h4>" + escapeHtml(n.title) + "</h4>" +
        "<span class='notice-date'>" + escapeHtml(n.date) + "</span>" +
      "</div>" +
      "<p class='notice-desc'>" + escapeHtml(n.desc) + "</p>";
    list.appendChild(card);
  });
}

/* =========================================================
   BUS ROUTES
   ========================================================= */
function renderBusRoutes() {
  const grid = $("#busRoutesGrid");
  if (!grid) return;
  grid.innerHTML = "";

  BUS_ROUTES_SEED.forEach(function (r) {
    const card = document.createElement("div");
    card.className = "bus-card";
    card.innerHTML =
      "<h4><span class='route-no'>" + escapeHtml(r.no) + "</span> " + escapeHtml(r.name) + "</h4>" +
      "<p><strong>Start:</strong> " + escapeHtml(r.start) + "</p>" +
      "<p><strong>Major Stops:</strong> " + escapeHtml(r.stops) + "</p>" +
      "<p><strong>Timing:</strong> " + escapeHtml(r.timing) + "</p>" +
      "<p><strong>Status:</strong> " + escapeHtml(r.status) + "</p>";
    grid.appendChild(card);
  });
}

/* =========================================================
   SCHOLARSHIPS
   ========================================================= */
function renderScholarships() {
  const grid = $("#scholarshipsGrid");
  if (!grid) return;
  grid.innerHTML = "";

  SCHOLARSHIPS_SEED.forEach(function (s, idx) {
    const card = document.createElement("div");
    card.className = "scholarship-card";
    card.innerHTML =
      "<h4>" + escapeHtml(s.name) + "</h4>" +
      "<p><strong>Eligibility:</strong> " + escapeHtml(s.eligibility) + "</p>" +
      "<p>" + escapeHtml(s.info) + "</p>" +
      "<div class='scholarship-footer'>" +
        "<span class='status-pill " + (s.status.indexOf("Open") !== -1 ? "status-open" : "status-closed") + "'>" + escapeHtml(s.status) + "</span>" +
        "<button class='btn btn-outline' data-scholarship-idx='" + idx + "'>Learn More</button>" +
      "</div>";
    grid.appendChild(card);
  });

  $all("[data-scholarship-idx]", grid).forEach(function (btn) {
    on(btn, "click", function () {
      const idx = parseInt(btn.getAttribute("data-scholarship-idx"), 10);
      const s = SCHOLARSHIPS_SEED[idx];
      if (!s) return;
      openModal("info", s.name, s.eligibility + ". " + s.info + " This is a demo informational card — please contact the college scholarship office for the actual application process.", closeModal);
    });
  });
}

/* =========================================================
   PLACEMENT HUB
   ========================================================= */
function renderPlacement() {
  const tbody = $("#placementDrivesTbody");
  if (tbody) {
    tbody.innerHTML = "";
    PLACEMENT_DRIVES_SEED.forEach(function (d) {
      const cls = d.status === "Open" ? "status-open" : (d.status === "Upcoming" ? "status-warn" : "status-closed");
      const tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + escapeHtml(d.company) + "</td>" +
        "<td>" + escapeHtml(d.role) + "</td>" +
        "<td>" + escapeHtml(d.eligibility) + "</td>" +
        "<td><span class='status-pill " + cls + "'>" + escapeHtml(d.status) + "</span></td>";
      tbody.appendChild(tr);
    });
  }

  $all("[data-download]").forEach(function (btn) {
    on(btn, "click", function () {
      const label = btn.getAttribute("data-download");
      openModal("info", "Demo Download", "This is a demo build without real files attached. In the full version, '" + label + "' would download here.", closeModal);
    });
  });
}

/* =========================================================
   SETTINGS — edits ONLY the current user's own profile
   ========================================================= */
function renderSettings(profile) {
  setInputValue("#setName", profile.name);
  setInputValue("#setEmail", profile.email);
  setInputValue("#setStudentId", profile.studentId);
  setInputValue("#setBranch", profile.branch);
  setInputValue("#setYear", profile.year);
  setInputValue("#setCgpa", profile.cgpa);
}

function setInputValue(selector, value) {
  const el = $(selector);
  if (el) el.value = value || "";
}
function getInputValue(selector) {
  const el = $(selector);
  return el ? el.value.trim() : "";
}

function handleSettingsSave(e) {
  e.preventDefault();
  const email = getCurrentUserEmail();
  if (!email) return;

  const existing = getProfileByEmail(email) || {};
  const profile = {
    name: getInputValue("#setName") || existing.name,
    email: email, // email is fixed to the logged-in account, never editable here
    studentId: getInputValue("#setStudentId") || existing.studentId,
    branch: getInputValue("#setBranch") || existing.branch,
    year: getInputValue("#setYear") || existing.year,
    cgpa: getInputValue("#setCgpa") || existing.cgpa
  };
  saveProfileForEmail(email, profile);
  applyProfileEverywhere(profile);

  const successEl = $("#settingsSuccess");
  if (successEl) {
    successEl.textContent = "Profile saved successfully.";
    setTimeout(function () { successEl.textContent = ""; }, 2500);
  }
}

function handleResetProfile() {
  const email = getCurrentUserEmail();
  if (!email) return;
  const account = getAccountByEmail(email);
  if (!account) return;

  const freshProfile = {
    name: account.name,
    email: account.email,
    studentId: account.studentId,
    branch: "CSE (AI & ML)",
    year: "3rd Year",
    cgpa: "--"
  };
  saveProfileForEmail(email, freshProfile);
  renderSettings(freshProfile);
  applyProfileEverywhere(freshProfile);

  const successEl = $("#settingsSuccess");
  if (successEl) {
    successEl.textContent = "Profile reset to default.";
    setTimeout(function () { successEl.textContent = ""; }, 2500);
  }
}

/* Applies one user's profile to every part of the UI that shows profile info */
function applyProfileEverywhere(profile) {
  const nameEl = $("#topProfileName");
  const metaEl = $("#topProfileMeta");
  if (nameEl) nameEl.textContent = profile.name || "Student";
  if (metaEl) metaEl.textContent = (profile.branch || "") + " · " + (profile.year || "");

  const infoName = $("#infoName");
  const infoBranch = $("#infoBranch");
  const infoYear = $("#infoYear");
  const infoCgpa = $("#infoCgpa");
  if (infoName) infoName.textContent = profile.name || "Student";
  if (infoBranch) infoBranch.textContent = profile.branch || "--";
  if (infoYear) infoYear.textContent = profile.year || "--";
  if (infoCgpa) infoCgpa.textContent = profile.cgpa || "--";

  renderDashboard(profile);
}

/* =========================================================
   MODALS
   ========================================================= */
let modalConfirmCallback = null;

function openModal(type, title, body, onOk) {
  const overlay = $("#genericModal");
  const titleEl = $("#modalTitle");
  const bodyEl = $("#modalBody");
  const iconEl = $("#modalIcon");
  if (!overlay) return;

  if (titleEl) titleEl.textContent = title || "";
  if (bodyEl) bodyEl.textContent = body || "";

  if (iconEl) {
    let iconClass = "fa-solid fa-circle-info";
    if (type === "success") iconClass = "fa-solid fa-circle-check";
    if (type === "error") iconClass = "fa-solid fa-circle-exclamation";
    iconEl.innerHTML = "<i class='" + iconClass + "'></i>";
  }

  modalConfirmCallback = typeof onOk === "function" ? onOk : closeModal;
  show(overlay);
}

function closeModal() {
  const overlay = $("#genericModal");
  hide(overlay);
  modalConfirmCallback = null;
}

function initModals() {
  const overlay = $("#genericModal");
  const closeBtn = $("#modalCloseBtn");
  const okBtn = $("#modalOkBtn");

  on(closeBtn, "click", closeModal);
  on(okBtn, "click", function () {
    if (typeof modalConfirmCallback === "function") {
      modalConfirmCallback();
    } else {
      closeModal();
    }
  });
  on(overlay, "click", function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
}

/* =========================================================
   APP ENTRY — loads and displays ONLY the logged-in user's data
   ========================================================= */
function enterApp() {
  const email = getCurrentUserEmail();
  if (!email) {
    // Safety net: no valid session, bounce back to login instead of a blank/wrong screen
    handleLogout();
    return;
  }

  const account = getAccountByEmail(email);
  if (!account) {
    handleLogout();
    return;
  }

  let profile = getProfileByEmail(email);
  if (!profile) {
    profile = {
      name: account.name,
      email: account.email,
      studentId: account.studentId,
      branch: "CSE (AI & ML)",
      year: "3rd Year",
      cgpa: "--"
    };
    saveProfileForEmail(email, profile);
  }

  hide($("#authScreen"));
  show($("#appRoot"));

  applyProfileEverywhere(profile);
  renderAttendance();
  renderTimetable();
  renderAssignments();
  renderNotices();
  renderBusRoutes();
  renderScholarships();
  renderPlacement();
  renderSettings(profile);

  goToSection("dashboard");
}

function initAuthListeners() {
  on($("#loginForm"), "submit", handleLogin);
  on($("#signupForm"), "submit", handleSignup);
  on($("#showSignupBtn"), "click", showSignupForm);
  on($("#showLoginBtn"), "click", showLoginForm);
}

function initAppListeners() {
  on($("#logoutBtn"), "click", handleLogout);
  on($("#settingsLogoutBtn"), "click", handleLogout);
  on($("#settingsForm"), "submit", handleSettingsSave);
  on($("#resetProfileBtn"), "click", handleResetProfile);
}

function initApp() {
  try {
    initAuthListeners();
    initNavigation();
    initMobileMenu();
    initModals();
    initAppListeners();

    const currentEmail = getCurrentUserEmail();
    if (currentEmail && getAccountByEmail(currentEmail)) {
      enterApp();
    } else {
      clearCurrentUserEmail();
      show($("#authScreen"));
      hide($("#appRoot"));
      showLoginForm();
    }
  } catch (err) {
    console.error("Smart Campus 360 initialization error:", err);
    const authScreen = $("#authScreen");
    if (authScreen) show(authScreen);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initApp();
});