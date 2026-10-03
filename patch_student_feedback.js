const fs = require('fs');
let html = fs.readFileSync('server/ui/user/index.html', 'utf8');

// Add Feedback Modal
const feedbackModal = `
            <!-- Feedback Modal -->
            <div class="modal-overlay" id="feedbackModal">
                <div class="modal">
                    <div class="modal-header">
                        <h2>Leave Course Feedback</h2>
                        <button class="modal-close" onclick="closeModal('feedbackModal')"><ion-icon name="close-outline"></ion-icon></button>
                    </div>
                    <form onsubmit="handleFeedbackSubmit(event)">
                        <div class="modal-body">
                            <input type="hidden" id="fbCourseId">
                            <div class="form-group">
                                <label>Rating (1-5)</label>
                                <input type="number" id="fbRating" min="1" max="5" step="0.5" required placeholder="5.0">
                            </div>
                            <div class="form-group">
                                <label>Your Review</label>
                                <textarea id="fbReview" rows="4" placeholder="What did you think about the course?" required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary" onclick="closeModal('feedbackModal')">Cancel</button>
                            <button type="submit" class="btn-primary">Submit Feedback</button>
                        </div>
                    </form>
                </div>
            </div>
`;

if (!html.includes('id="feedbackModal"')) {
    html = html.replace('<!-- Course Viewer Modal -->', feedbackModal + '\n            <!-- Course Viewer Modal -->');
}

// Add Feedback Button to Active Courses
if (!html.includes('openFeedbackModal')) {
    html = html.replace(/\$\{c\.enrollment_status === 'Active' \? \`<button class="premium-enroll-btn" onclick="openCourseViewer/g, `\${c.enrollment_status === 'Active' ? \`<button class="btn-secondary" style="border: 1px solid #cbd5e1; padding: 12px; border-radius: 12px; background: transparent; cursor: pointer;" onclick="openFeedbackModal(\${c.id})">Leave Feedback</button><button class="premium-enroll-btn" onclick="openCourseViewer`);
}

// Add Feedback JS
const feedbackJs = `
        function openFeedbackModal(courseId) {
            document.getElementById('fbCourseId').value = courseId;
            openModal('feedbackModal');
        }

        async function handleFeedbackSubmit(e) {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.innerHTML = 'Submitting...';
            btn.disabled = true;

            const courseId = document.getElementById('fbCourseId').value;
            const rating = document.getElementById('fbRating').value;
            const reviewText = document.getElementById('fbReview').value;

            try {
                const res = await fetch('/api/courses/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        course_id: courseId,
                        student_email: studentEmail,
                        rating: parseFloat(rating),
                        review_text: reviewText
                    })
                });
                const data = await res.json();
                if (data.success) {
                    alert('Feedback submitted! Thank you.');
                    closeModal('feedbackModal');
                    e.target.reset();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch(err) {
                alert('Failed to submit feedback.');
            } finally {
                btn.innerHTML = 'Submit Feedback';
                btn.disabled = false;
            }
        }
`;

if (!html.includes('handleFeedbackSubmit')) {
    html = html.replace('function openCourseViewer(courseId, title) {', feedbackJs + '\n        function openCourseViewer(courseId, title) {');
}

fs.writeFileSync('server/ui/user/index.html', html);
console.log("Student Feedback UI Patched.");
