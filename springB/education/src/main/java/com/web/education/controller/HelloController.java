package com.web.education.controller;

import org.springframework.web.bind.annotation.*;

import java.util.concurrent.atomic.AtomicLong;
import com.web.education.response.GreetingResponse;
@RestController
public class HelloController {

    @RequestMapping("/hello")
    public String index() {
        return "Hello, World!";
    }
    private final AtomicLong counter = new AtomicLong();
    @CrossOrigin(origins = "*")
    @RequestMapping("/greeting")
    public @ResponseBody GreetingResponse greeting(@RequestParam(value = "name", defaultValue = "World") String name){
        return new GreetingResponse(counter.incrementAndGet(), "Hello, " + name + "!");
    }
}

