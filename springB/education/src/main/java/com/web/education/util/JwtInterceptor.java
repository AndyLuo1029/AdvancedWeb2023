package com.web.education.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
@Component
public class JwtInterceptor implements HandlerInterceptor {
    private static final Logger log = LoggerFactory.getLogger(JwtInterceptor.class);
    private static final String AUTH = "Authorization";
    private static final String AUTH_USER_NAME = "Username";


    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equals(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return true;
        }
        response.setContentType("application/json;charset=utf-8");

        String token = request.getHeader(AUTH);
        String username =  request.getHeader(AUTH_USER_NAME);
        log.info("token=" + token);
        log.info("username=" + username);
//        if (StrUtil.isEmpty(token)) {
//            throw new ValidationException("Authorization不允许为空，请重新登录");
//        }
//
//        if (StrUtil.isEmpty(username)) {
//            throw new ValidationException("用户名不允许为空，请重新登录");
//        }
        if(username == null || username.equals("") || token == null || token.equals("")) {
            response.setStatus(403);
            return false;
        }
        int code = JwtUtil.verifyToken(token, username);
        if (code != 200) {
            response.setStatus(403);
            return false;
        }
        return true;
    }

}
