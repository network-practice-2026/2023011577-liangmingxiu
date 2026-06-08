package com.example.protocol.dto;

import java.util.List;

/**
 * DTO matching the Node.js response for a single TCP/IP layer
 * with its associated knowledge points.
 */
public class KnowledgeLayerDTO {

  private String id;
  private String name;
  private String functionText;
  private List<String> protocols;
  private List<String> devices;
  private String dataUnit;
  private List<KnowledgePointDTO> points;

  public KnowledgeLayerDTO() {}

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getFunctionText() {
    return functionText;
  }

  public void setFunctionText(String functionText) {
    this.functionText = functionText;
  }

  public List<String> getProtocols() {
    return protocols;
  }

  public void setProtocols(List<String> protocols) {
    this.protocols = protocols;
  }

  public List<String> getDevices() {
    return devices;
  }

  public void setDevices(List<String> devices) {
    this.devices = devices;
  }

  public String getDataUnit() {
    return dataUnit;
  }

  public void setDataUnit(String dataUnit) {
    this.dataUnit = dataUnit;
  }

  public List<KnowledgePointDTO> getPoints() {
    return points;
  }

  public void setPoints(List<KnowledgePointDTO> points) {
    this.points = points;
  }
}
