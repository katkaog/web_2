public class PointChecker {
    public static boolean checkHit(double x, double y, double r) {
        double halfR = r / 2.0;
        boolean inCircle = x <= 0 && y >= 0 && Math.pow(x,2) + Math.pow(y,2) <= Math.pow(halfR, 2);
        boolean inRectangle = x >= 0 && x <= halfR && y >= 0 && y <= r;
        boolean inTriangle = x >= 0 && x <= r && y <= 0 && y >= x - r;
        return inCircle || inRectangle || inTriangle;
    }
    public static boolean isValid(double x, double y, int r) {
        boolean yValid = y < 3 && y > -3;
        boolean xValid = x <= 2 && x >= -2 && (x * 2) % 1 == 0;
        boolean rValid = r >= 1 && r <= 5;
        return rValid && yValid && xValid;

    }

    public static boolean isValidGraphPoint(double canvasX, double canvasY, double scale, Integer r) {
        boolean coordinatesValid = Double.isFinite(canvasX) && Double.isFinite(canvasY)
                && canvasX >= 0 && canvasX <= 400 && canvasY >= 0 && canvasY <= 400;
        boolean scaleValid = Double.isFinite(scale) && scale >= 30 && scale <= 150;
        boolean radiusValid = r == null || (r >= 1 && r <= 5);
        return coordinatesValid && scaleValid && radiusValid;
    }
}
