"use strict";

/* ---------- Helpers ---------- */

function $(selector, scope = document) {
  return scope.querySelector(selector);
}

function $all(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ---------- Local storage (per user, keyed by email) ---------- */

const LS_ACCOUNTS = "smartCampusAccounts";
const LS_PROFILES = "smartCampusProfiles";
const LS_ASSIGNMENTS = "smartCampusAssignmentsByUser";
const LS_CURRENT_USER = "smartCampusCurrentUser";

function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read", key, err);
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Could not save", key, err);
  }
}

function getAccount(email) {
  if (!email) return null;
  return loadData(LS_ACCOUNTS, {})[email] || null;
}

function getProfile(email) {
  if (!email) return null;
  return loadData(LS_PROFILES, {})[email] || null;
}

function saveProfile(email, profile) {
  const profiles = loadData(LS_PROFILES, {});
  profiles[email] = profile;
  saveData(LS_PROFILES, profiles);
}

function getSubmittedAssignments(email) {
  if (!email) return {};
  return loadData(LS_ASSIGNMENTS, {})[email] || {};
}

function saveSubmittedAssignments(email, submitted) {
  const all = loadData(LS_ASSIGNMENTS, {});
  all[email] = submitted;
  saveData(LS_ASSIGNMENTS, all);
}

function getCurrentUser() {
  return loadData(LS_CURRENT_USER, null);
}

function setCurrentUser(email) {
  saveData(LS_CURRENT_USER, email);
}

function clearCurrentUser() {
  localStorage.removeItem(LS_CURRENT_USER);
}

/* ---------- Static college data ---------- */

const DEFAULT_PROFILE = { branch: "CSE (AI & ML)", year: "3rd Year", cgpa: "--" };
const PLACEMENT_READINESS = 63; // percent, shown on dashboard and Placement Hub

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

const ASSIGNMENTS = [
  { id: "a1", subject: "Data Structures", title: "Balanced Binary Tree Implementation", due: "2026-10-02", desc: "Implement AVL tree insertion, deletion and rotation logic in a language of your choice." },
  { id: "a2", subject: "Database Management", title: "Normalization Case Study", due: "2026-10-05", desc: "Normalize the given college database schema up to 3NF with justification." },
  { id: "a3", subject: "Operating Systems", title: "CPU Scheduling Simulator", due: "2026-10-08", desc: "Simulate FCFS, SJF and Round Robin scheduling and compare average waiting time." },
  { id: "a4", subject: "Computer Networks", title: "Subnetting Worksheet", due: "2026-09-30", desc: "Solve the given subnetting problems for a /24 network with 5 departments." },
  { id: "a5", subject: "Software Engineering", title: "SRS Document", due: "2026-10-10", desc: "Prepare a complete Software Requirements Specification for Smart Campus 360." },
  { id: "a6", subject: "Machine Learning", title: "Linear Regression Mini Project", due: "2026-10-12", desc: "Build and evaluate a linear regression model on a chosen dataset with metrics." }
];

const NOTICES = [
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

const BUS_ROUTES = [
  { no: "R1", name: "MVP Colony Route", start: "MVP Colony", stops: "Siripuram, Dwaraka Nagar, NAD Junction", timing: "7:15 AM / 4:30 PM", status: "Active" },
  { no: "R2", name: "Gajuwaka Route", start: "Gajuwaka", stops: "Kancharapalem, Aganampudi, Duvvada", timing: "7:00 AM / 4:30 PM", status: "Active" },
  { no: "R3", name: "Simhachalam Route", start: "Simhachalam", stops: "Pendurthi, Anandapuram", timing: "7:20 AM / 4:30 PM", status: "Active" },
  { no: "R4", name: "Madhurawada Route", start: "Madhurawada", stops: "Rushikonda, Sagar Nagar", timing: "7:10 AM / 4:30 PM", status: "Active" },
  { no: "R5", name: "Vizianagaram Route", start: "Vizianagaram Bus Stand", stops: "Gajapathinagaram, Kothavalasa", timing: "6:30 AM / 4:30 PM", status: "Active" },
  { no: "R6", name: "Bheemili Route", start: "Bheemunipatnam", stops: "Sontyam, Anandapuram", timing: "7:05 AM / 4:30 PM", status: "Delayed Today" }
];

const SCHOLARSHIPS = [
  { name: "Merit Scholarship", eligibility: "CGPA 8.5 and above, no backlogs", info: "Awarded to top academic performers each semester based on SGPA/CGPA ranking.", status: "Applications Open" },
  { name: "Government Scholarship (AP)", eligibility: "Family income below prescribed limit", info: "State government scholarship for eligible SC/ST/BC/EWS category students.", status: "Applications Open" },
  { name: "Post-Matric Scholarship", eligibility: "Students pursuing studies after 10th standard from eligible categories", info: "Central/state assistance covering tuition and maintenance charges.", status: "Applications Closed" },
  { name: "EAPCET Rank Scholarship", eligibility: "EAPCET rank holders under fee reimbursement scheme", info: "Fee reimbursement opportunity linked to EAPCET counseling allotment.", status: "Applications Open" },
  { name: "Raghu Engineering College Merit Award", eligibility: "Top 3 rank holders per branch per year", info: "Institution-specific cash award and certificate for outstanding academic performance.", status: "Applications Open" }
];

const PLACEMENT_DRIVES = [
  { company: "TCS", role: "Assistant System Engineer", eligibility: "CGPA 6.5+, No active backlogs", status: "Open" },
  { company: "Infosys", role: "Systems Engineer", eligibility: "CGPA 7.0+, No active backlogs", status: "Open" },
  { company: "Wipro", role: "Project Engineer", eligibility: "CGPA 6.0+, No active backlogs", status: "Closed" },
  { company: "Cognizant", role: "Programmer Analyst", eligibility: "CGPA 6.5+, No active backlogs", status: "Upcoming" },
  { company: "Amazon", role: "SDE Intern", eligibility: "CGPA 8.0+, Strong DSA skills", status: "Upcoming" }
];

/* ---------- Auth ---------- */

function showLoginForm() {
  show($("#loginForm"));
  hide($("#signupForm"));
}

function showSignupForm() {
  hide($("#loginForm"));
  show($("#signupForm"));
}

function handleSignup(e) {
  e.preventDefault();

  const name = $("#signupName").value.trim();
  const email = $("#signupEmail").value.trim().toLowerCase();
  const studentId = $("#signupStudentId").value.trim();
  const branch = $("#signupBranch").value.trim() || DEFAULT_PROFILE.branch;
  const year = $("#signupYear").value.trim() || DEFAULT_PROFILE.year;
  const cgpa = $("#signupCgpa").value.trim() || DEFAULT_PROFILE.cgpa;
  const password = $("#signupPassword").value;
  const confirmPassword = $("#signupConfirmPassword").value;
  const errorEl = $("#signupError");

  errorEl.textContent = "";

  if (!name || !email || !studentId || !password || !confirmPassword) {
    errorEl.textContent = "Please fill in all required fields.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errorEl.textContent = "Please enter a valid email address.";
    return;
  }
  if (password.length < 4) {
    errorEl.textContent = "Password must be at least 4 characters.";
    return;
  }
  if (password !== confirmPassword) {
    errorEl.textContent = "Passwords do not match.";
    return;
  }

  const accounts = loadData(LS_ACCOUNTS, {});
  if (accounts[email]) {
    errorEl.textContent = "An account with this email already exists. Please login instead.";
    return;
  }

  accounts[email] = { name, email, studentId, password };
  saveData(LS_ACCOUNTS, accounts);
  saveProfile(email, { name, email, studentId, branch, year, cgpa });

  openModal(
    "success",
    "Account Created",
    "Your account has been created successfully. You can now log in with your own email and password.",
    function () {
      closeModal();
      showLoginForm();
      $("#loginEmail").value = email;
      $("#signupForm").reset();
    }
  );
}

function handleLogin(e) {
  e.preventDefault();

  const email = $("#loginEmail").value.trim().toLowerCase();
  const password = $("#loginPassword").value;
  const errorEl = $("#loginError");

  errorEl.textContent = "";

  const account = getAccount(email);
  if (!account) {
    errorEl.textContent = "No account found with this email. Please create an account first.";
    return;
  }
  if (account.password !== password) {
    errorEl.textContent = "Invalid email or password.";
    return;
  }

  setCurrentUser(email);
  enterApp();
}

function handleLogout() {
  clearCurrentUser();
  hide($("#appRoot"));
  show($("#authScreen"));
  showLoginForm();
  closeNavDrawer();
  $("#loginForm").reset();
}

/* ---------- Navigation ---------- */

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

  $all(".page-section").forEach(hide);
  show(target);

  $all(".nav-link").forEach(function (link) {
    link.classList.toggle("active", link.dataset.section === sectionId);
  });

  $("#pageTitle").textContent = SECTION_TITLES[sectionId] || "Dashboard";

  closeNavDrawer();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openNavDrawer() {
  $("#sideNav").classList.add("open");
  show($("#navBackdrop"));
  $("#hamburgerBtn").classList.add("active");
  $("#hamburgerBtn").setAttribute("aria-expanded", "true");
}

function closeNavDrawer() {
  $("#sideNav").classList.remove("open");
  hide($("#navBackdrop"));
  $("#hamburgerBtn").classList.remove("active");
  $("#hamburgerBtn").setAttribute("aria-expanded", "false");
}

function toggleNavDrawer() {
  if ($("#sideNav").classList.contains("open")) {
    closeNavDrawer();
  } else {
    openNavDrawer();
  }
}

/* ---------- Dashboard ---------- */

function calcPercentage(present, total) {
  return total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
}

function getOverallAttendance() {
  const present = ATTENDANCE_DATA.reduce((sum, row) => sum + row.present, 0);
  const total = ATTENDANCE_DATA.reduce((sum, row) => sum + row.total, 0);
  return calcPercentage(present, total);
}

function renderDashboard(profile) {
  const email = getCurrentUser();
  const submitted = getSubmittedAssignments(email);
  const pendingCount = ASSIGNMENTS.filter(a => submitted[a.id] !== true).length;
  const firstName = ((profile && profile.name) || "Student").split(" ")[0];

  $("#dashAttendance").textContent = getOverallAttendance() + "%";
  $("#dashAssignments").textContent = pendingCount;
  $("#dashNotices").textContent = NOTICES.length;
  $("#dashCgpa").textContent = (profile && profile.cgpa) || "--";
  $("#dashPlacement").textContent = PLACEMENT_READINESS + "%";
  $("#welcomeMsg").textContent = "Welcome back, " + firstName + "!";
}

/* ---------- Attendance ---------- */

function getAttendanceStatus(percentage) {
  if (percentage >= 75) return { label: "Good", cls: "status-good" };
  if (percentage >= 65) return { label: "Warning", cls: "status-warn" };
  return { label: "Shortage", cls: "status-bad" };
}

function renderAttendance() {
  const tbody = $("#attendanceTbody");
  tbody.innerHTML = "";

  ATTENDANCE_DATA.forEach(function (row) {
    const percentage = calcPercentage(row.present, row.total);
    const status = getAttendanceStatus(percentage);
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.subject)}</td>
      <td>${escapeHtml(row.code)}</td>
      <td>${row.present}</td>
      <td>${row.total}</td>
      <td>${percentage}%</td>
      <td><span class="status-pill ${status.cls}">${status.label}</span></td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- Timetable ---------- */

let currentSection = "Section A";

// No real timetable data yet, so each section gets a repeatable pattern
// generated from its name. Replace with a hard-coded grid when you have real data.
function buildTimetableGrid(sectionName) {
  let seed = 0;
  for (let i = 0; i < sectionName.length; i++) {
    seed += sectionName.charCodeAt(i);
  }

  return DAYS.map(function (day, dayIndex) {
    const row = [day];
    for (let period = 0; period < 6; period++) {
      // step of 1 so periods in a day don't repeat (pool has 8 subjects, 6 periods)
      row.push(SUBJECT_POOL[(seed + dayIndex * 3 + period) % SUBJECT_POOL.length]);
    }
    return row;
  });
}

function renderTimetableTabs() {
  const tabs = $("#timetableTabs");
  tabs.innerHTML = "";

  Object.keys(TIMETABLE_SECTIONS).forEach(function (sectionName) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = sectionName;
    btn.classList.toggle("active", sectionName === currentSection);
    btn.addEventListener("click", function () {
      currentSection = sectionName;
      renderTimetable();
    });
    tabs.appendChild(btn);
  });
}

function renderTimetableTable() {
  const tbody = $("#timetableTbody");
  tbody.innerHTML = "";

  buildTimetableGrid(currentSection).forEach(function (row) {
    const tr = document.createElement("tr");
    tr.innerHTML = row.map(cell => `<td>${escapeHtml(cell)}</td>`).join("");
    tbody.appendChild(tr);
  });

  const info = TIMETABLE_SECTIONS[currentSection];
  $("#timetableMeta").innerHTML =
    `<strong>${escapeHtml(currentSection)}</strong> &nbsp;|&nbsp; Room: ${escapeHtml(info.room)}` +
    ` &nbsp;|&nbsp; Mentor: ${escapeHtml(info.mentor)}`;
}

function renderTimetable() {
  renderTimetableTabs();
  renderTimetableTable();
}

/* ---------- Assignments ---------- */

function isOverdue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate + "T00:00:00") < today;
}

function renderAssignments() {
  const grid = $("#assignmentsGrid");
  const submitted = getSubmittedAssignments(getCurrentUser());
  grid.innerHTML = "";

  ASSIGNMENTS.forEach(function (a) {
    const isSubmitted = submitted[a.id] === true;
    const overdue = !isSubmitted && isOverdue(a.due);
    const pillClass = isSubmitted ? "status-submitted" : overdue ? "status-bad" : "status-pending";
    const pillText = isSubmitted ? "Submitted" : overdue ? "Overdue" : "Pending";

    const card = document.createElement("div");
    card.className = "assignment-card";
    card.innerHTML = `
      <span class="assignment-subject">${escapeHtml(a.subject)}</span>
      <h4>${escapeHtml(a.title)}</h4>
      <p class="assignment-desc">${escapeHtml(a.desc)}</p>
      <p class="assignment-due"><i class="fa-regular fa-calendar"></i> Due: ${escapeHtml(a.due)}</p>
      <div class="assignment-footer">
        <span class="status-pill ${pillClass}">${pillText}</span>
        <button class="btn btn-primary" data-assignment-id="${a.id}" ${isSubmitted ? "disabled" : ""}>
          ${isSubmitted
            ? '<i class="fa-solid fa-check"></i> Done'
            : '<i class="fa-solid fa-paper-plane"></i> Submit'}
        </button>
      </div>`;
    grid.appendChild(card);
  });
}

function submitAssignment(id) {
  const email = getCurrentUser();
  if (!email) return;

  const submitted = getSubmittedAssignments(email);
  submitted[id] = true;
  saveSubmittedAssignments(email, submitted);

  renderAssignments();
  renderDashboard(getProfile(email));
  openModal("success", "Assignment Submitted", "Your assignment has been marked as submitted successfully.");
}

/* ---------- Notices ---------- */

function renderNotices() {
  const list = $("#noticesList");
  list.innerHTML = "";

  NOTICES.forEach(function (n) {
    const card = document.createElement("div");
    card.className = "notice-card";
    card.innerHTML = `
      <span class="notice-cat">${escapeHtml(n.category)}</span>
      <div class="notice-top">
        <h4>${escapeHtml(n.title)}</h4>
        <span class="notice-date">${escapeHtml(n.date)}</span>
      </div>
      <p class="notice-desc">${escapeHtml(n.desc)}</p>`;
    list.appendChild(card);
  });
}

/* ---------- Campus map ---------- */

function initMapImageFallbacks() {
  $all(".map-img-wrap img").forEach(function (img) {
    img.addEventListener("error", function () {
      const fileName = img.getAttribute("src");
      img.closest(".map-img-wrap").innerHTML =
        `<div class="img-fallback"><i class="fa-solid fa-image"></i><span>${escapeHtml(fileName)} not found</span></div>`;
    });
  });
}

/* ---------- Bus routes ---------- */

function renderBusRoutes() {
  const grid = $("#busRoutesGrid");
  grid.innerHTML = "";

  BUS_ROUTES.forEach(function (r) {
    const card = document.createElement("div");
    card.className = "bus-card";
    card.innerHTML = `
      <h4><span class="route-no">${escapeHtml(r.no)}</span> ${escapeHtml(r.name)}</h4>
      <p><strong>Start:</strong> ${escapeHtml(r.start)}</p>
      <p><strong>Major Stops:</strong> ${escapeHtml(r.stops)}</p>
      <p><strong>Timing:</strong> ${escapeHtml(r.timing)}</p>
      <p><strong>Status:</strong> ${escapeHtml(r.status)}</p>`;
    grid.appendChild(card);
  });
}

/* ---------- Scholarships ---------- */

function renderScholarships() {
  const grid = $("#scholarshipsGrid");
  grid.innerHTML = "";

  SCHOLARSHIPS.forEach(function (s, index) {
    const statusClass = s.status.includes("Open") ? "status-open" : "status-closed";
    const card = document.createElement("div");
    card.className = "scholarship-card";
    card.innerHTML = `
      <h4>${escapeHtml(s.name)}</h4>
      <p><strong>Eligibility:</strong> ${escapeHtml(s.eligibility)}</p>
      <p>${escapeHtml(s.info)}</p>
      <div class="scholarship-footer">
        <span class="status-pill ${statusClass}">${escapeHtml(s.status)}</span>
        <button class="btn btn-outline" data-scholarship-idx="${index}">Learn More</button>
      </div>`;
    grid.appendChild(card);
  });
}

function showScholarshipDetails(index) {
  const s = SCHOLARSHIPS[index];
  if (!s) return;
  openModal(
    "info",
    s.name,
    `${s.eligibility}. ${s.info} This is a demo informational card — please contact the college scholarship office for the actual application process.`
  );
}

/* ---------- Placement hub ---------- */

function renderPlacementReadiness() {
  const bar = $("#placementBar");
  bar.style.width = PLACEMENT_READINESS + "%";
  bar.textContent = PLACEMENT_READINESS + "%";
}

function renderPlacementDrives() {
  const tbody = $("#placementDrivesTbody");
  tbody.innerHTML = "";

  PLACEMENT_DRIVES.forEach(function (d) {
    let statusClass = "status-closed";
    if (d.status === "Open") statusClass = "status-open";
    else if (d.status === "Upcoming") statusClass = "status-warn";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(d.company)}</td>
      <td>${escapeHtml(d.role)}</td>
      <td>${escapeHtml(d.eligibility)}</td>
      <td><span class="status-pill ${statusClass}">${escapeHtml(d.status)}</span></td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- Settings ---------- */

function fillSettingsForm(profile) {
  $("#setName").value = profile.name || "";
  $("#setEmail").value = profile.email || "";
  $("#setStudentId").value = profile.studentId || "";
  $("#setBranch").value = profile.branch || "";
  $("#setYear").value = profile.year || "";
  $("#setCgpa").value = profile.cgpa || "";
}

function showSettingsMessage(message) {
  const el = $("#settingsSuccess");
  el.textContent = message;
  setTimeout(function () {
    el.textContent = "";
  }, 2500);
}

function handleSettingsSave(e) {
  e.preventDefault();
  const email = getCurrentUser();
  if (!email) return;

  // Blank fields keep the old value
  const old = getProfile(email) || {};
  const profile = {
    name: $("#setName").value.trim() || old.name,
    email: email,
    studentId: $("#setStudentId").value.trim() || old.studentId,
    branch: $("#setBranch").value.trim() || old.branch,
    year: $("#setYear").value.trim() || old.year,
    cgpa: $("#setCgpa").value.trim() || old.cgpa
  };

  saveProfile(email, profile);
  fillSettingsForm(profile);
  applyProfile(profile);
  showSettingsMessage("Profile saved successfully.");
}

function handleResetProfile() {
  const email = getCurrentUser();
  const account = getAccount(email);
  if (!account) return;

  const profile = createDefaultProfile(account);
  saveProfile(email, profile);
  fillSettingsForm(profile);
  applyProfile(profile);
  showSettingsMessage("Profile reset to default.");
}

function createDefaultProfile(account) {
  return {
    name: account.name,
    email: account.email,
    studentId: account.studentId,
    ...DEFAULT_PROFILE
  };
}

// Updates every place on the page that shows profile info
function applyProfile(profile) {
  $("#topProfileName").textContent = profile.name || "Student";
  $("#topProfileMeta").textContent = (profile.branch || "") + " · " + (profile.year || "");
  $("#infoName").textContent = profile.name || "Student";
  $("#infoBranch").textContent = profile.branch || "--";
  $("#infoYear").textContent = profile.year || "--";
  $("#infoCgpa").textContent = profile.cgpa || "--";

  renderDashboard(profile);
}

/* ---------- Modal ---------- */

let modalOnOk = null;

function openModal(type, title, body, onOk) {
  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-exclamation",
    info: "fa-circle-info"
  };

  $("#modalTitle").textContent = title;
  $("#modalBody").textContent = body;
  $("#modalIcon").innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i>`;

  modalOnOk = onOk || closeModal;
  show($("#genericModal"));
}

function closeModal() {
  hide($("#genericModal"));
  modalOnOk = null;
}

/* ---------- App start ---------- */

function enterApp() {
  const email = getCurrentUser();
  const account = getAccount(email);

  // No valid session, go back to the login screen
  if (!account) {
    handleLogout();
    return;
  }

  let profile = getProfile(email);
  if (!profile) {
    profile = createDefaultProfile(account);
    saveProfile(email, profile);
  }

  hide($("#authScreen"));
  show($("#appRoot"));

  applyProfile(profile);
  renderAttendance();
  renderTimetable();
  renderAssignments();
  renderNotices();
  renderBusRoutes();
  renderScholarships();
  renderPlacementReadiness();
  renderPlacementDrives();
  fillSettingsForm(profile);

  goToSection("dashboard");
}

function initEventListeners() {
  // auth
  $("#loginForm").addEventListener("submit", handleLogin);
  $("#signupForm").addEventListener("submit", handleSignup);
  $("#showSignupBtn").addEventListener("click", showSignupForm);
  $("#showLoginBtn").addEventListener("click", showLoginForm);

  // sidebar and dashboard shortcuts
  $all(".nav-link").forEach(function (link) {
    link.addEventListener("click", () => goToSection(link.dataset.section));
  });
  $all("[data-goto]").forEach(function (card) {
    card.addEventListener("click", () => goToSection(card.dataset.goto));
  });

  // mobile menu
  $("#hamburgerBtn").addEventListener("click", toggleNavDrawer);
  $("#navBackdrop").addEventListener("click", closeNavDrawer);
  $("#mobileAvatarBtn").addEventListener("click", () => goToSection("settings"));

  // logout and settings
  $("#logoutBtn").addEventListener("click", handleLogout);
  $("#settingsLogoutBtn").addEventListener("click", handleLogout);
  $("#settingsForm").addEventListener("submit", handleSettingsSave);
  $("#resetProfileBtn").addEventListener("click", handleResetProfile);

  // buttons inside cards that get re-rendered
  $("#assignmentsGrid").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-assignment-id]");
    if (btn && !btn.disabled) submitAssignment(btn.dataset.assignmentId);
  });
  $("#scholarshipsGrid").addEventListener("click", function (e) {
    const btn = e.target.closest("[data-scholarship-idx]");
    if (btn) showScholarshipDetails(parseInt(btn.dataset.scholarshipIdx, 10));
  });

  // placement downloads (demo only)
  $all("[data-download]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openModal(
        "info",
        "Demo Download",
        `This is a demo build without real files attached. In the full version, '${btn.dataset.download}' would download here.`
      );
    });
  });

  // modal
  $("#modalCloseBtn").addEventListener("click", closeModal);
  $("#modalOkBtn").addEventListener("click", function () {
    (modalOnOk || closeModal)();
  });
  $("#genericModal").addEventListener("click", function (e) {
    if (e.target === this) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });
}

function initApp() {
  initEventListeners();
  initMapImageFallbacks();

  const email = getCurrentUser();
  if (email && getAccount(email)) {
    enterApp();
  } else {
    clearCurrentUser();
    show($("#authScreen"));
    hide($("#appRoot"));
    showLoginForm();
  }
}

document.addEventListener("DOMContentLoaded", initApp);