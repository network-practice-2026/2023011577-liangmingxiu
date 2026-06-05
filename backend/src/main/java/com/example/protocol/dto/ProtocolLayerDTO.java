package com.example.protocol.dto;

import java.util.List;

public class ProtocolLayerDTO {
  private String name;
  private List<HeaderFieldDTO> headerFields;
  private String payloadPreview;
  private String colorCode;

  public ProtocolLayerDTO() {}

  public ProtocolLayerDTO(String name, List<HeaderFieldDTO> headerFields, String payloadPreview, String colorCode) {
    this.name = name;
    this.headerFields = headerFields;
    this.payloadPreview = payloadPreview;
    this.colorCode = colorCode;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public List<HeaderFieldDTO> getHeaderFields() {
    return headerFields;
  }

  public void setHeaderFields(List<HeaderFieldDTO> headerFields) {
    this.headerFields = headerFields;
  }

  public String getPayloadPreview() {
    return payloadPreview;
  }

  public void setPayloadPreview(String payloadPreview) {
    this.payloadPreview = payloadPreview;
  }

  public String getColorCode() {
    return colorCode;
  }

  public void setColorCode(String colorCode) {
    this.colorCode = colorCode;
  }
}
