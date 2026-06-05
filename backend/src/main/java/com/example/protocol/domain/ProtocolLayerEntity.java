package com.example.protocol.domain;

public class ProtocolLayerEntity {
  private Long id;
  private String name;
  private Integer layerOrder;
  private String description;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Integer getLayerOrder() {
    return layerOrder;
  }

  public void setLayerOrder(Integer layerOrder) {
    this.layerOrder = layerOrder;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
}
