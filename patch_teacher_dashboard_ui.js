const fs = require('fs');
let html = fs.readFileSync('server/ui/teacher/index.html', 'utf8');

// 1. Add Dashboard Tab in Sidebar
const newSidebarNav = `
            <nav class="sidebar-nav">
                <a href="#" class="nav-item active" id="nav-dashboard" onclick="switchTab('dashboard', event)">
                    <ion-icon name="grid-outline"></ion-icon>
                    <span>Dashboard</span>
                </a>
                <a href="/AnalogiX/teacher/chat" class="nav-item" id="nav-messages">
                    <ion-icon name="chatbubbles-outline"></ion-icon>
                    <span>Messages</span>
                </a>
                <a href="#" class="nav-item" id="nav-calendar">
                    <ion-icon name="calendar-outline"></ion-icon>
                    <span>Calendar</span>
                </a>
                <a href="#" class="nav-item" id="nav-courses" onclick="switchTab('courses', event)">
                    <ion-icon name="library-outline"></ion-icon>
                    <span>My Courses</span>
                </a>
                <a href="#" class="nav-item" id="nav-students">
                    <ion-icon name="people-outline"></ion-icon>
                    <span>Students</span>
                </a>
            </nav>
            <div class="pro-upgrade-card">
                <img src="https://cdni.iconscout.com/illustration/premium/thumb/web-development-3454628-2918517.png" alt="Upgrade">
                <h4>Upgrade to Pro</h4>
                <p>Unlock premium features & enhance your LMS experience!</p>
                <button>Upgrade Now</button>
            </div>
`;
html = html.replace(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/, newSidebarNav);

// 2. Add Section Dashboard
const sectionDashboard = `
            <div id="section-dashboard" class="content-section dashboard-content active">
                <div class="dashboard-grid">
                    <!-- Left Column: Profile & Calendar -->
                    <div class="dash-col-left">
                        <div class="dash-card profile-card" id="teacherProfileCard">
                            <div class="profile-header-bg"></div>
                            <img src="https://ui-avatars.com/api/?name=Instructor" alt="Avatar" class="profile-avatar" id="t-avatar">
                            <div class="profile-status"><span class="dot"></span> Active Contract</div>
                            <h2 id="t-name">Loading...</h2>
                            <p class="profile-role" id="t-role">Instructor</p>
                            
                            <div class="profile-contact">
                                <div class="contact-item"><ion-icon name="mail-outline"></ion-icon> <span id="t-email">...</span></div>
                                <div class="contact-item"><ion-icon name="call-outline"></ion-icon> <span id="t-phone">...</span></div>
                                <div class="contact-item"><ion-icon name="location-outline"></ion-icon> <span id="t-address">...</span></div>
                            </div>
                            
                            <div class="profile-socials">
                                <ion-icon name="logo-linkedin"></ion-icon>
                                <ion-icon name="logo-twitter"></ion-icon>
                                <ion-icon name="logo-instagram"></ion-icon>
                                <button class="btn-edit-profile">Edit</button>
                            </div>
                        </div>

                        <div class="dash-card calendar-card">
                            <h3><span id="currentMonthYear">Month Year</span> <ion-icon name="chevron-down-outline"></ion-icon></h3>
                            <div class="calendar-days">
                                <div class="cal-day"><span>Sun</span><strong>12</strong></div>
                                <div class="cal-day"><span>Mon</span><strong>13</strong></div>
                                <div class="cal-day"><span>Tue</span><strong>14</strong></div>
                                <div class="cal-day active"><span>Wed</span><strong>15</strong></div>
                                <div class="cal-day"><span>Thu</span><strong>16</strong></div>
                                <div class="cal-day"><span>Fri</span><strong>17</strong></div>
                                <div class="cal-day"><span>Sat</span><strong>18</strong></div>
                            </div>
                            <div class="schedule-list" id="scheduleList">
                                <!-- Loaded dynamically -->
                                <div style="text-align:center; padding: 20px;">Loading schedule...</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Charts & Courses -->
                    <div class="dash-col-right">
                        <div class="charts-row">
                            <div class="dash-card chart-card">
                                <h3>Performance <span class="chart-filter">Last 6 Months</span></h3>
                                <canvas id="performanceChart"></canvas>
                            </div>
                            <div class="dash-card chart-card">
                                <h3>Activity <span class="chart-filter">This Week</span></h3>
                                <canvas id="activityChart"></canvas>
                            </div>
                        </div>

                        <div class="dash-card courses-summary-card">
                            <div class="card-header-flex">
                                <h3>Courses</h3>
                                <button class="btn-filter"><ion-icon name="filter-outline"></ion-icon> Filter</button>
                            </div>
                            <table class="dash-table">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Rating</th>
                                        <th>Completion Rate</th>
                                        <th>Earnings</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="dashCoursesTable">
                                    <!-- Loaded dynamically -->
                                </tbody>
                            </table>
                        </div>

                        <div class="dash-card feedback-card">
                            <div class="card-header-flex">
                                <h3>Feedback</h3>
                                <button class="btn-view-all">View All</button>
                            </div>
                            <div class="feedback-scroll" id="feedbackList">
                                <!-- Loaded dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
`;
// Insert before section-courses
html = html.replace('<div id="section-courses"', sectionDashboard + '\n            <div id="section-courses"');
// Make section courses not active by default
html = html.replace('id="section-courses" class="content-section dashboard-content"', 'id="section-courses" class="content-section dashboard-content" style="display:none;"');

// 3. Update switchTab function
const oldSwitchTab = `function switchTab(tabId, event) {
            if(event) event.preventDefault();
            document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            
            document.getElementById('section-' + tabId).classList.add('active');
            if(event) {
                event.currentTarget.classList.add('active');
            } else {
                document.getElementById('nav-' + tabId).classList.add('active');
            }
        }`;
const newSwitchTab = `function switchTab(tabId, event) {
            if(event) event.preventDefault();
            document.querySelectorAll('.content-section').forEach(el => {
                el.classList.remove('active');
                el.style.display = 'none';
            });
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            
            const targetSection = document.getElementById('section-' + tabId);
            if(targetSection) {
                targetSection.classList.add('active');
                targetSection.style.display = 'block';
            }
            if(event) {
                event.currentTarget.classList.add('active');
            } else {
                const nav = document.getElementById('nav-' + tabId);
                if(nav) nav.classList.add('active');
            }

            if(tabId === 'dashboard') loadDashboardData();
        }`;
html = html.replace(oldSwitchTab, newSwitchTab);

// 4. Inject Dashboard JS functions and Chart.js
if(!html.includes('https://cdn.jsdelivr.net/npm/chart.js')) {
    html = html.replace('</head>', '    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n</head>');
}

const dashboardJs = `
        async function loadDashboardData() {
            try {
                // 1. Profile
                fetch('/api/teacher/profile?email=' + encodeURIComponent(currentTeacherEmail))
                .then(res => res.json())
                .then(data => {
                    if(data.success) {
                        const p = data.profile;
                        document.getElementById('t-name').innerText = p.name;
                        document.getElementById('t-email').innerText = p.email;
                        document.getElementById('t-phone').innerText = p.phone_number || '+1 555-0000';
                        document.getElementById('t-address').innerText = p.address || 'Los Angeles, CA';
                        if(p.avatar_url) document.getElementById('t-avatar').src = p.avatar_url;
                        document.getElementById('t-role').innerText = p.course || 'Instructor';
                    }
                });

                // 2. Metrics & Charts
                fetch('/api/teacher/dashboard-metrics?email=' + encodeURIComponent(currentTeacherEmail))
                .then(res => res.json())
                .then(data => {
                    if(data.success) {
                        initCharts(data.metrics);
                    }
                });

                // 3. Courses (using existing API)
                fetch('/api/teacher/courses')
                .then(res => res.json())
                .then(courses => {
                    const tbody = document.getElementById('dashCoursesTable');
                    tbody.innerHTML = '';
                    courses.forEach(c => {
                        const earnings = (c.enrolled_count * parseFloat(c.price)).toLocaleString();
                        tbody.innerHTML += \`
                            <tr>
                                <td>
                                    <div class="dash-course-info">
                                        <img src="\${c.thumbnail_url}" onerror="this.src='/uploads/images/default_course.jpg'">
                                        <div>
                                            <strong>\${c.title}</strong>
                                            <small>\${c.enrolled_count} Students</small>
                                        </div>
                                    </div>
                                </td>
                                <td><ion-icon name="star" style="color:#fbbf24"></ion-icon> 4.7</td>
                                <td>
                                    <div class="progress-bar"><div class="fill" style="width: 78%"></div></div>
                                </td>
                                <td>₹\${earnings}</td>
                                <td><span class="badge-status active">Active</span></td>
                            </tr>
                        \`;
                    });
                });

                // 4. Feedback
                fetch('/api/teacher/feedback?email=' + encodeURIComponent(currentTeacherEmail))
                .then(res => res.json())
                .then(data => {
                    if(data.success) {
                        const fb = document.getElementById('feedbackList');
                        fb.innerHTML = '';
                        if(data.reviews.length === 0) {
                            fb.innerHTML = '<div class="feedback-item">No reviews yet.</div>';
                        }
                        data.reviews.forEach(r => {
                            fb.innerHTML += \`
                                <div class="feedback-item">
                                    <div class="fb-header">
                                        <img src="https://ui-avatars.com/api/?name=\${r.student_name}" alt="">
                                        <div class="fb-meta">
                                            <strong>\${r.student_name}</strong>
                                            <span class="rating"><ion-icon name="star"></ion-icon> \${r.rating}</span>
                                        </div>
                                    </div>
                                    <p class="fb-text">"\${r.review_text}"</p>
                                    <small class="fb-course">Course: \${r.course_title}</small>
                                </div>
                            \`;
                        });
                    }
                });

                // 5. Schedule (Mocked for visual for now, API ready)
                const sched = document.getElementById('scheduleList');
                sched.innerHTML = \`
                    <div class="schedule-item" style="border-left: 4px solid #f472b6; background: #fdf2f8;">
                        <strong>Live Q&A Session</strong><br><small>8:00 AM - 9:00 AM</small>
                    </div>
                    <div class="schedule-item" style="border-left: 4px solid #fbbf24; background: #fef3c7;">
                        <strong>Course Content Update</strong><br><small>10:00 AM - 11:30 AM</small>
                    </div>
                    <div class="schedule-item" style="border-left: 4px solid #60a5fa; background: #eff6ff;">
                        <strong>Student Consultation</strong><br><small>12:00 PM - 1:00 PM</small>
                    </div>
                \`;

            } catch(e) {
                console.error(e);
            }
        }

        let pChart, aChart;
        function initCharts(metrics) {
            const ctx1 = document.getElementById('performanceChart').getContext('2d');
            if(pChart) pChart.destroy();
            pChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Performance',
                        data: metrics.performance,
                        borderColor: '#f472b6',
                        backgroundColor: 'rgba(244, 114, 182, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
            });

            const ctx2 = document.getElementById('activityChart').getContext('2d');
            if(aChart) aChart.destroy();
            aChart = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Hours',
                        data: metrics.activity,
                        backgroundColor: ['#f472b6','#f472b6','#f472b6','#f472b6','#f472b6','#fbbf24','#f472b6'],
                        borderRadius: 4
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
            });
        }
`;
html = html.replace('function checkAuth() {', dashboardJs + '\n        function checkAuth() {');
// Call loadDashboardData on init
html = html.replace('loadCourses();', 'loadCourses();\n            loadDashboardData();');

fs.writeFileSync('server/ui/teacher/index.html', html);

// 5. Append CSS to style.css
const newCSS = `

/* --- Dashboard Revamp Styles --- */
.dashboard-grid {
    display: flex;
    gap: 20px;
}
.dash-col-left {
    width: 30%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.dash-col-right {
    width: 70%;
    display: flex;
    flex-direction: column;
    gap: 20px;
}
.dash-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}

/* Profile Card */
.profile-card {
    position: relative;
    text-align: center;
    padding-top: 50px;
    overflow: hidden;
}
.profile-header-bg {
    position: absolute;
    top: 0; left: 0; right: 0; height: 80px;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    border-radius: 16px 16px 0 0;
}
.profile-avatar {
    position: relative;
    width: 80px; height: 80px;
    border-radius: 50%;
    border: 4px solid #fff;
    margin-bottom: 10px;
    z-index: 1;
}
.profile-status {
    position: absolute;
    top: 100px; right: 20px;
    background: #fef3c7; color: #d97706;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: bold;
}
.profile-role { color: #64748b; font-size: 13px; margin-bottom: 20px;}
.profile-contact { text-align: left; background: #fef2f2; padding: 15px; border-radius: 12px; margin-bottom: 20px; }
.contact-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #475569; margin-bottom: 8px;}
.profile-socials { display: flex; align-items: center; gap: 15px; color: #475569; font-size: 20px; }
.btn-edit-profile { margin-left: auto; background: #e2e8f0; border: none; padding: 6px 15px; border-radius: 8px; cursor:pointer;}

/* Calendar Card */
.calendar-days { display: flex; justify-content: space-between; margin: 15px 0;}
.cal-day { display: flex; flex-direction: column; align-items: center; font-size: 12px; color: #64748b; }
.cal-day strong { font-size: 16px; color: #1e293b; margin-top: 5px;}
.cal-day.active strong { background: #fbbf24; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.schedule-item { padding: 10px 15px; border-radius: 8px; margin-bottom: 10px; }

/* Charts */
.charts-row { display: flex; gap: 20px; }
.chart-card { flex: 1; }
.chart-filter { float: right; font-size: 12px; color: #94a3b8; }

/* Dashboard Table */
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.dash-table { width: 100%; border-collapse: collapse; text-align: left; }
.dash-table th { color: #64748b; font-size: 13px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
.dash-table td { padding: 15px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;}
.dash-course-info { display: flex; align-items: center; gap: 10px; }
.dash-course-info img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover;}
.progress-bar { width: 100px; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
.progress-bar .fill { background: #f472b6; height: 100%; }

/* Feedback */
.feedback-scroll { display: flex; gap: 15px; overflow-x: auto; padding-bottom: 10px;}
.feedback-item { min-width: 250px; background: #f8fafc; padding: 15px; border-radius: 12px; }
.fb-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px;}
.fb-header img { width: 30px; height: 30px; border-radius: 50%; }
.fb-meta { display: flex; flex-direction: column; }
.fb-meta .rating { color: #fbbf24; font-size: 12px; }
.fb-text { font-size: 13px; color: #475569; margin: 0 0 10px 0; font-style: italic;}
.fb-course { color: #94a3b8; font-size: 11px; }

/* Upgrade Card */
.pro-upgrade-card {
    background: #fbbf24;
    border-radius: 16px;
    padding: 20px;
    text-align: center;
    margin: 20px;
}
.pro-upgrade-card img { width: 100px; margin-top: -40px; }
.pro-upgrade-card h4 { margin: 10px 0 5px; color: #fff;}
.pro-upgrade-card p { font-size: 12px; color: #fff; margin-bottom: 15px; }
.pro-upgrade-card button { width: 100%; background: #fff; color: #fbbf24; border: none; padding: 8px; border-radius: 8px; font-weight: bold;}
`;

let css = fs.readFileSync('server/ui/admin/style.css', 'utf8');
if (!css.includes('.dash-col-left')) {
    fs.writeFileSync('server/ui/admin/style.css', css + newCSS);
}

console.log("Teacher Dashboard UI Patched.");
