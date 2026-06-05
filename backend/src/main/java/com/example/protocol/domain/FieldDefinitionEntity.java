package com.example.protocol.domain;

public class FieldDefinitionEntity {
  private Long id;
  private Long layerId;
  private String fieldName;
  private String fieldType;
  private Integer fieldOrder;
  private String description;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getLayerId() {
    return layerId;
  }

  public void setLayerId(Long layerId) {
    this.layerId = layerId;
  }

  public String getFieldName() {
    return fieldName;
  }

  public void setFieldName(String fieldName) {
    this.fieldName = fieldName;
  }

  public String getFieldType() {
    return fieldType;
  }

  public void setFieldType(String fieldType) {
    this.fieldType = fieldType;
  }

  public Integer getFieldOrder() {
    return fieldOrder;
  }

  public void setFieldOrder(Integer fieldOrder) {
    this.fieldOrder = fieldOrder;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
}
