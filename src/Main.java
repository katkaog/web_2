import com.fastcgi.FCGIInterface;

public class Main {
    public static void main(String[] args) {
        FCGIInterface fcgi = new FCGIInterface();
        RequestHandler handler = new RequestHandler();
        while (fcgi.FCGIaccept() >= 0) {
            handler.handleRequest();
        }
    }
}
