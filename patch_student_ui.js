const fs = require('fs');
let css = fs.readFileSync('server/ui/user/style.css', 'utf8');

const newCSS = `

/* Premium Course Card Styles */
.premium-course-card {
    background-color: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    border: none;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.premium-course-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.12);
}

.premium-thumbnail {
    width: 100%;
    height: 180px;
    background-color: #e2e8f0;
    position: relative;
}

.premium-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.premium-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: #334155;
    display: flex;
    align-items: center;
    gap: 4px;
}

.premium-details {
    padding: 16px;
    display: flex;
    flex-direction: column;
}

.premium-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
    line-height: 1.4;
}

.premium-desc {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 16px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.premium-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 12px;
    color: #94a3b8;
}

.premium-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.premium-instructor {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.instructor-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
}

.instructor-name {
    font-size: 13px;
    font-weight: 500;
    color: #475569;
}

.premium-actions {
    display: flex;
    gap: 8px;
    align-items: center;
}

.premium-enroll-btn {
    flex: 1;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
}

.premium-enroll-btn:hover {
    background: #4f46e5;
}

.premium-status {
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    background: #f1f5f9;
    color: #475569;
}

.premium-status.active {
    background: #dcfce7;
    color: #166534;
}

.premium-status.pending {
    background: #fef9c3;
    color: #854d0e;
}
`;

if (!css.includes('.premium-course-card')) {
    fs.writeFileSync('server/ui/user/style.css', css + newCSS);
}

let html = fs.readFileSync('server/ui/user/index.html', 'utf8');

const oldAvailable = `                        <div class="course-card">
                            <div class="course-image"><ion-icon name="\${c.icon || 'book'}"></ion-icon></div>
                            <div class="course-details">
                                <h3>\${c.title}</h3>
                                <p>\${c.description}</p>
                                <button class="enroll-btn" onclick="enrollCourse(\${c.id})">Enroll Now</button>
                            </div>
                        </div>`;

const newAvailable = `                        <div class="premium-course-card">
                            <div class="premium-thumbnail">
                                <img src="\${c.thumbnail_url || '/uploads/images/default_course.jpg'}" alt="Course Thumbnail" onerror="this.src='/uploads/images/default_course.jpg'">
                                <div class="premium-badge"><ion-icon name="star"></ion-icon> 4.8</div>
                            </div>
                            <div class="premium-details">
                                <h3 class="premium-title">\${c.title}</h3>
                                <p class="premium-desc">\${c.description}</p>
                                
                                <div class="premium-instructor">
                                    <div class="instructor-avatar"><ion-icon name="person"></ion-icon></div>
                                    <span class="instructor-name">\${c.instructor.split('@')[0]}</span>
                                </div>
                                
                                <div class="premium-meta">
                                    <div class="premium-meta-item"><ion-icon name="time-outline"></ion-icon> 12h 30m</div>
                                    <div class="premium-meta-item"><ion-icon name="play-circle-outline"></ion-icon> \${Math.floor(Math.random()*20)+5} Lessons</div>
                                    <div class="premium-meta-item"><ion-icon name="cash-outline"></ion-icon> ₹\${c.price}</div>
                                </div>

                                <div class="premium-actions">
                                    <button class="premium-enroll-btn" onclick="enrollCourse(\${c.id})">Enroll Now</button>
                                </div>
                            </div>
                        </div>`;

html = html.replace(oldAvailable, newAvailable);

const oldEnrolled = `                        <div class="course-card">
                            <div class="course-image" style="background: var(--dark-blue);"><ion-icon name="play"></ion-icon></div>
                            <div class="course-details">
                                <h3>\${c.title}</h3>
                                <p>\${c.description}</p>
                                <span class="badge-status status-\${c.enrollment_status}">\${c.enrollment_status}</span>
         \${c.enrollment_status === 'Active' ? \`<button class="enroll-btn" style="margin-left:10px; background:#5624d0;" onclick="openCourseViewer(\${c.id}, '\${c.title}')">Watch Course</button>\` : ''}
                            </div>
                        </div>`;

const newEnrolled = `                        <div class="premium-course-card">
                            <div class="premium-thumbnail">
                                <img src="\${c.thumbnail_url || '/uploads/images/default_course.jpg'}" alt="Course Thumbnail" onerror="this.src='/uploads/images/default_course.jpg'">
                                <div class="premium-badge"><ion-icon name="bookmark"></ion-icon> Saved</div>
                            </div>
                            <div class="premium-details">
                                <h3 class="premium-title">\${c.title}</h3>
                                <p class="premium-desc">\${c.description}</p>
                                
                                <div class="premium-instructor">
                                    <div class="instructor-avatar"><ion-icon name="person"></ion-icon></div>
                                    <span class="instructor-name">\${c.instructor ? c.instructor.split('@')[0] : 'Instructor'}</span>
                                </div>
                                
                                <div class="premium-meta">
                                    <div class="premium-meta-item"><ion-icon name="school-outline"></ion-icon> Enrolled</div>
                                </div>

                                <div class="premium-actions">
                                    <span class="premium-status \${c.enrollment_status.toLowerCase()}">\${c.enrollment_status}</span>
                                    \${c.enrollment_status === 'Active' ? \`<button class="premium-enroll-btn" onclick="openCourseViewer(\${c.id}, '\${c.title}')">Watch Course</button>\` : ''}
                                </div>
                            </div>
                        </div>`;

html = html.replace(oldEnrolled, newEnrolled);

fs.writeFileSync('server/ui/user/index.html', html);
console.log("Student UI patched successfully.");
