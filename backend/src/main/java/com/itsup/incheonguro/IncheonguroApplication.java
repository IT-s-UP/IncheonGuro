package com.itsup.incheonguro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class IncheonguroApplication {

	public static void main(String[] args) {
		SpringApplication.run(IncheonguroApplication.class, args);
	}

}
