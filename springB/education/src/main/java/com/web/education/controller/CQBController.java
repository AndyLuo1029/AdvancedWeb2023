package com.web.education.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.web.education.mapper.CqbMapper;
import com.web.education.mapper.UserMapper;
import com.web.education.mybatis.SqlSessionLoader;
import com.web.education.pojo.Cqb;
import com.web.education.pojo.User;
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
    @CrossOrigin(origins = "*")
    @PostMapping(value = "/user/data")
    public @ResponseBody
    Object register(@RequestBody String username) throws IOException {
//        System.out.println(username);
        QueryWrapper<Cqb> wrapper=new QueryWrapper<>();
        //查询条件,状态为0的
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
}
