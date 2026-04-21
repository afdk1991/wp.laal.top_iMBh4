package com.mixmlaal.admin.controller;

import com.mixmlaal.admin.common.Result;
import com.mixmlaal.admin.entity.User;
import com.mixmlaal.admin.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody Map<String, String> params) {
        String username = params.get("username");
        String password = params.get("password");

        User user = userService.login(username, password);
        String token = userService.generateToken(user);

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);

        return Result.success(data);
    }

    @GetMapping("/userinfo")
    public Result<User> getUserInfo() {
        return Result.success(new User());
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }
}
