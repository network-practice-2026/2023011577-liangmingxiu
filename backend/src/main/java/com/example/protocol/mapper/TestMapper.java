package com.example.protocol.mapper;

import com.example.protocol.domain.TestEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TestMapper {
  @Select("select id, name from test_table")
  List<TestEntity> findAll();
}
