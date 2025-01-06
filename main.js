// main.js
function generateJobInputs() {
    const numJobs = parseInt(document.getElementById('numJobs').value);
    const jobInputsDiv = document.getElementById('jobInputs');
    jobInputsDiv.innerHTML = '';
  
    for (let i = 0; i < numJobs; i++) {
      const jobInput = document.createElement('div');
      jobInput.innerHTML = `
        <h3>Job ${i + 1}</h3>
        <label for="arrival${i}">Arrival Time:</label>
        <input type="number" id="arrival${i}" required>
        <label for="burst${i}">Burst Time:</label>
        <input type="number" id="burst${i}" required>
        <label for="priority${i}">Priority:</label>
        <input type="number" id="priority${i}" required>
      `;
      jobInputsDiv.appendChild(jobInput);
    }
  
    document.getElementById('simulateBtn').style.display = 'block';
  }
  
  function simulate() {
    const numJobs = parseInt(document.getElementById('numJobs').value);
    const jobs = [];
  
    for (let i = 0; i < numJobs; i++) {
      const arrival = parseInt(document.getElementById(`arrival${i}`).value);
      const burst = parseInt(document.getElementById(`burst${i}`).value);
      const priority = parseInt(document.getElementById(`priority${i}`).value);
      jobs.push({ id: i + 1, arrival, burst, priority });
    }
  
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
  
    const algorithms = [
      { name: "First-Come, First-Serve", func: fcfs },
      { name: "Shortest Remaining Job First", func: srjf },
      { name: "Shortest Job First", func: sjf },
      { name: "Priority Non-Preemptive", func: priorityNonPreemptive },
      { name: "Priority Preemptive", func: priorityPreemptive },
      { name: "Round Robin", func: roundRobin }
    ];
  
    algorithms.forEach(algo => {
      const result = algo.func(jobs);
      const algoDiv = document.createElement('div');
      algoDiv.classList.add('result');
      algoDiv.innerHTML = `<h2>${algo.name}</h2>${result}`;
      resultsDiv.appendChild(algoDiv);
    });
  }
  
  function fcfs(jobs) {
    const sortedJobs = [...jobs].sort((a, b) => a.arrival - b.arrival);
    return generateTable(sortedJobs, "FCFS");
  }
  
  function srjf(jobs) {
    // Implement logic for Shortest Remaining Job First (Preemptive)
    return generateTable(jobs, "SRJF");
  }
  
  function sjf(jobs) {
    // Implement logic for Shortest Job First (Non-Preemptive)
    return generateTable(jobs, "SJF");
  }
  
  function priorityNonPreemptive(jobs) {
    // Implement logic for Priority Non-Preemptive
    return generateTable(jobs, "Priority Non-Preemptive");
  }
  
  function priorityPreemptive(jobs) {
    // Implement logic for Priority Preemptive
    return generateTable(jobs, "Priority Preemptive");
  }
  
  function roundRobin(jobs) {
    // Implement logic for Round Robin
    return generateTable(jobs, "Round Robin");
  }
  
  function generateTable(jobs, title) {
    let tableHTML = '<table><tr><th>Job</th><th>Arrival</th><th>Burst</th><th>Priority</th></tr>';
    jobs.forEach(job => {
      tableHTML += `<tr><td>${job.id}</td><td>${job.arrival}</td><td>${job.burst}</td><td>${job.priority}</td></tr>`;
    });
    tableHTML += '</table>';
    return tableHTML;
  }