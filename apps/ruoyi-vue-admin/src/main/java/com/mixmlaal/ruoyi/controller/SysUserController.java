package com.mixmlaal.ruoyi.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mixmlaal.ruoyi.domain.AjaxResult;
import com.mixmlaal.ruoyi.domain.SysUser;
import com.mixmlaal.ruoyi.service.ISysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/system/user")
@RequiredArgsConstructor
public class SysUserController {

    private final ISysUserService userService;

    @GetMapping("/list")
    public AjaxResult list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            SysUser user) {
        Page<SysUser> page = new Page<>(pageNum, pageSize);
        Page<SysUser> result = userService.page(page);
        return AjaxResult.success(result);
    }

    @GetMapping("/{userId}")
    public AjaxResult getInfo(@PathVariable Long userId) {
        return AjaxResult.success(userService.getById(userId));
    }

    @PostMapping
    public AjaxResult add(@RequestBody SysUser user) {
        return AjaxResult.success(userService.save(user));
    }

    @PutMapping
    public AjaxResult edit(@RequestBody SysUser user) {
        return AjaxResult.success(userService.updateById(user));
    }

    @DeleteMapping("/{userIds}")
    public AjaxResult remove(@PathVariable Long[] userIds) {
        return AjaxResult.success(userService.removeByIds(Arrays.asList(userIds)));
    }

    @PutMapping("/changeStatus")
    public AjaxResult changeStatus(@RequestBody SysUser user) {
        return AjaxResult.success(userService.updateById(user));
    }

    @PutMapping("/resetPwd")
    public AjaxResult resetPwd(@RequestBody SysUser user) {
        return AjaxResult.success(userService.updateById(user));
    }
}
