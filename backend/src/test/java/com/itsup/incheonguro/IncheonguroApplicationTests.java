package com.itsup.incheonguro;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:context", "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa", "spring.datasource.password=", "jwt.secret=0123456789012345678901234567890123456789012345678901234567890123"})
class IncheonguroApplicationTests {

	@Test
	void contextLoads() {
	}

}
