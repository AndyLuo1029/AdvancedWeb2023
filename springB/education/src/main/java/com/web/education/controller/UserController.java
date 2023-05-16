package com.web.education.controller;

import com.web.education.mapper.UserMapper;
import com.web.education.mybatis.SqlSessionLoader;
import com.web.education.pojo.User;
import com.web.education.request.UserRegisterRequest;
import com.web.education.response.ErrorResponse;
import com.web.education.response.UserRegisterResponse;
import org.apache.ibatis.session.SqlSession;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
public class UserController {

    @CrossOrigin(origins = "*")

    @PostMapping(value = "/register")
    public @ResponseBody Object register(@RequestBody UserRegisterRequest request) throws IOException {
        SqlSession sqlSession = SqlSessionLoader.getSqlSession();
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
        User user = userMapper.findUserByUsername(request.getUsername());

        if (user != null) {
            sqlSession.close();
            return new ErrorResponse("The username is already used");
        } else {
            userMapper.addUser(new User(request.getUsername(), request.getPassword(), request.getEmail(), request.getPhone()));
            sqlSession.commit();
            sqlSession.close();
            return new UserRegisterResponse("Register Successfully!");
        }
    }
}
