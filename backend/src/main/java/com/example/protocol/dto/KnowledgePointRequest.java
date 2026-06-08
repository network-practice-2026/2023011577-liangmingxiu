package com.example.protocol.dto;

/**
 * Request body DTO for creating or updating a knowledge point.
 * Validation is performed in the service layer (matching Node.js behaviour).
 */
public class KnowledgePointRequest {

  private String title;
  private String category;
  private String summary;
  private String detail;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getDetail() {
    return detail;
  }

  public void setDetail(String detail) {
    this.detail = detail;
  }
}
