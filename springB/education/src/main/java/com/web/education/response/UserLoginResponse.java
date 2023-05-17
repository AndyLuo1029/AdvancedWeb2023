package com.web.education.response;

public class UserLoginResponse {
    private final String message;
    private final int code;
    private final String token;
    private final String username;
    public UserLoginResponse(String message, int code, String token, String username) {
        this.message = message;
        this.code = code;
        this.token = token;
        this.username = username;
    }
    public String getMessage() {
        return message;
    }
    public int getCode() {
        return code;
    }
    public String getToken() {
        return token;
    }
    public String getUsername() {
        return username;
    }
}
