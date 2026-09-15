package com.itsup.incheonguro.Auth.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        JwtDecoder jwtDecoder) throws Exception {

                http
                                // CORS
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                                // CSRF
                                .csrf(csrf -> csrf.disable())

                                // JWT 방식이므로 세션 사용하지 않음
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(
                                                                SessionCreationPolicy.STATELESS))

                                // URL별 접근 권한
                                .authorizeHttpRequests(auth -> auth
                                                // feature/place-guide-api 쪽에 있던 항목
                                                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR)
                                                .permitAll()

                                                // 회원가입 / 로그인
                                                .requestMatchers(
                                                                "/auth/signup",
                                                                "/auth/login",
                                                                "/auth/check-id",
                                                                "/auth/email/verification-code",
                                                                "/auth/email/verification-code/confirm",
                                                                "/api/health",
                                                                "/api/auth/kakao", "/api/auth/kakao/callback",
                                                                "/api/auth/google", "/api/auth/google/callback",
                                                                "/api/auth/me", "/api/auth/logout",
                                                                "/swagger-ui/**", "/v3/api-docs/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.POST, "/api/contact").permitAll()

                                                .requestMatchers(HttpMethod.GET, "/festivals",
                                                                "/festivals/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                "/festivals/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.GET,
                                                                "/api/region")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/courseguide", "/api/courseguide/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/placeguide", "/api/placeguide/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/course-routes", "/api/course-routes/**")
                                                .permitAll()

                                                .requestMatchers(
                                                                HttpMethod.OPTIONS,
                                                                "/**")
                                                .permitAll()

                                                .requestMatchers("/api/**", "/stamp/**")
                                                .authenticated()

                                                .anyRequest()
                                                .authenticated())

                                // JWT 인증
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(jwt -> jwt.decoder(jwtDecoder)));

                return http.build();
        }

        /**
         * CORS 설정
         */
        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                // React 개발 서버
                configuration.setAllowedOrigins(
                                List.of("http://localhost:5173"));

                // 허용할 HTTP Method
                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "DELETE",
                                                "PATCH",
                                                "OPTIONS"));

                // 허용할 Header
                configuration.setAllowedHeaders(
                                List.of("*"));

                // 인증 정보 포함 허용
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}
