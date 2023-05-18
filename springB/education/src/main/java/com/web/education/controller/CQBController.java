package com.web.education.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.web.education.mapper.CqbMapper;
import com.web.education.mapper.UserMapper;
import com.web.education.mybatis.SqlSessionLoader;
import com.web.education.pojo.Cqb;
import com.web.education.pojo.User;
import com.web.education.request.UserDataRequest;
import com.web.education.request.UserRegisterRequest;
import com.web.education.response.ErrorResponse;
import com.web.education.response.UserRegisterResponse;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
public class CQBController {

    @Autowired
    CqbMapper cqbMapper;
    @Autowired
    UserMapper userMapper;

    @CrossOrigin(origins = "*")
    @PostMapping(value = "/user/data")
    public @ResponseBody
    Object getData(@RequestBody String username) throws IOException {
//        System.out.println(username);
        QueryWrapper<Cqb> wrapper=new QueryWrapper<>();
        wrapper.eq("username",username);
        wrapper.orderByDesc("date");
        wrapper.last("limit 10");
        List<Cqb> cqbList = cqbMapper.selectList(wrapper);
        if (cqbList == null || cqbList.isEmpty()) {
            return new ErrorResponse("无数据", 401);
        } else {
//            return new UserRegisterResponse("注册成功", 200);
            return cqbList;
        }
    }

    @CrossOrigin(origins = "*")
    @PostMapping(value = "/user/addData")
    public @ResponseBody
    Object addData(@RequestBody UserDataRequest userDataRequest) {
//        System.out.println(username);
        String username = userDataRequest.getUsername();
        QueryWrapper<User> wrapper=new QueryWrapper<>();
        wrapper.eq("username",username);
        List<User> userList = userMapper.selectList(wrapper);

        if (userList == null || userList.isEmpty()) {
            return new ErrorResponse("用户名不存在", 401);
        } else {
            Cqb cqb = new Cqb(username, userDataRequest.getHitrate(), userDataRequest.getTime());
            cqbMapper.insert(cqb);
            //success actually
            return new ErrorResponse("保存成功", 200);
        }
    }
}
