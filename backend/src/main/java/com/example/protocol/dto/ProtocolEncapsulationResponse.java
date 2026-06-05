package com.example.protocol.dto;

import java.util.List;

public class ProtocolEncapsulationResponse {
  private List<ProtocolLayerDTO> layers;
  private int currentLayerIndex;

  public ProtocolEncapsulationResponse() {}

  public ProtocolEncapsulationResponse(List<ProtocolLayerDTO> layers, int currentLayerIndex) {
    this.layers = layers;
    this.currentLayerIndex = currentLayerIndex;
  }

  public List<ProtocolLayerDTO> getLayers() {
    return layers;
  }

  public void setLayers(List<ProtocolLayerDTO> layers) {
    this.layers = layers;
  }

  public int getCurrentLayerIndex() {
    return currentLayerIndex;
  }

  public void setCurrentLayerIndex(int currentLayerIndex) {
    this.currentLayerIndex = currentLayerIndex;
  }
}
