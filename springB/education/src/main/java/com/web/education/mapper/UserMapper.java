package com.web.education.mapper;

import com.web.education.pojo.User;

public interface UserMapper {
    User findUserById(int userId);
    User findUserByUsername(String username);
    int addUser(User user);
}
