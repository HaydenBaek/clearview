package com.clearview.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ClearViewBackendApplication {

    public static void main(String[] args) {


        SpringApplication.run(ClearViewBackendApplication.class, args);
        System.out.println("🔍 DB_URL = " + System.getenv("DB_URL"));
    }
}
