package com.web.education.util;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.UnsupportedEncodingException;

public class Password {
    // 加密
    public static String encodePassword(String password) {
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        String encoded = bCryptPasswordEncoder.encode(password);
        return encoded;
    }

    // 解密
    public static boolean checkPassword(String password, String encoded) {
        BCryptPasswordEncoder passwordEncoder  = new BCryptPasswordEncoder();
        boolean isPass  = passwordEncoder.matches(password, encoded);
        return isPass;
    }
}

