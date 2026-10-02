const fs = require('fs');

// Patch teacher UI
let teacherHtml = fs.readFileSync('server/ui/teacher/index.html', 'utf8');
const teacherContent = fs.readFileSync('teacher-content.html', 'utf8');
if (!teacherHtml.includes('contentModal')) {
    teacherHtml = teacherHtml.replace('</body>', teacherContent + '\n</body>');
    
    // Add upload button to courses list
    teacherHtml = teacherHtml.replace(
        '<button class="icon-btn small" title="Edit Course"><ion-icon name="create-outline"></ion-icon></button>',
        '<button class="icon-btn small" title="Edit Course"><ion-icon name="create-outline"></ion-icon></button>\n<button class="icon-btn small" title="Manage Content" onclick="openContentModal(${course.id}, \\`${course.title}\\`)"><ion-icon name="cloud-upload-outline"></ion-icon></button>'
    );
    fs.writeFileSync('server/ui/teacher/index.html', teacherHtml);
}

// Patch user UI
let userHtml = fs.readFileSync('server/ui/user/index.html', 'utf8');
const userViewer = fs.readFileSync('user-viewer.html', 'utf8');
if (!userHtml.includes('udemyViewer')) {
    userHtml = userHtml.replace('</body>', userViewer + '\n</body>');
    
    // Add "Watch Course" button to active courses
    userHtml = userHtml.replace(
        '<span class="badge-status status-${c.enrollment_status}">${c.enrollment_status}</span>',
        `<span class="badge-status status-\${c.enrollment_status}">\${c.enrollment_status}</span>
         \${c.enrollment_status === 'Active' ? \`<button class="enroll-btn" style="margin-left:10px; background:#5624d0;" onclick="openCourseViewer(\${c.id}, '\${c.title}')">Watch Course</button>\` : ''}`
    );
    
    // Also use correct icon for trending
    userHtml = userHtml.replace(
        '<div class="course-image"><ion-icon name="book"></ion-icon></div>',
        '<div class="course-image"><ion-icon name="${c.icon || \'book\'}"></ion-icon></div>'
    );
    fs.writeFileSync('server/ui/user/index.html', userHtml);
}
