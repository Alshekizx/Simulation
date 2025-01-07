function generateJobInputs() {
  const numJobs = parseInt(document.getElementById("numJobs").value);
  const jobInputsDiv = document.getElementById("jobInputs");
  jobInputsDiv.innerHTML = "";

  for (let i = 0; i < numJobs; i++) {
    const jobInput = document.createElement("div");
    jobInput.innerHTML = `
      <h3>Job ${i + 1}</h3>
      <label for="arrival${i}">Arrival Time:</label>
      <input type="number" id="arrival${i}" min="0" required>
      <label for="burst${i}">Burst Time:</label>
      <input type="number" id="burst${i}" min="1" required>
      <label for="priority${i}">Priority:</label>
      <input type="number" id="priority${i}" min="1" required>
    `;
    jobInputsDiv.appendChild(jobInput);
  }

  document.getElementById("simulateBtn").style.display = "block";
}

function simulate() {
  const numJobs = parseInt(document.getElementById("numJobs").value);
  const jobs = [];

  for (let i = 0; i < numJobs; i++) {
    const arrival = parseInt(document.getElementById(`arrival${i}`).value);
    const burst = parseInt(document.getElementById(`burst${i}`).value);
    const priority = parseInt(document.getElementById(`priority${i}`).value);

    if (isNaN(arrival) || isNaN(burst) || isNaN(priority)) {
      alert(`Please enter valid numbers for Job ${i + 1}`);
      return;
    }

    jobs.push({ id: i + 1, arrival, burst, priority });
  }

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const algorithms = [
    { name: "Priority Non-Preemptive", func: priorityNonPreemptive },
    { name: "Priority Preemptive", func: priorityPreemptive },
    { name: "Round Robin", func: roundRobin }
  ];

  algorithms.forEach((algo) => {
    const result = algo.func([...jobs]); // Pass a copy to avoid mutation
    const algoDiv = document.createElement("div");
    algoDiv.classList.add("result");
    algoDiv.innerHTML = result;
    resultsDiv.appendChild(algoDiv);
  });
}

function priorityNonPreemptive(jobs) {
  jobs.sort((a, b) => a.arrival - b.arrival || a.priority - b.priority);

  const n = jobs.length;
  const completionTime = Array(n).fill(0);
  const turnaroundTime = Array(n).fill(0);
  const waitingTime = Array(n).fill(0);
  const isCompleted = Array(n).fill(false);
  let currentTime = 0;
  let completedJobs = 0;

  while (completedJobs < n) {
    let highestPriorityJob = -1;

    for (let i = 0; i < n; i++) {
      if (!isCompleted[i] && jobs[i].arrival <= currentTime) {
        if (
          highestPriorityJob === -1 ||
          jobs[i].priority < jobs[highestPriorityJob].priority
        ) {
          highestPriorityJob = i;
        }
      }
    }

    if (highestPriorityJob !== -1) {
      currentTime = Math.max(currentTime, jobs[highestPriorityJob].arrival) + jobs[highestPriorityJob].burst;
      completionTime[highestPriorityJob] = currentTime;
      turnaroundTime[highestPriorityJob] = completionTime[highestPriorityJob] - jobs[highestPriorityJob].arrival;
      waitingTime[highestPriorityJob] = turnaroundTime[highestPriorityJob] - jobs[highestPriorityJob].burst;

      isCompleted[highestPriorityJob] = true;
      completedJobs++;
    } else {
      currentTime++;
    }
  }

  return generateTableWithMetrics(jobs, completionTime, turnaroundTime, waitingTime, "Priority Non-Preemptive");
}

function priorityPreemptive(jobs) {
  const n = jobs.length;
  let currentTime = 0;
  let completedJobs = 0;
  const remainingBurst = jobs.map((job) => job.burst);
  const completionTime = Array(n).fill(0);
  const turnaroundTime = Array(n).fill(0);
  const waitingTime = Array(n).fill(0);

  while (completedJobs < n) {
    let highestPriorityJob = -1;

    for (let i = 0; i < n; i++) {
      if (
        remainingBurst[i] > 0 &&
        jobs[i].arrival <= currentTime &&
        (highestPriorityJob === -1 || jobs[i].priority < jobs[highestPriorityJob].priority)
      ) {
        highestPriorityJob = i;
      }
    }

    if (highestPriorityJob !== -1) {
      remainingBurst[highestPriorityJob]--;
      currentTime++;

      if (remainingBurst[highestPriorityJob] === 0) {
        completionTime[highestPriorityJob] = currentTime;
        turnaroundTime[highestPriorityJob] = completionTime[highestPriorityJob] - jobs[highestPriorityJob].arrival;
        waitingTime[highestPriorityJob] = turnaroundTime[highestPriorityJob] - jobs[highestPriorityJob].burst;

        completedJobs++;
      }
    } else {
      currentTime++;
    }
  }

  return generateTableWithMetrics(jobs, completionTime, turnaroundTime, waitingTime, "Priority Preemptive");
}

function roundRobin(jobs, quantum = 2) {
  const n = jobs.length;
  const remainingBurst = jobs.map((job) => job.burst);
  const completionTime = Array(n).fill(0);
  const turnaroundTime = Array(n).fill(0);
  const waitingTime = Array(n).fill(0);
  const readyQueue = [];
  let currentTime = 0;
  let completedJobs = 0;

  while (completedJobs < n) {
    jobs.forEach((job, i) => {
      if (job.arrival <= currentTime && !readyQueue.includes(i) && remainingBurst[i] > 0) {
        readyQueue.push(i);
      }
    });

    if (readyQueue.length > 0) {
      const currentJob = readyQueue.shift();
      const executionTime = Math.min(quantum, remainingBurst[currentJob]);
      currentTime += executionTime;
      remainingBurst[currentJob] -= executionTime;

      if (remainingBurst[currentJob] === 0) {
        completionTime[currentJob] = currentTime;
        completedJobs++;
      } else {
        readyQueue.push(currentJob);
      }
    } else {
      currentTime++;
    }
  }

  for (let i = 0; i < n; i++) {
    turnaroundTime[i] = completionTime[i] - jobs[i].arrival;
    waitingTime[i] = turnaroundTime[i] - jobs[i].burst;
  }

  return generateTableWithMetrics(jobs, completionTime, turnaroundTime, waitingTime, "Round Robin");
}

function generateTable(jobs, title) {
  let tableHTML = `<h3>${title}</h3>`;
  tableHTML += `
    <table>
      <tr>
        <th>Job</th>
        <th>Arrival Time</th>
        <th>Burst Time</th>
        <th>Priority</th>
      </tr>`;
  jobs.forEach(job => {
    tableHTML += `
      <tr>
        <td>${job.id}</td>
        <td>${job.arrival}</td>
        <td>${job.burst}</td>
        <td>${job.priority}</td>
      </tr>`;
  });
  tableHTML += `</table>`;
  return tableHTML;
}

function generateTableWithMetrics(jobs, completionTime, turnaroundTime, waitingTime, title) {
  const totalTAT = turnaroundTime.reduce((sum, tat) => sum + tat, 0);
  const totalWT = waitingTime.reduce((sum, wt) => sum + wt, 0);
  const avgTAT = (totalTAT / jobs.length).toFixed(2);
  const avgWT = (totalWT / jobs.length).toFixed(2);

  let tableHTML = `<h3>${title}</h3>`;
  tableHTML += `
    <table>
      <tr>
        <th>Job</th>
        <th>Arrival Time</th>
        <th>Burst Time</th>
        <th>Priority</th>
        <th>Completion Time</th>
        <th>Turnaround Time</th>
        <th>Waiting Time</th>
      </tr>`;
  jobs.forEach((job, index) => {
    tableHTML += `
      <tr>
        <td>${job.id}</td>
        <td>${job.arrival}</td>
        <td>${job.burst}</td>
        <td>${job.priority}</td>
        <td>${completionTime[index]}</td>
        <td>${turnaroundTime[index]}</td>
        <td>${waitingTime[index]}</td>
      </tr>`;
  });
  tableHTML += `
      <tr>
        <td colspan="5" style="font-weight: bold;">Averages</td>
        <td style="font-weight: bold;">${avgTAT}</td>
        <td style="font-weight: bold;">${avgWT}</td>
      </tr>
    </table>`;
  return tableHTML;
}