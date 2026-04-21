package com.mixmlaal.ruoyi.controller;

import com.mixmlaal.ruoyi.domain.AjaxResult;
import com.mixmlaal.ruoyi.domain.LoginBody;
import com.mixmlaal.ruoyi.domain.SysUser;
import com.mixmlaal.ruoyi.service.ISysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SysLoginController {

    private final ISysUserService userService;

    @PostMapping("/login")
    public AjaxResult login(@RequestBody LoginBody loginBody) {
        String token = userService.login(loginBody.getUsername(), loginBody.getPassword());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        return AjaxResult.success(data);
    }

    @GetMapping("/getInfo")
    public AjaxResult getInfo() {
        SysUser user = new SysUser();
        user.setUserId(1L);
        user.setUserName("admin");
        user.setNickName("管理员");
        user.setAvatar("https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif");

        Map<String, Object> data = new HashMap<>();
        data.put("user", user);
        data.put("roles", new String[]{"admin"});
        data.put("permissions", new String[]{"*:*:*"});

        return AjaxResult.success(data);
    }

    @PostMapping("/logout")
    public AjaxResult logout() {
        return AjaxResult.success();
    }
}
