package com.clearview.backend.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private final JwtUtil jwtUtil = new JwtUtil();

    @Test
    void testGenerateAndValidateToken() {
        String token = jwtUtil.generateToken("alice");
        assertNotNull(token);

        String username = jwtUtil.validateAndExtractUsername(token);
        assertEquals("alice", username);
    }

    @Test
    void testValidate_InvalidToken() {
        String invalid = "not-a-token";
        assertNull(jwtUtil.validateAndExtractUsername(invalid));
    }
}
