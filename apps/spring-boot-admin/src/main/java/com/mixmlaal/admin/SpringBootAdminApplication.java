package com.mixmlaal.admin;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SpringBootAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpringBootAdminApplication.class, args);
        System.out.println("""
            
            ╔════════════════════════════════════════════════════════════╗
            ║                                                            ║
            ║   MIXMLAAL Spring Boot Admin System Started Successfully!  ║
            ║                                                            ║
            ║   📍 Port: 8081                                          ║
            ║   📝 API Docs: http://localhost:8081/swagger-ui.html      ║
            ║   🔧 Actuator: http://localhost:8081/actuator            ║
            ║                                                            ║
            ╚════════════════════════════════════════════════════════════╝
            """);
    }
}
