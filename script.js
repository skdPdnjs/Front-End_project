const gradeData = {
    1: [],
    2: [],
    3: []
};

const gradeSummary = {
    1: { totalCredits: 0, totalAttendance: 0, totalAssignment: 0, totalMidterm: 0, totalFinal: 0, totalScore: 0, averageGrade: 'F' },
    2: { totalCredits: 0, totalAttendance: 0, totalAssignment: 0, totalMidterm: 0, totalFinal: 0, totalScore: 0, averageGrade: 'F' },
    3: { totalCredits: 0, totalAttendance: 0, totalAssignment: 0, totalMidterm: 0, totalFinal: 0, totalScore: 0, averageGrade: 'F' }
};

let currentYear = 1;

function changeYear() {
    saveCurrentTable();
    saveCurrentSummary();
    currentYear = parseInt(document.getElementById('yearSelect').value);
    loadTable();
    loadSummary();
    saveAndCalculate();

    // F 학점 색상 
    const tableBody = document.getElementById('gradeTable').getElementsByTagName('tbody')[0];
    const rows = tableBody.rows;

    Array.from(rows).forEach((row) => {
        const gradeCell = row.cells[11];
        const grade = gradeCell.textContent;

        if (grade === 'F') {
            gradeCell.classList.add('grade-f');
        } else {
            gradeCell.classList.remove('grade-f');
        }
    });
}

function saveCurrentTable() {
    const tableBody = document.getElementById('gradeTable').getElementsByTagName('tbody')[0];
    const rows = tableBody.rows;

    // 중복 확인
    const existingSubjects = [];

    gradeData[currentYear] = []; 

    for (const row of rows) {
        const name = row.cells[3].querySelector('input').value.trim(); // 과목명
        const creditSelect = row.cells[4].querySelector('select');
        const credit = parseInt(creditSelect.value) || 0;

        let grade;
        if (credit === 1) {
            const gradeSelect = row.cells[11].querySelector('select');
            grade = gradeSelect ? gradeSelect.value : 'P';
        } else {
            grade = row.cells[11].innerText;
        }

        const duplicate = existingSubjects.find(
            (subject) => subject.name === name && subject.grade !== 'F'
        );

        if (duplicate) {
            alert(`"${name}" 과목은 이미 존재하며 F 학점이 아닙니다. 중복 입력이 불가능합니다.`);
            return; 
        }

        // 중복 확인 배열에 추가
        existingSubjects.push({ name, grade });

        // 과목 데이터 저장
        const rowData = {
            select: row.cells[0].querySelector('input[type="checkbox"]').checked,
            category: row.cells[1].querySelector('select').value,
            requirement: row.cells[2].querySelector('select').value,
            name: name,
            credit: credit,
            grade: grade,
            attendance: credit === 1 ? null : (parseInt(row.cells[5].querySelector('input').value) || 0),
            assignment: credit === 1 ? null : (parseInt(row.cells[6].querySelector('input').value) || 0),
            midterm: credit === 1 ? null : (parseInt(row.cells[7].querySelector('input').value) || 0),
            finalExam: credit === 1 ? null : (parseInt(row.cells[8].querySelector('input').value) || 0),
            total: credit === 1 ? null : (parseInt(row.cells[9].innerText) || 0),
            average: credit === 1 ? null : (parseFloat(row.cells[10].innerText) || 0)
        };

        gradeData[currentYear].push(rowData);
    }
}

function loadTable() {
    const tableBody = document.getElementById('gradeTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = ''; 

    gradeData[currentYear].forEach(rowData => {
        const row = tableBody.insertRow();
        addRowToTable(row, rowData);
    });

    Array.from(tableBody.rows).forEach((row) => {
        const creditSelect = row.cells[4]?.querySelector('select');
        const attendanceInput = row.cells[5]?.querySelector('input');
        const assignmentInput = row.cells[6]?.querySelector('input');
        const midtermInput = row.cells[7]?.querySelector('input');
        const finalExamInput = row.cells[8]?.querySelector('input');

        if (creditSelect) enforceValidRange(creditSelect);
        if (attendanceInput) enforceValidRange(attendanceInput);
        if (assignmentInput) enforceValidRange(assignmentInput);
        if (midtermInput) enforceValidRange(midtermInput);
        if (finalExamInput) enforceValidRange(finalExamInput);
    });
}

function saveCurrentSummary() {
    const summary = gradeSummary[currentYear];
    summary.totalCredits = parseInt(document.getElementById('totalCredits').textContent) || 0;
    summary.totalAttendance = parseInt(document.getElementById('totalAttendance').textContent) || 0;
    summary.totalAssignment = parseInt(document.getElementById('totalAssignment').textContent) || 0;
    summary.totalMidterm = parseInt(document.getElementById('totalMidterm').textContent) || 0;
    summary.totalFinal = parseInt(document.getElementById('totalFinal').textContent) || 0;
    summary.totalScore = parseFloat(document.getElementById('totalScore').textContent) || 0;
    summary.average = parseFloat(document.getElementById('totalAverage').textContent) || 0;
    summary.averageGrade = document.getElementById('averageGrade').textContent || 'F';
}

function loadSummary() {
    const summary = gradeSummary[currentYear];
    document.getElementById('totalCredits').textContent = summary.totalCredits;
    document.getElementById('totalAttendance').textContent = summary.totalAttendance;
    document.getElementById('totalAssignment').textContent = summary.totalAssignment;
    document.getElementById('totalMidterm').textContent = summary.totalMidterm;
    document.getElementById('totalFinal').textContent = summary.totalFinal;
    document.getElementById('totalScore').textContent = summary.totalScore;
    document.getElementById('totalAverage').textContent = summary.average.toFixed(2);
    document.getElementById('averageGrade').textContent = summary.averageGrade;
}

function addRow() {
    const tableBody = document.getElementById('gradeTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();

    // 기본 데이터 설정
    const rowData = { 
        select: false, 
        category: '교양', 
        requirement: '필수', 
        name: '', 
        credit: 1, 
        grade: 'P', 
        attendance: null, 
        assignment: null, 
        midterm: null, 
        finalExam: null, 
        total: null, 
        average: null 
    };
    addRowToTable(newRow, rowData);
    gradeData[currentYear].push(rowData);
}


function saveAndCalculate() {
    saveCurrentTable();
    sortGradeData();
    loadTable(); 
    convertGradeToText(); // 1학점 성적을 텍스트로 
    calculate();
}

function sortGradeData() {
    gradeData[currentYear].sort((a, b) => {
        if (a.category !== b.category) {
            return a.category.localeCompare(b.category, 'ko'); 
        }
        if (a.requirement !== b.requirement) {
            return a.requirement === '필수' ? -1 : 1; 
        }
        return a.name.localeCompare(b.name, 'ko'); 
    });
}


function deleteRow() {
    const tableBody = document.getElementById('gradeTable').getElementsByTagName('tbody')[0];
    const rows = Array.from(tableBody.rows); 

    // 선택되지 않은 행만 남기기
    const newGradeData = [];
    rows.forEach((row, index) => {
        const checkbox = row.cells[0].querySelector('input[type="checkbox"]');
        if (!checkbox.checked) {
            // 선택되지 않은 행은 데이터로 저장
            const credit = parseInt(row.cells[4].querySelector('select').value) || 0;
            const rowData = {
                select: false,
                category: row.cells[1].querySelector('select').value,
                requirement: row.cells[2].querySelector('select').value,
                name: row.cells[3].querySelector('input').value,
                credit: credit,
                grade: credit === 1 ? row.cells[11].innerText : row.cells[11].textContent,
                attendance: credit === 1 ? null : (parseInt(row.cells[5].querySelector('input').value) || 0),
                assignment: credit === 1 ? null : (parseInt(row.cells[6].querySelector('input').value) || 0),
                midterm: credit === 1 ? null : (parseInt(row.cells[7].querySelector('input').value) || 0),
                finalExam: credit === 1 ? null : (parseInt(row.cells[8].querySelector('input').value) || 0),
                total: credit === 1 ? null : (parseInt(row.cells[9].textContent) || 0),
                average: credit === 1 ? null : (parseFloat(row.cells[10].textContent) || 0)
            };
            newGradeData.push(rowData);
        }
    });
    gradeData[currentYear] = newGradeData;

    loadTable();
    calculate();
}

function addRowToTable(row, rowData) {
    const isOneCredit = rowData.credit === 1;
    row.innerHTML = `
        <td><input type="checkbox" ${rowData.select ? 'checked' : ''}></td>
        <td>
            <select>
                <option value="교양" ${rowData.category === '교양' ? 'selected' : ''}>교양</option>
                <option value="전공" ${rowData.category === '전공' ? 'selected' : ''}>전공</option>
            </select>
        </td>
        <td>
            <select>
                <option value="필수" ${rowData.requirement === '필수' ? 'selected' : ''}>필수</option>
                <option value="선택" ${rowData.requirement === '선택' ? 'selected' : ''}>선택</option>
            </select>
        </td>
        <td><input type="text" value="${rowData.name}"></td>
        <td>
            <select onchange="updateRow(this)">
                <option value="1" ${rowData.credit == 1 ? 'selected' : ''}>1</option>
                <option value="2" ${rowData.credit == 2 ? 'selected' : ''}>2</option>
                <option value="3" ${rowData.credit == 3 ? 'selected' : ''}>3</option>
            </select>
        </td>
        <td>${isOneCredit ? '-' : `<input type="number" min="0" max="20" value="${rowData.attendance || 0}" oninput="enforceValidRange(this)">`}</td>
        <td>${isOneCredit ? '-' : `<input type="number" min="0" max="20" value="${rowData.assignment || 0}" oninput="enforceValidRange(this)">`}</td>
        <td>${isOneCredit ? '-' : `<input type="number" min="0" max="30" value="${rowData.midterm || 0}" oninput="enforceValidRange(this)">`}</td>
        <td>${isOneCredit ? '-' : `<input type="number" min="0" max="30" value="${rowData.finalExam || 0}" oninput="enforceValidRange(this)">`}</td>
        <td>${isOneCredit ? '-' : (rowData.total || 0)}</td>
        <td>${isOneCredit ? '-' : ''}</td>
        <td>
            ${isOneCredit ? `
                <select>
                    <option value="P" ${rowData.grade === 'P' ? 'selected' : ''}>P</option>
                    <option value="NP" ${rowData.grade === 'NP' ? 'selected' : ''}>NP</option>
                </select>
            ` : `
                ${rowData.grade || 'F'}
            `}
        </td>
    `;
}
    if (!isOneCredit) {
        const attendanceInput = row.cells[5].querySelector('input');
        const assignmentInput = row.cells[6].querySelector('input');
        const midtermInput = row.cells[7].querySelector('input');
        const finalExamInput = row.cells[8].querySelector('input');

        attendanceInput.addEventListener('input', () => enforceValidRange(attendanceInput));
        assignmentInput.addEventListener('input', () => enforceValidRange(assignmentInput));
        midtermInput.addEventListener('input', () => enforceValidRange(midtermInput));
        finalExamInput.addEventListener('input', () => enforceValidRange(finalExamInput));
    }

function enforceValidRange(inputElement) {
    const min = parseInt(inputElement.min, 10);
    const max = parseInt(inputElement.max, 10);
    const value = parseInt(inputElement.value, 10);

    // 값 범위
    if (value < min) {
        inputElement.value = min;
    } else if (value > max) {
        inputElement.value = max;
    }
}

    
    if (!isOneCredit) {
        const attendanceInput = row.cells[5].querySelector('input');
        const assignmentInput = row.cells[6].querySelector('input');
        const midtermInput = row.cells[7].querySelector('input');
        const finalExamInput = row.cells[8].querySelector('input');

        attendanceInput.addEventListener('input', () => {
            validateInput(attendanceInput, 0, 20);
            calculate();
        });

        assignmentInput.addEventListener('input', () => {
            validateInput(assignmentInput, 0, 20);
            calculate();
        });

        midtermInput.addEventListener('input', () => {
            validateInput(midtermInput, 0, 30);
            calculate();
        });

        finalExamInput.addEventListener('input', () => {
            validateInput(finalExamInput, 0, 30);
            calculate();
        });
    }

function validateInput(inputElement, min, max) {
    let value = parseInt(inputElement.value);
    if (isNaN(value)) {
        inputElement.value = min;
        inputElement.classList.add('invalid-input');
    } else if (value < min) {
        inputElement.value = min;
        inputElement.classList.add('invalid-input');
    } else if (value > max) {
        inputElement.value = max;
        inputElement.classList.add('invalid-input');
    } else {
        inputElement.value = value;
        inputElement.classList.remove('invalid-input');
    }
}
function updateRow(selectElement) {
    const row = selectElement.closest('tr');
    const credit = parseInt(selectElement.value);
    const gradeCell = row.cells[11];

    if (credit === 1) {
        row.cells[5].innerHTML = '-';
        row.cells[6].innerHTML = '-';
        row.cells[7].innerHTML = '-';
        row.cells[8].innerHTML = '-';
        row.cells[9].innerText = '-';
        row.cells[10].innerText = '-';

        gradeCell.innerHTML = `
            <select>
                <option value="P" ${gradeCell.innerText === 'P' ? 'selected' : ''}>P</option>
                <option value="NP" ${gradeCell.innerText === 'NP' ? 'selected' : ''}>NP</option>
            </select>
        `;
    } else {
        row.cells[5].innerHTML = `<input type="number" min="0" max="20" value="0" oninput="enforceValidRange(this)">`;
        row.cells[6].innerHTML = `<input type="number" min="0" max="20" value="0" oninput="enforceValidRange(this)">`;
        row.cells[7].innerHTML = `<input type="number" min="0" max="30" value="0" oninput="enforceValidRange(this)">`;
        row.cells[8].innerHTML = `<input type="number" min="0" max="30" value="0" oninput="enforceValidRange(this)">`;
        row.cells[9].innerText = '0';
        row.cells[10].innerText = '';
        gradeCell.innerText = 'F';
    }
}
function calculate() {
    const rows = document.getElementById('gradeTable').getElementsByTagName('tbody')[0].rows;
    let totalCredits = 0, totalAttendance = 0, totalAssignment = 0, totalMidterm = 0, totalFinal = 0, totalScore = 0, subjectCount = 0;

    for (const row of rows) {
        const credit = parseInt(row.cells[4].querySelector('select').value) || 0;

        if (credit === 1) {
            const grade = row.cells[11].innerText;
            row.cells[10].innerText = '';
        } else {
            const attendanceInput = row.cells[5].querySelector('input');
            const assignmentInput = row.cells[6].querySelector('input');
            const midtermInput = row.cells[7].querySelector('input');
            const finalExamInput = row.cells[8].querySelector('input');

            const attendance = attendanceInput ? (parseInt(attendanceInput.value) || 0) : 0;
            const assignment = assignmentInput ? (parseInt(assignmentInput.value) || 0) : 0;
            const midterm = midtermInput ? (parseInt(midtermInput.value) || 0) : 0;
            const finalExam = finalExamInput ? (parseInt(finalExamInput.value) || 0) : 0;

            const total = attendance + assignment + midterm + finalExam;
            row.cells[9].innerText = total;

            let grade = 'F';
            if (total >= 95) grade = 'A+';
            else if (total >= 90) grade = 'A0';
            else if (total >= 85) grade = 'B+';
            else if (total >= 80) grade = 'B0';
            else if (total >= 75) grade = 'C+';
            else if (total >= 70) grade = 'C0';
            else if (total >= 65) grade = 'D+';
            else if (total >= 60) grade = 'D0';

            row.cells[11].innerText = grade;

            if (grade === 'F') {
                row.cells[11].classList.add('grade-f');
                row.cells[10].innerText = '-'; 
                continue; // F학점인 과목은 합계 계산에서 제외
            } else {
                row.cells[11].classList.remove('grade-f');
                row.cells[10].innerText = '';
                
                // F학점이 아닌 과목만 합계에 포함
                totalCredits += credit;
                totalAttendance += attendance;
                totalAssignment += assignment;
                totalMidterm += midterm;
                totalFinal += finalExam;
                totalScore += total;
                subjectCount++;
            }
        }
    }
    const summary = gradeSummary[currentYear];
    summary.totalCredits = totalCredits;
    summary.totalAttendance = totalAttendance;
    summary.totalAssignment = totalAssignment;
    summary.totalMidterm = totalMidterm;
    summary.totalFinal = totalFinal;
    summary.totalScore = totalScore;
    summary.average = subjectCount > 0 ? totalScore / subjectCount : 0;

    document.getElementById('totalCredits').textContent = totalCredits;
    document.getElementById('totalAttendance').textContent = totalAttendance;
    document.getElementById('totalAssignment').textContent = totalAssignment;
    document.getElementById('totalMidterm').textContent = totalMidterm;
    document.getElementById('totalFinal').textContent = totalFinal;
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('totalAverage').textContent = summary.average.toFixed(2);

    const overallGrade = getOverallGrade(summary.average);
    const averageGradeElement = document.getElementById('averageGrade');
    averageGradeElement.textContent = overallGrade;

    if (overallGrade === 'F') {
        averageGradeElement.classList.add('grade-f');
    } else {
        averageGradeElement.classList.remove('grade-f');
    }
}

function getOverallGrade(average) {
    if (average >= 95) return 'A+';
    if (average >= 90) return 'A0';
    if (average >= 85) return 'B+';
    if (average >= 80) return 'B0';
    if (average >= 75) return 'C+';
    if (average >= 70) return 'C0';
    if (average >= 65) return 'D+';
    if (average >= 60) return 'D0';
    return 'F';
}
document.addEventListener('DOMContentLoaded', function () {
    const rowData = { 
        select: false, 
        category: '교양', 
        requirement: '필수', 
        name: '', 
        credit: 1, 
        grade: 'P', 
        attendance: null, 
        assignment: null, 
        midterm: null, 
        finalExam: null, 
        total: null, 
        average: null 
    };

    const tableBody = document.getElementById('gradeTable').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    addRowToTable(newRow, rowData);

    loadTable();
    loadSummary();
});

function enforceValidRange(inputElement) {
    const min = parseInt(inputElement.min, 10);
    const max = parseInt(inputElement.max, 10);
    const value = parseInt(inputElement.value, 10);

    if (isNaN(value) || value < min || value > max) {
        alert(`입력 값은 ${min}에서 ${max} 사이여야 합니다.`);
        inputElement.value = ""; 
    }
}

function enforceValidRange(inputElement) {
    const min = parseInt(inputElement.min, 10);
    const max = parseInt(inputElement.max, 10);
    const value = parseInt(inputElement.value, 10);

    if (value < min || value > max) {
        alert(`입력 값은 ${min}에서 ${max} 사이여야 합니다.`);
        inputElement.value = ""; 
    }
}

function convertGradeToText() {
    const tableBody = document.getElementById('gradeTable').getElementsByTagName('tbody')[0];
    const rows = tableBody.rows;

    Array.from(rows).forEach((row) => {
        const credit = parseInt(row.cells[4].querySelector('select').value);

        if (credit === 1) {
            const gradeCell = row.cells[11];
            const gradeSelect = gradeCell.querySelector('select');

            if (gradeSelect) {
                const gradeText = gradeSelect.value; // 현재 선택된 값(P/NP)
                gradeCell.textContent = gradeText; // 텍스트로 변환
            }
        }
    });
}
