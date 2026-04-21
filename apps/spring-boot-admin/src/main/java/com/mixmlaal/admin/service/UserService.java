package com.mixmlaal.admin.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mixmlaal.admin.entity.User;

public interface UserService extends IService<User> {
    User login(String username, String password);

    String generateToken(User user);
}
