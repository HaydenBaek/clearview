package com.clearview.backend.user;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    @Test
    void testUserEntityBasics() {
        User user = new User();
        user.setId(1L);
        user.setUsername("alice");
        user.setPassword("secret");

        assertEquals(1L, user.getId());
        assertEquals("alice", user.getUsername());
        assertEquals("secret", user.getPassword());

        // Default UserDetails contract methods
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        assertNotNull(authorities);
        assertTrue(authorities.isEmpty());
    }
}
