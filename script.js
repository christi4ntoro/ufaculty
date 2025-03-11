fetch('data.json')
.then(response => response.json())
.then(data => {
    const appContainer = document.querySelector('.container');
    const facultiesCards = document.getElementById('faculties-cards');
    const facultiesDetails = document.getElementById('faculties-details');
    const courses = document.getElementById('courses');
    const topicDetails = document.getElementById('topic-details');
    const professorDetails = document.getElementById('professor-details');
    const breadcrumbContainer = document.getElementById('breadcrumb');
    
    const homeButton = document.querySelector('.navbar .home-button'); // Adjust the selector if necessary
    
    homeButton.addEventListener('click', () => {
        const facultiesCardsSection = document.querySelector('.faculties-cards'); 
        showSection(facultiesCardsSection);
        historyStack = [];
    });
    
    let historyStack = [];
    
    function updateBreadcrumb(paths) {
        breadcrumbContainer.innerHTML = paths.map((path, index) => `
            <span class="breadcrumb-item" data-index="${index}">${path}</span>
        `).join(' > ');
    }
    
    function navigateBack() {
        if (historyStack.length > 1) {
            historyStack.pop(); // Remove the current state (last one in the stack)
            const lastState = historyStack[historyStack.length - 1]; // Get the previous state
            lastState(); // Navigate back to the previous state
        }
    }
    
    function showSection(section, breadcrumbPath) {
        [facultiesCards, facultiesDetails, courses, topicDetails, professorDetails]
        .forEach(el => el.style.display = el === section ? 'block' : 'none');
        if (breadcrumbPath) {
            updateBreadcrumb(breadcrumbPath);
        }
    }
    
    function renderFacultiesCards() {
        facultiesCards.innerHTML = `
        <h2 class="section-title">Escolas</h2>
        <div class="grid-box-4">
            ${data.faculties.map(faculty => `
                <div class="card ${faculty.disabled ? 'disabled' : ''}" data-id="${faculty.id}">
                    <p>Faculdade de</p>
                    <p class="h3">${faculty.name}</p>
                </div>
            `).join('')}
            </div>
        `;
        showSection(facultiesCards, ['Home']);
        historyStack = [renderFacultiesCards];
    }
    
    function renderFacultyDetails(facultyId) {
        const faculty = data.faculties.find(f => f.id === facultyId);
        const facultyCourses = data.courses[facultyId] || [];
        
        facultiesDetails.innerHTML = `
            <div class="section-title">
                <button class="back-button"></button>
                <h2>Faculdade de ${faculty.name}</h2>
            </div>
            <h3>Cursos</h3>
            <div class="grid-box-2">
                ${facultyCourses.map(course => `
                    <div class="course-card ${course.disabled ? 'disabled' : ''}" data-id="${course.id}">
                        <p class="h4">${course.name}</p>
                        <p>${faculty.name} / <b>${course.code}</b></p>
                    </div>
                `).join('')}
            </div>
        `;
        showSection(facultiesDetails, ['Home', faculty.name]);
        historyStack.push(() => renderFacultyDetails(facultyId));
    }
    
    function renderCourses(courseId) {
        const facultyCourses = Object.values(data.courses).flat();
        const course = facultyCourses.find(c => c.id === courseId);
        if (!course) return;
        
        let studyPlan = data.studyPlans[courseId] || [];
        if (studyPlan.length === 0) return;
        
        courses.innerHTML = `
            <div class="section-title">
                <button class="back-button"></button>
                <h2>${course.name}</h2>
            </div>
            <table id="courseTable">
                <thead>
                    <tr class="table-header">
                        <th data-index="0">Code <span class="sort-icon"></span></th>
                        <th data-index="1">Topic <span class="sort-icon"></span></th>
                        <th data-index="2">Credits <span class="sort-icon"></span></th>
                        <th data-index="3">Semester <span class="sort-icon"></span></th>
                        <th data-index="4">Professor <span class="sort-icon"></span></th>
                        <th data-index="5">Students <span class="sort-icon"></span></th>
                    </tr>
                </thead>
                <tbody>
                    ${studyPlan.map(subject => `
                        <tr class="subject-row" data-id="${subject.id}">
                            <td>${subject.code}</td>
                            <td class="clickable-topic ${subject.disabled ? 'disabled' : ''}" ${subject.disabled ? 'disabled' : ''}>${subject.title}</td>
                            <td>${subject.credits}</td>
                            <td>${subject.semester}</td>
                            <td class="clickable-professor ${subject.disabled ? 'disabled' : ''}" data-id="${data.professors[subject.professor]?.id || ''}" ${subject.disabled ? 'disabled' : ''}>
                                ${data.professors[subject.professor]?.name || "Unknown"}
                            </td>
                            <td>${subject.students}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        showSection(courses, ['Home', course.name]);
        historyStack.push(() => renderCourses(courseId));
        
        // Add sorting event listeners
        document.querySelectorAll("#courseTable thead th").forEach(th => {
            th.addEventListener("click", () => sortTable(th.dataset.index));
        });
        
        // ✅ Default sort by Topic (index 0)
        sortTable(0, true);
    }    
    
    function sortTable(columnIndex, isDefault = false) {
        const table = document.getElementById("courseTable");
        const tbody = table.querySelector("tbody");
        const rows = Array.from(tbody.rows);
        const headers = document.querySelectorAll("#courseTable thead th");
        
        // Detect sorting order
        let ascending = isDefault || table.dataset.sortColumn !== columnIndex || table.dataset.sortOrder !== "asc";
        table.dataset.sortColumn = columnIndex;
        table.dataset.sortOrder = ascending ? "asc" : "desc";
        
        rows.sort((rowA, rowB) => {
            let cellA = rowA.cells[columnIndex].innerText.trim();
            let cellB = rowB.cells[columnIndex].innerText.trim();
            
            // Convert to numbers if applicable
            let isNumeric = !isNaN(cellA) && !isNaN(cellB);
            if (isNumeric) {
                cellA = Number(cellA);
                cellB = Number(cellB);
            }
            
            return ascending ? (cellA > cellB ? 1 : -1) : (cellA < cellB ? 1 : -1);
        });
        
        // Append sorted rows back to the table
        tbody.innerHTML = "";
        rows.forEach(row => tbody.appendChild(row));
        
        // Reset styles and update selected column
        headers.forEach(header => {
            header.classList.remove("sorted");
            header.querySelector(".sort-icon").innerHTML = "";
        });
        
        headers[columnIndex].classList.add("sorted");
        headers[columnIndex].querySelector(".sort-icon").innerHTML = ascending ? " <i class='bi bi-arrow-up-short'></i>" : " <i class='bi bi-arrow-down-short'></i>";
    }
    
    
    function renderTopicDetails(topicId) {
        const topic = data.topics[topicId];
        topicDetails.innerHTML = `
            <h2>${topic.name}</h2>
            <p>${topic.description}</p>
            <button class="back-button">Back</button>
        `;
        showSection(topicDetails, ['Home', 'Engineering', 'Data Structures', topic.name]);
        historyStack.push(() => renderTopicDetails(topicId));
    }
    
    function renderProfessorDetails(professorId) {
        const professor = data.professors[professorId];
        professorDetails.innerHTML = `
            <h2>${professor.name}</h2>
            <p>Address: ${professor.address}</p>
            <p>Phone: ${professor.phone}</p>
            <p>Email: ${professor.email}</p>
            <p>Salary: ${professor.salary}</p>
            <button class="back-button">Back</button>
        `;
        showSection(professorDetails, ['Home', 'Engineering', 'Data Structures', professor.name]);
        historyStack.push(() => renderProfessorDetails(professorId));
    }
    
    function renderTopicDetails(topicId) {
        const topic = data.topics[topicId];
        const students = data.students.slice(0, 8); // Mostrar solo 4 estudiantes
        
        topicDetails.innerHTML = `
            <div class="section-title">
                <button class="back-button"></button>
                <h2>${topic.name}</h2>
            </div>
                <p>${topic.description}</p>
                <h3>Classroom Information</h3>
                <table>
                    <thead>
                    <tr>
                        <th class="pic-width">Photo</th>
                        <th>User Number</th>
                        <th>Student Name</th>
                        <th>Birthdate</th>
                        <th>Grade</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${students.map(student => `
                        <tr>
                        <td><img src="${student.photo}" alt="${student.name}" class="student-photo"></td>
                        <td>${student.userNumber}</td>
                        <td>${student.name}</td>
                        <td>${student.birthdate}</td>
                        <td>${Math.floor(Math.random() * 10) + 1}</td>
                        <td class="actions"><i class="bi bi-pencil"></i> <i class="bi bi-eye"></i> <i class="bi bi-trash3"></i></td>
                        </tr>`
    ).join('')}
                    </tbody>
                </table>
        `;
    showSection(topicDetails);
}

appContainer.addEventListener('click', (e) => {
    if (e.target.closest('.card')) {
        const facultyId = parseInt(e.target.closest('.card').dataset.id);
        renderFacultyDetails(facultyId);
    }
    if (e.target.closest('.course-card')) {
        const courseId = parseInt(e.target.closest('.course-card').dataset.id);
        renderCourses(courseId);
    }
    if (e.target.classList.contains('clickable-topic')) {
        const topicId = e.target.closest('.subject-row').dataset.id;
        renderTopicDetails(topicId);
    }
    if (e.target.classList.contains('clickable-professor')) {
        const professorId = e.target.dataset.id;
        renderProfessorDetails(professorId);
    }
    if (e.target.classList.contains('back-button')) {
        navigateBack();
    }
    if (e.target.classList.contains('breadcrumb-item')) {
        const index = parseInt(e.target.dataset.index);
        historyStack = historyStack.slice(0, index + 1);
        historyStack[index]();
    }
});

renderFacultiesCards();
});