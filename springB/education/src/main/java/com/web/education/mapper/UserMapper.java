package com.web.education.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.web.education.pojo.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    User findUserById(int userId);
    User findUserByUsername(String username);
    int addUser(User user);
}
