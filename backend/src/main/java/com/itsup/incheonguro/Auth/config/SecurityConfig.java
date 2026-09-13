package com.itsup.incheonguro.Auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
                        .dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll()

                        .requestMatchers(
                                "/auth/signup",
                                "/auth/login",
                                "/auth/check-id",
                                "/auth/email/verification-code",
                                "/auth/email/verification-code/confirm",
                                "/api/health",
                                "/api/auth/kakao", "/api/auth/kakao/callback",
                                "/api/auth/google", "/api/auth/google/callback",
                                "/api/auth/me", "/api/auth/logout")
                        .permitAll()

                        .requestMatchers("/uploads/**")
                        .permitAll()

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/festivals", "/festivals/**").permitAll()

                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/region").permitAll()

                        .requestMatchers("/api/**", "/stamp/**")
                        .authenticated()

                        .anyRequest()
                        .authenticated())

                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.decoder(jwtDecoder)));

        return http.build();
    }
}
