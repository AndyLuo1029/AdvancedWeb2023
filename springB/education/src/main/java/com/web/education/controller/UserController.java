package com.web.education.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.web.education.mapper.UserMapper;
import com.web.education.mybatis.SqlSessionLoader;
import com.web.education.pojo.Cqb;
import com.web.education.pojo.User;
import com.web.education.request.UserLoginRequest;
import com.web.education.request.UserRegisterRequest;
import com.web.education.response.ErrorResponse;
import com.web.education.response.UserInfoResponse;
import com.web.education.response.UserLoginResponse;
import com.web.education.response.UserRegisterResponse;
import com.web.education.util.JwtUtil;
import com.web.education.util.Password;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;

@RestController
public class UserController {

    @Autowired
    UserMapper uMapper;

    @CrossOrigin(origins = "*")
    @PostMapping(value = "/register")
    public @ResponseBody Object register(@RequestBody UserRegisterRequest request) throws IOException {
        SqlSession sqlSession = SqlSessionLoader.getSqlSession();
        UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
        User user = userMapper.findUserByUsername(request.getUsername());
        if (user != null) {
            sqlSession.close();
            return new ErrorResponse("用户名已存在", 400);
        } else {
            String encoded = Password.encodePassword(request.getPassword());
            userMapper.addUser(new User(request.getUsername(), encoded, request.getEmail()));
            sqlSession.commit();
            sqlSession.close();
            return new UserRegisterResponse("注册成功", 200);
        }
    }

    @CrossOrigin(origins = "*")
    @PostMapping(value = "/login")
    public @ResponseBody Object login(@RequestBody UserLoginRequest request) throws IOException {
        String username = request.getUsername();
        HashMap<String, Object> map = new HashMap<>();
        // 自定义要查询
        map.put("username",username);
//        map.put("password",request.getPassword());
        List<User> userList =uMapper.selectByMap(map);

        if (userList.size() > 0) {
            boolean check = Password.checkPassword(request.getPassword(), userList.get(0).getPassword());
            if(check) {
                String token = JwtUtil.createToken(username);
                return new UserLoginResponse("登录成功", 200, token, username);
            }
            else {
                return new ErrorResponse("密码错误", 400);
            }
        } else {
            return new ErrorResponse("用户名不存在", 400);
        }
    }

    @CrossOrigin(origins = "*")
    @PostMapping(value = "/info")
    public @ResponseBody Object info(@RequestBody String username) throws IOException {
        QueryWrapper<User> wrapper=new QueryWrapper<>();
        wrapper.eq("username",username);
        List<User> userList =uMapper.selectList(wrapper);

        if (userList.size() > 0) {
            return new UserInfoResponse(userList.get(0).getUsername(), userList.get(0).getEmail());
        }
        else {
            return new ErrorResponse("用户不存在", 401);
        }

    }
}
