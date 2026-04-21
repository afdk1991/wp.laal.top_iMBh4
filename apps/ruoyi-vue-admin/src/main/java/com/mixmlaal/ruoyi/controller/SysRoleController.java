package com.mixmlaal.ruoyi.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mixmlaal.ruoyi.domain.AjaxResult;
import com.mixmlaal.ruoyi.domain.SysRole;
import com.mixmlaal.ruoyi.mapper.SysRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/system/role")
@RequiredArgsConstructor
public class SysRoleController {

    private final SysRoleMapper roleMapper;

    @GetMapping("/list")
    public AjaxResult list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            SysRole role) {
        Page<SysRole> page = new Page<>(pageNum, pageSize);
        Page<SysRole> result = roleMapper.selectPage(page, null);
        return AjaxResult.success(result);
    }

    @GetMapping("/{roleId}")
    public AjaxResult getInfo(@PathVariable Long roleId) {
        return AjaxResult.success(roleMapper.selectById(roleId));
    }

    @PostMapping
    public AjaxResult add(@RequestBody SysRole role) {
        return AjaxResult.success(roleMapper.insert(role));
    }

    @PutMapping
    public AjaxResult edit(@RequestBody SysRole role) {
        return AjaxResult.success(roleMapper.updateById(role));
    }

    @DeleteMapping("/{roleIds}")
    public AjaxResult remove(@PathVariable Long[] roleIds) {
        return AjaxResult.success(roleMapper.deleteBatchIds(Arrays.asList(roleIds)));
    }

    @PutMapping("/changeStatus")
    public AjaxResult changeStatus(@RequestBody SysRole role) {
        return AjaxResult.success(roleMapper.updateById(role));
    }
}
