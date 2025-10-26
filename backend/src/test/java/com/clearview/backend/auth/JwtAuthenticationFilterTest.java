package com.clearview.backend.auth;

import com.clearview.backend.user.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;


import jakarta.servlet.FilterChain;

import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private FilterChain filterChain;

    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        filter = new JwtAuthenticationFilter(jwtUtil, userDetailsService);
    }

    @Test
    void testDoFilter_ValidToken() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.validateAndExtractUsername("valid-token")).thenReturn("alice");
        UserDetails userDetails = User.withUsername("alice").password("pass").authorities("ROLE_USER").build();
        when(userDetailsService.loadUserByUsername("alice")).thenReturn(userDetails);

        filter.doFilterInternal(request, response, filterChain);

        verify(jwtUtil).validateAndExtractUsername("valid-token");
        verify(userDetailsService).loadUserByUsername("alice");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void testDoFilter_NoAuthHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtil, userDetailsService);
    }

    @Test
    void testDoFilter_InvalidToken() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid-token");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtil.validateAndExtractUsername("invalid-token")).thenReturn(null);

        filter.doFilterInternal(request, response, filterChain);

        verify(jwtUtil).validateAndExtractUsername("invalid-token");
        verify(filterChain).doFilter(request, response);
    }
}
