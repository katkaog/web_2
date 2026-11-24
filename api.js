let requestQueue = Promise.resolve();

export function requestHistory(params = new URLSearchParams()) {
  let query = params.toString();
  let request = requestQueue.then(function() {
    return fetchHistory(query);
  });
  requestQueue = request.catch(function() {});
  return request;
}

async function fetchHistory(query) {
  let url = "/fcgi-bin/check.jar";
  if (query !== "") {
    url += "?" + query;
  }
  let response = await fetch(url, { method: "GET", cache: "no-store" });
  if (!response.ok) {
    throw new Error("Сервер отклонил запрос. HTTP " + response.status);
  }
  let data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("Сервер вернул ответ без истории проверок");
  }
  return data;
}

export function sendPoint(x, y, r) {
  let params = new URLSearchParams();
  params.set("x", x);
  params.set("y", y);
  params.set("r", r);
  return requestHistory(params);
}

export function clearHistory() {
  let params = new URLSearchParams();
  params.set("action", "clear");
  return requestHistory(params);
}

export function sendGraphPoint(point) {
  let params = new URLSearchParams();
  params.set("source", "graph");
  params.set("canvasX", point.canvasX);
  params.set("canvasY", point.canvasY);
  params.set("scale", point.scale);
  if (point.r === null) {
    params.set("r", "");
  } else {
    params.set("r", point.r);
  }
  return requestHistory(params);
}
