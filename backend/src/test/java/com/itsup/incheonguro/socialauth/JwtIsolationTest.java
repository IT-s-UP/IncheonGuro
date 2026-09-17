package com.itsup.incheonguro.socialauth;

import com.itsup.incheonguro.Auth.config.JwtConfig;
import java.time.Instant;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.test.util.ReflectionTestUtils;
import static org.junit.jupiter.api.Assertions.*;

class JwtIsolationTest {
    private JwtConfig config(String secret) {
        var config = new JwtConfig();
        ReflectionTestUtils.setField(config, "secret", secret);
        return config;
    }
    @Test void sharedAndLocalTokensAreRejectedAcrossDatabases() {
        var config = config("0123456789012345678901234567890123456789012345678901234567890123");
        var shared = config.jwtSecretKey(new MockEnvironment());
        var local = config.jwtSecretKey(new MockEnvironment().withProperty("spring.profiles.active", "local"));
        var nextLocal = config.jwtSecretKey(new MockEnvironment().withProperty("spring.profiles.active", "local"));
        assertFalse(Arrays.equals(local.getEncoded(), shared.getEncoded()));
        assertFalse(Arrays.equals(local.getEncoded(), nextLocal.getEncoded()));
        var claims = JwtClaimsSet.builder().subject("1").claim("loginId", "same-id-different-db")
                .issuedAt(Instant.now()).expiresAt(Instant.now().plusSeconds(60)).build();
        var parameters = JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims);
        var members = org.mockito.Mockito.mock(com.itsup.incheonguro.Auth.repository.MemberRepository.class);
        var member = new com.itsup.incheonguro.Auth.entity.Member("same-id-different-db", "encoded", null, "Test", null, null, null, "Test", null);
        org.mockito.Mockito.when(members.findById(1L)).thenReturn(java.util.Optional.of(member));
        var sharedToken = config.jwtEncoder(shared).encode(parameters).getTokenValue();
        var localToken = config.jwtEncoder(local).encode(parameters).getTokenValue();
        assertEquals("1", config.jwtDecoder(shared, members).decode(sharedToken).getSubject());
        assertEquals("1", config.jwtDecoder(local, members).decode(localToken).getSubject());
        assertThrows(JwtException.class, () -> config.jwtDecoder(shared, members).decode(localToken));
        assertThrows(JwtException.class, () -> config.jwtDecoder(local, members).decode(sharedToken));
    }
    @Test void sharedSecretIsRequiredOnlyOutsideLocalProfile() {
        var config = config("");
        assertThrows(IllegalStateException.class, () -> config.jwtSecretKey(new MockEnvironment()));
        assertEquals(32, config.jwtSecretKey(new MockEnvironment().withProperty("spring.profiles.active", "local")).getEncoded().length);
    }
}
