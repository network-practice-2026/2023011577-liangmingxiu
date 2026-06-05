package com.example.protocol.controller;

import com.example.protocol.common.Result;
import com.example.protocol.domain.TestEntity;
import com.example.protocol.mapper.TestMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TestController {
  private final TestMapper testMapper;

  public TestController(TestMapper testMapper) {
    this.testMapper = testMapper;
  }

  @GetMapping("/api/test/db")
  public Result<List<TestEntity>> db() {
    return Result.success(testMapper.findAll());
  }
}
