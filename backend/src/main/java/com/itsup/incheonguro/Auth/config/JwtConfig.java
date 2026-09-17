package com.itsup.incheonguro.Auth.config;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtConfig {

    @Value("${jwt.secret:}")
    private String secret;

    @Bean
    public SecretKey jwtSecretKey(org.springframework.core.env.Environment environment) {
        if (environment.matchesProfiles("local")) {
            // Never sign local H2 member IDs with the shared server key.
            byte[] localKey = new byte[32];
            new java.security.SecureRandom().nextBytes(localKey);
            return new SecretKeySpec(localKey, "HmacSHA256");
        }
        if (secret.getBytes(java.nio.charset.StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET must contain at least 32 UTF-8 bytes");
        }

        return new SecretKeySpec(
                secret.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {

        return NimbusJwtEncoder
                .withSecretKey(jwtSecretKey)
                .build();
    }

    @Bean
    public JwtDecoder jwtDecoder(SecretKey jwtSecretKey, com.itsup.incheonguro.Auth.repository.MemberRepository members) {

        var decoder = NimbusJwtDecoder.withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256).build();
        decoder.setJwtValidator(new org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator<>(
            org.springframework.security.oauth2.jwt.JwtValidators.createDefault(),
            token -> {
                try {
                    var member = members.findById(Long.valueOf(token.getSubject()));
                    if (member.isPresent() && member.get().getLoginId().equals(token.getClaimAsString("loginId")))
                        return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.success();
                } catch (NumberFormatException ignored) {}
                return org.springframework.security.oauth2.core.OAuth2TokenValidatorResult.failure(
                    new org.springframework.security.oauth2.core.OAuth2Error("invalid_token", "Account is unavailable", null));
            }));
        return decoder;
    }
}
