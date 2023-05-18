package com.web.education.request;

public class UserDataRequest {
    private String username;
    private int time;
    private double hitrate;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }

    public double getHitrate() {
        return hitrate;
    }

    public void setHitrate(double hitrate) {
        this.hitrate = hitrate;
    }
}
