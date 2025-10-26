package com.clearview.backend.auth;

import com.clearview.backend.user.User;
import com.clearview.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthController authController;

    private User testUser;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("alice");
        testUser.setPassword("password");
    }

    @Test
    void testRegister_Success() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        ResponseEntity<?> response = authController.register("alice", "password");

        assertEquals(200, response.getStatusCode().value());
        assertEquals("User registered successfully",
                ((Map<?, ?>) response.getBody()).get("message"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegister_Fail_UsernameTaken() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(testUser));

        ResponseEntity<?> response = authController.register("alice", "password");

        assertEquals(400, response.getStatusCode().value());
        assertEquals("Username already taken",
                ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void testLogin_Success() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);
        when(jwtUtil.generateToken("alice")).thenReturn("jwt-token");

        String token = authController.login("alice", "password");

        assertEquals("jwt-token", token);
    }

    @Test
    void testLogin_Fail() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mockAuth);

        String result = authController.login("alice", "wrong");

        assertEquals("Invalid credentials", result);
    }

    @Test
    void testMe_Success() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(mockAuth.getName()).thenReturn("alice");
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(testUser));

        ResponseEntity<?> response = authController.me(mockAuth);

        assertEquals(200, response.getStatusCode().value());
        assertTrue(((Map<?, ?>) response.getBody()).containsKey("username"));
    }

    @Test
    void testMe_NotAuthenticated() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(false);

        ResponseEntity<?> response = authController.me(mockAuth);

        assertEquals(401, response.getStatusCode().value());
    }

    @Test
    void testMe_UserNotFound() {
        Authentication mockAuth = mock(Authentication.class);
        when(mockAuth.isAuthenticated()).thenReturn(true);
        when(mockAuth.getName()).thenReturn("bob");
        when(userRepository.findByUsername("bob")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authController.me(mockAuth);

        assertEquals(404, response.getStatusCode().value());
    }
}
