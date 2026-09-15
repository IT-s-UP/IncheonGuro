package com.itsup.incheonguro.Auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http,
                        JwtDecoder jwtDecoder) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .authorizeHttpRequests(auth -> auth
                                                .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR)
                                                .permitAll()

                                                .requestMatchers(
                                                                "/auth/signup",
                                                                "/auth/login",
                                                                "/api/health",
                                                                "/api/auth/kakao", "/api/auth/kakao/callback",
                                                                "/api/auth/google", "/api/auth/google/callback",
                                                                "/api/auth/me", "/api/auth/logout",
                                                                "/swagger-ui/**",
                                                                "/v3/api-docs/**")
                                                .permitAll()

                                                .requestMatchers(org.springframework.http.HttpMethod.GET, "/festivals",
                                                                "/festivals/**")
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

                                                .requestMatchers("/api/**", "/stamp/**")
                                                .authenticated()

                                                .anyRequest()
                                                .authenticated())

                                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder)));

                return http.build();
        }
}
