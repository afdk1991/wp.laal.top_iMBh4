package com.mixmlaal.ruoyi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {SecurityAutoConfiguration.class})
public class RuoYiApplication {
    public static void main(String[] args) {
        SpringApplication.run(RuoYiApplication.class, args);
        System.out.println("""

            ╔════════════════════════════════════════════════════════════╗
            ║                                                            ║
            ║   MIXMLAAL RuoYi-Vue Admin Started Successfully!         ║
            ║                                                            ║
            ║   📍 Port: 8088                                          ║
            ║   📝 Swagger: http://localhost:8088/swagger-ui.html     ║
            ║   🔧 Docs: http://localhost:8088/doc.html                ║
            ║                                                            ║
            ╚════════════════════════════════════════════════════════════╝
            """);
    }
}
