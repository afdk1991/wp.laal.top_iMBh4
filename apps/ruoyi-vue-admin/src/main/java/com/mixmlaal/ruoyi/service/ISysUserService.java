package com.mixmlaal.ruoyi.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mixmlaal.ruoyi.domain.SysUser;

public interface ISysUserService extends IService<SysUser> {
    SysUser selectUserByUserName(String username);
    String login(String username, String password);
}
