package com.group2.taskmanagement.service;

import com.group2.taskmanagement.domain.AppUser;
import com.group2.taskmanagement.dto.auth.AuthUserResponse;
import com.group2.taskmanagement.dto.auth.LoginRequest;
import com.group2.taskmanagement.dto.auth.RegisterRequest;
import com.group2.taskmanagement.exception.BadRequestException;
import com.group2.taskmanagement.exception.NotFoundException;
import com.group2.taskmanagement.repository.AppUserRepository;
import com.group2.taskmanagement.security.AppUserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthUserResponse register(RegisterRequest request, HttpServletRequest httpRequest) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (appUserRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new BadRequestException("Email is already in use");
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        appUserRepository.save(user);

        authenticate(normalizedEmail, request.password(), httpRequest);
        return AuthUserResponse.from(user);
    }

    public AuthUserResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticate(request.email().trim().toLowerCase(), request.password(), httpRequest);
        AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
        AppUser user = appUserRepository.findById(principal.getId())
            .orElseThrow(() -> new NotFoundException("User not found"));
        return AuthUserResponse.from(user);
    }

    public AuthUserResponse me(AppUserPrincipal principal) {
        AppUser user = appUserRepository.findById(principal.getId())
            .orElseThrow(() -> new NotFoundException("User not found"));
        return AuthUserResponse.from(user);
    }

    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    private Authentication authenticate(String email, String password, HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);
        return authentication;
    }
}
