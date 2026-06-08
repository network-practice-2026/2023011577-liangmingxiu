package com.example.protocol.dto;

/**
 * DTO matching the Node.js knowledge point response format.
 * Returned inside KnowledgeLayerDTO.points array.
 */
public class KnowledgePointDTO {

  private String id;
  private String title;
  private String category;
  private String summary;
  private String detail;

  public KnowledgePointDTO() {}

  public KnowledgePointDTO(String id, String title, String category, String summary, String detail) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.summary = summary;
    this.detail = detail;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

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
