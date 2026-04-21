package com.mixmlaal.auth.service;

import com.mixmlaal.auth.dto.LoginRequest;
import com.mixmlaal.auth.dto.LoginResponse;
import com.mixmlaal.auth.entity.User;
import com.mixmlaal.auth.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final RedisTemplate<String, String> redisTemplate;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            throw new RuntimeException("账号已被禁用");
        }

        String token = generateToken(user);

        redisTemplate.opsForValue().set(
                "token:" + user.getId(),
                token,
                expiration,
                TimeUnit.MILLISECONDS
        );

        return new LoginResponse(
                token,
                "Bearer",
                expiration,
                new LoginResponse.UserInfo(
                        user.getId(),
                        user.getUsername(),
                        user.getNickname(),
                        user.getEmail(),
                        user.getAvatar()
                )
        );
    }

    public void logout(Long userId) {
        redisTemplate.delete("token:" + userId);
    }

    public User validateToken(String token) {
        try {
            var claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String username = claims.getSubject();
            User user = userRepository.findByUsername(username).orElse(null);

            if (user == null) {
                throw new RuntimeException("用户不存在");
            }

            String cachedToken = redisTemplate.opsForValue().get("token:" + user.getId());
            if (!token.equals(cachedToken)) {
                throw new RuntimeException("Token已失效");
            }

            return user;
        } catch (Exception e) {
            throw new RuntimeException("Token验证失败: " + e.getMessage());
        }
    }

    public User register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setStatus(1);
        user.setCreateTime(LocalDateTime.now());
        user.setUpdateTime(LocalDateTime.now());

        return userRepository.save(user);
    }

    private String generateToken(User user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(user.getUsername())
                .claim("userId", user.getId())
                .claim("username", user.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();
    }
}
