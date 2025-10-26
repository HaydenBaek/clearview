package com.clearview.backend.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class CustomUserDetailsServiceTest {

    private UserRepository userRepository;
    private CustomUserDetailsService service;

    private User testUser;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        userRepository = mock(UserRepository.class);
        service = new CustomUserDetailsService(userRepository);

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("alice");
        testUser.setPassword("password");
    }

    @Test
    void testLoadUserByUsername_Success() {
        when(userRepository.findByUsername("alice")).thenReturn(Optional.of(testUser));

        UserDetails result = service.loadUserByUsername("alice");

        assertNotNull(result);
        assertEquals("alice", result.getUsername());
        assertEquals("password", result.getPassword());
        verify(userRepository).findByUsername("alice");
    }

    @Test
    void testLoadUserByUsername_NotFound() {
        when(userRepository.findByUsername("bob")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> service.loadUserByUsername("bob"));
        verify(userRepository).findByUsername("bob");
    }
}
