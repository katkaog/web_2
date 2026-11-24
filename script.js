import { initializeGraph, setRadius, redrawCanvas } from "./graph.js";
import { requestHistory, sendPoint, sendGraphPoint, clearHistory } from "./api.js";

let form = document.getElementById("points");
let R = null;
if (form.elements.r.value !== "") {
  R = Number(form.elements.r.value);
}
let yInput = document.getElementById("y");
let rInputs = form.elements.r;
let errorMessage = document.getElementById("error");
let clearButton = document.getElementById("clear");
let results = [];
let submitButton = form.querySelector('button[type="submit"]');
let pendingRequests = 0;
let resultTable = document.getElementById("result");
function addResultToTable(pointResult) {
  let row = resultTable.insertRow(0);
  let xCell = row.insertCell();
  xCell.textContent = pointResult.x.toLocaleString("ru-RU", {
    maximumFractionDigits: 2
  });
  let yCell = row.insertCell();
  yCell.textContent = pointResult.y.toLocaleString("ru-RU", {
    maximumFractionDigits: 2
  });
  let rCell = row.insertCell();
  if (pointResult.r !== null) {
    rCell.textContent = pointResult.r;
  }
  let hitCell = row.insertCell();
  if (pointResult.hit) {
    hitCell.textContent = "Попадание";
  } else {
    hitCell.textContent = "Промах";
  }
  let timeCell = row.insertCell();
  timeCell.textContent = new Date(pointResult.timestamp).toLocaleString("ru-RU");
  let executionCell = row.insertCell();
  executionCell.textContent = (pointResult.executionTime / 1000000).toLocaleString("ru-RU", {
    maximumFractionDigits: 2
  });
}
function renderResults() {
  resultTable.textContent = "";
  results.forEach(addResultToTable);
  redrawCanvas(results);
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function setRequestPending(pending) {
  if (pending) {
    pendingRequests = pendingRequests + 1;
  } else {
    pendingRequests = pendingRequests - 1;
  }
  submitButton.disabled = pendingRequests > 0;
  clearButton.disabled = pendingRequests > 0;
}

clearButton.addEventListener("click", async function() {
  if (pendingRequests > 0) {
    return;
  }
  errorMessage.hidden = true;
  setRequestPending(true);
  try {
    results = await clearHistory();
    renderResults();
  } catch (error) {
    showError(error.message);
  } finally {
    setRequestPending(false);
  }
});

Array.from(rInputs).forEach(function(input) {
  input.addEventListener("change", function() {
    R = Number(input.value);
    setRadius(R);
  });
});

form.addEventListener("submit", async function(event) {
  event.preventDefault();
  if (pendingRequests > 0) {
    return;
  }
  errorMessage.hidden = true;
  let yText = yInput.value.trim();
  if (yText === "") {
    showError("Введите Y");
    return;
  }
  if (!/^-?\d+([.,]\d+)?$/.test(yText)) {
    showError("Y должен быть числом");
    return;
  }
  let normalizedY = yText.replace(",", ".");
  let y = Number(normalizedY);
  if (!(y > -3 && y < 3)) {
    showError("Y должен быть больше -3 и меньше 3");
    return;
  }
  if (form.elements.x.value === "") {
    showError("Выберите X");
    return;
  }
  let x = Number(form.elements.x.value);
  if (R === null) {
    showError("Выберите R");
    return;
  }
  setRequestPending(true);
  try {
    results = await sendPoint(x, y, R);
    renderResults();
  } catch (error) {
    showError(error.message);
  } finally {
    setRequestPending(false);
  }
});

async function loadHistory() {
  setRequestPending(true);
  try {
    results = await requestHistory();
    renderResults();
  } catch (error) {
    showError(error.message);
  } finally {
    setRequestPending(false);
  }
}

initializeGraph(document.getElementById("graph"), R, async function(pointResult) {
  errorMessage.hidden = true;
  setRequestPending(true);
  try {
    results = await sendGraphPoint(pointResult);
    errorMessage.hidden = true;
    renderResults();
  } catch (error) {
    showError(error.message);
  } finally {
    setRequestPending(false);
  }
});
renderResults();
loadHistory();
