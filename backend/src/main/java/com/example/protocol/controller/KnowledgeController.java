package com.example.protocol.controller;

import com.example.protocol.dto.KnowledgeLayerDTO;
import com.example.protocol.dto.KnowledgePointDTO;
import com.example.protocol.dto.KnowledgePointRequest;
import com.example.protocol.service.KnowledgeService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for Task 3 — Knowledge System API.
 *
 * API surface matches the original Node.js Express routes exactly
 * so the frontend works without any changes:
 *
 *   GET    /api/knowledge/layers
 *   POST   /api/knowledge/layers/{layerId}/points
 *   PUT    /api/knowledge/layers/{layerId}/points/{pointId}
 *   DELETE /api/knowledge/layers/{layerId}/points/{pointId}
 */
@RestController
@RequestMapping("/api/knowledge")
public class KnowledgeController {

  private final KnowledgeService knowledgeService;

  public KnowledgeController(KnowledgeService knowledgeService) {
    this.knowledgeService = knowledgeService;
  }

  /**
   * Get all TCP/IP layers with their knowledge points.
   * Returns the raw array (not wrapped in Result) to match Node.js response.
   */
  @GetMapping("/layers")
  public List<KnowledgeLayerDTO> getLayers() {
    return knowledgeService.listLayersWithPoints();
  }

  /**
   * Create a new knowledge point for a given layer.
   * Returns 201 with the created point, matching Node.js behaviour.
   */
  @PostMapping("/layers/{layerId}/points")
  @ResponseStatus(HttpStatus.CREATED)
  public KnowledgePointDTO createPoint(
      @PathVariable String layerId,
      @RequestBody KnowledgePointRequest body) {
    return knowledgeService.insertPoint(layerId, body);
  }

  /**
   * Update an existing knowledge point.
   */
  @PutMapping("/layers/{layerId}/points/{pointId}")
  public KnowledgePointDTO updatePoint(
      @PathVariable String layerId,
      @PathVariable Long pointId,
      @RequestBody KnowledgePointRequest body) {
    return knowledgeService.updatePoint(layerId, pointId, body);
  }

  /**
   * Delete a knowledge point. Returns 204 No Content.
   */
  @DeleteMapping("/layers/{layerId}/points/{pointId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deletePoint(
      @PathVariable String layerId,
      @PathVariable Long pointId) {
    knowledgeService.deletePoint(layerId, pointId);
  }
}
