package com.example.protocol.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

/**
 * Secondary datasource configuration for the Task 3 knowledge system.
 * Connects to the network_internship database which stores
 * TCP/IP layer metadata and per-layer knowledge points.
 */
@Configuration
public class KnowledgeDataSourceConfig {

  @Bean("knowledgeDataSource")
  @ConfigurationProperties(prefix = "knowledge.datasource")
  public DataSource knowledgeDataSource() {
    return DataSourceBuilder.create().build();
  }

  @Bean("knowledgeJdbcTemplate")
  public JdbcTemplate knowledgeJdbcTemplate(@Qualifier("knowledgeDataSource") DataSource dataSource) {
    return new JdbcTemplate(dataSource);
  }
}
