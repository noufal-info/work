const fs = require('fs');
let html = fs.readFileSync('server/ui/teacher/index.html', 'utf8');

// Add thumbnail input if not exists
if (!html.includes('id="courseThumbnail"')) {
    html = html.replace('<div class="form-group">\n                                <label>Assign Instructor</label>', 
        '<div class="form-group">\n                                <label>Course Thumbnail (Image)</label>\n                                <input type="file" id="courseThumbnail" accept="image/*">\n                            </div>\n                            <div class="form-group">\n                                <label>Assign Instructor</label>');
}

// Replace handleCourseSubmit
html = html.replace(/const payload = {[\s\S]*?body: JSON.stringify\(payload\)/, `const formData = new FormData();
            formData.append('title', document.getElementById('courseTitle').value);
            formData.append('description', document.getElementById('courseDescription').value);
            formData.append('instructor', document.getElementById('courseInstructor').value);
            formData.append('price', document.getElementById('coursePrice').value);
            
            const fileInput = document.getElementById('courseThumbnail');
            if(fileInput && fileInput.files.length > 0) {
                formData.append('thumbnail', fileInput.files[0]);
            }

            try {
                const res = await fetch('/api/teacher/courses', {
                    method: 'POST',
                    body: formData`);

// Remove headers: {'Content-Type': 'application/json'},
html = html.replace(/headers: { 'Content-Type': 'application\/json' },\n\s*body: formData/, 'body: formData');

fs.writeFileSync('server/ui/teacher/index.html', html);
console.log("Teacher UI patched.");
