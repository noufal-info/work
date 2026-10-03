const fs = require('fs');
let html = fs.readFileSync('server/ui/user/index.html', 'utf8');

const upcomingEventsSection = `
            <div id="upcomingEventsContainer" style="display:none; margin-bottom: 24px;">
                <h2 class="section-title">Upcoming Live Events</h2>
                <div id="upcomingEventsList" style="display:flex; flex-direction:column; gap:12px;"></div>
            </div>
            <h2 class="section-title">Trending / Available Courses</h2>
`;
if (!html.includes('upcomingEventsContainer')) {
    html = html.replace('<h2 class="section-title">Trending / Available Courses</h2>', upcomingEventsSection);
}

const loadEventsJs = `
        async function loadUpcomingEvents() {
            try {
                const res = await fetch('/api/events?email=' + encodeURIComponent(studentEmail));
                const data = await res.json();
                if (data.success && data.events.length > 0) {
                    document.getElementById('upcomingEventsContainer').style.display = 'block';
                    let html = '';
                    data.events.forEach(e => {
                        const sTime = new Date(e.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                        const sDate = new Date(e.start_time).toLocaleDateString();
                        html += \`
                            <div style="background: white; border-radius: 12px; padding: 12px; display:flex; align-items:center; gap: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-left: 4px solid \${e.color_code}">
                                <div style="background: \${e.color_code}22; color: \${e.color_code}; padding: 10px; border-radius: 8px;">
                                    <ion-icon name="calendar" style="font-size: 24px;"></ion-icon>
                                </div>
                                <div style="flex:1;">
                                    <h4 style="margin:0 0 4px 0; color:#1e293b;">\${e.title}</h4>
                                    <p style="margin:0; font-size:12px; color:#64748b;">\${e.course_title} • \${e.teacher_name}</p>
                                </div>
                                <div style="text-align:right; font-size:12px; color:#475569; font-weight:bold;">
                                    \${sDate}<br>\${sTime}
                                </div>
                            </div>
                        \`;
                    });
                    document.getElementById('upcomingEventsList').innerHTML = html;
                } else {
                    document.getElementById('upcomingEventsContainer').style.display = 'none';
                }
            } catch (err) {}
        }
`;

if (!html.includes('loadUpcomingEvents')) {
    html = html.replace('async function loadAvailableCourses() {', loadEventsJs + '\n        async function loadAvailableCourses() {');
}

// Ensure loadUpcomingEvents is called when home loads
html = html.replace("if (tabId === 'home') loadAvailableCourses();", "if (tabId === 'home') { loadAvailableCourses(); loadUpcomingEvents(); }");

fs.writeFileSync('server/ui/user/index.html', html);
console.log("Student UI updated with Upcoming Events.");
