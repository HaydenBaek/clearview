package com.clearview.backend.auth;

import com.clearview.backend.user.User;
import com.clearview.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public String register(@RequestParam String username, @RequestParam String password) {
        User u = new User();
        u.setUsername(username);
        u.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(u);
        return "✅ User registered";
    }

    @PostMapping("/login")
    public String login() {
        // handled by Spring Security
        return "✅ Login successful";
    }

    @PostMapping("/logout")
    public String logout() {
        // handled by Spring Security
        return "✅ Logout successful";
    }
}
