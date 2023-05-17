package com.web.education.controller;

import org.springframework.web.bind.annotation.*;

import java.util.concurrent.atomic.AtomicLong;
import com.web.education.response.GreetingResponse;

import static org.springframework.web.bind.annotation.RequestMethod.GET;

@RestController
public class HelloController {

    private final AtomicLong counter = new AtomicLong();
    @CrossOrigin(origins = "*")
    @RequestMapping("/greeting")
    public @ResponseBody GreetingResponse greeting(@RequestParam(value = "name", defaultValue = "World") String name){
        return new GreetingResponse(counter.incrementAndGet(), "Hello, " + name + "!");
    }
}

