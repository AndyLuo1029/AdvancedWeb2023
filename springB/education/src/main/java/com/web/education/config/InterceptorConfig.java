package com.web.education.config;

import com.web.education.util.JwtInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class InterceptorConfig extends WebMvcConfigurationSupport {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        List<String> excludePaths = new ArrayList<>();
        String register = "/register";
        excludePaths.add(register);

        String login = "/login";
        excludePaths.add(login);

        registry.addInterceptor(new JwtInterceptor()).excludePathPatterns(excludePaths);
    }
}
