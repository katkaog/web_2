import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;

public class RequestHandler {
    private final ArrayList<String> history = new ArrayList<>();

    public void handleRequest() {
        long startTime = System.nanoTime();
        String method = System.getProperty("REQUEST_METHOD", "");
        if (!method.equals("GET")) {
            sendResponse("405 Method Not Allowed", "{}");
            return;
        }
        try {
            String query = System.getProperty("QUERY_STRING", "");
            if (query.isEmpty()) {
                sendHistory();
                return;
            }
            String[] parts = query.split("&");
            HashMap<String, String> parameters = new HashMap<String, String>();
            for(String part : parts) {
                String[] pair = part.split("=", 2);
                if (pair.length != 2) {
                    throw new IllegalArgumentException();
                }
                String value = URLDecoder.decode(pair[1], StandardCharsets.UTF_8);
                String name = URLDecoder.decode(pair[0], StandardCharsets.UTF_8);
                parameters.put(name, value);
            }
            if ("clear".equals(parameters.get("action"))) {
                history.clear();
                sendResponse("200 OK", "[]");
                return;
            }
            if ("graph".equals(parameters.get("source"))) {
                addGraphPoint(parameters, startTime);
                sendHistory();
                return;
            }
            String yText = parameters.get("y");
            String xText = parameters.get("x");
            String rText = parameters.get("r");
            if (yText == null || xText == null || rText == null) {
                sendResponse("400 Bad Request", "{}");
                return;
            }
            double y = Double.parseDouble(yText);
            double x = Double.parseDouble(xText);
            int r = Integer.parseInt(rText);
            if (PointChecker.isValid(x, y, r)) {
                boolean hit = PointChecker.checkHit(x, y, r);
                long executionTime = System.nanoTime() - startTime;
                long timestamp = System.currentTimeMillis();
                String body = """
                        {
                        "x": %s,
                        "y": %s,
                        "r": %s,
                        "hit": %s,
                        "timestamp": %s,
                        "executionTime": %s
                        }
                        """.formatted(x, y, r, hit, timestamp, executionTime);
                history.add(body);
                sendHistory();
            } else {
                sendResponse("400 Bad Request", "{}");
            }
        } catch (IllegalArgumentException e) {
            sendResponse("400 Bad Request", "{}");
        }
    }

    private void addGraphPoint(HashMap<String, String> parameters, long startTime) {
        String canvasXText = parameters.get("canvasX");
        String canvasYText = parameters.get("canvasY");
        String scaleText = parameters.get("scale");
        String rText = parameters.get("r");
        if (canvasXText == null || canvasYText == null
                || scaleText == null || rText == null) {
            throw new IllegalArgumentException();
        }

        double canvasX = Double.parseDouble(canvasXText);
        double canvasY = Double.parseDouble(canvasYText);
        double scale = Double.parseDouble(scaleText);
        Integer r;
        if (rText.isEmpty()) {
            r = null;
        } else {
            r = Integer.valueOf(rText);
        }
        if (!PointChecker.isValidGraphPoint(canvasX, canvasY, scale, r)) {
            throw new IllegalArgumentException();
        }

        double offsetX = canvasX - 200;
        double offsetY = 200 - canvasY;
        double pixelsPerUnit;
        if (r == null) {
            pixelsPerUnit = 30;
        } else {
            pixelsPerUnit = scale / r;
        }
        double x = offsetX / pixelsPerUnit;
        double y = offsetY / pixelsPerUnit;
        boolean hit = PointChecker.checkHit(offsetX, offsetY, scale);
        boolean movesWithGraph = r != null;
        Double relativeX;
        Double relativeY;
        if (movesWithGraph) {
            relativeX = offsetX / scale;
            relativeY = offsetY / scale;
        } else {
            relativeX = null;
            relativeY = null;
        }
        long executionTime = System.nanoTime() - startTime;
        long timestamp = System.currentTimeMillis();
        String body = """
                {
                "x": %s,
                "y": %s,
                "r": %s,
                "hit": %s,
                "timestamp": %s,
                "executionTime": %s,
                "source": "graph",
                "movesWithGraph": %s,
                "relativeX": %s,
                "relativeY": %s,
                "canvasX": %s,
                "canvasY": %s
                }
                """.formatted(x, y, r, hit, timestamp, executionTime, movesWithGraph,
                relativeX, relativeY, canvasX, canvasY);
        history.add(body);
    }

    private void sendHistory() {
        String response = "[" + String.join(",", history) + "]";
        sendResponse("200 OK", response);
    }

    private static void sendResponse(String status, String body) {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        System.out.print("HTTP/1.1 " + status + "\r\n");
        System.out.print("Content-Type: application/json; charset=UTF-8\r\n");
        System.out.print("Cache-Control: no-store\r\n");
        System.out.print("Content-Length: " + bytes.length + "\r\n");
        if (status.equals("405 Method Not Allowed")) {
            System.out.print("Allow: GET\r\n");
        }
        System.out.print("\r\n");
        System.out.writeBytes(bytes);
        System.out.flush();
    }
}
