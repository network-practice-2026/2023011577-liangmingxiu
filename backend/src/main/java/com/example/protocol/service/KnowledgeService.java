package com.example.protocol.service;

import com.example.protocol.dto.KnowledgeLayerDTO;
import com.example.protocol.dto.KnowledgePointDTO;
import com.example.protocol.dto.KnowledgePointRequest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for Task 3 — TCP/IP knowledge system.
 * Mirrors the logic in the original Node.js knowledgeModel.js
 * but uses Spring JdbcTemplate against the network_internship database.
 */
@Service
public class KnowledgeService {

  private final JdbcTemplate jdbc;

  /**
   * Maps a layer id (e.g. "application") to its knowledge-points table name.
   */
  private static final Map<String, String> LAYER_POINT_TABLES = Map.of(
    "application", "application_layer_points",
    "transport",   "transport_layer_points",
    "network",     "network_layer_points",
    "datalink",    "datalink_layer_points",
    "physical",    "physical_layer_points"
  );

  public KnowledgeService(@Qualifier("knowledgeJdbcTemplate") JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  // ── public API ──────────────────────────────────────────────────────

  /**
   * Returns all five TCP/IP layers, each populated with its knowledge points.
   * Equivalent to Node.js listLayersWithPoints().
   */
  public List<KnowledgeLayerDTO> listLayersWithPoints() {
    List<Map<String, Object>> layerRows = jdbc.queryForList(
      "SELECT id, name, function_text, protocols, devices, data_unit " +
      "FROM tcpip_layers ORDER BY sort_order ASC"
    );

    List<KnowledgeLayerDTO> result = new ArrayList<>();
    for (Map<String, Object> row : layerRows) {
      String layerId = (String) row.get("id");
      List<KnowledgePointDTO> points = queryPoints(layerId);
      result.add(mapLayer(row, points));
    }
    return result;
  }

  /**
   * Insert a knowledge point and return it with its generated id.
   * Equivalent to Node.js insertKnowledgePoint().
   */
  public KnowledgePointDTO insertPoint(String layerId, KnowledgePointRequest req) {
    String table = resolveTable(layerId);
    validatePayload(req);

    jdbc.update(
      "INSERT INTO " + table + " (title, category, summary, detail) VALUES (?, ?, ?, ?)",
      req.getTitle().trim(), req.getCategory().trim(),
      req.getSummary().trim(), req.getDetail().trim()
    );

    Long generatedId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);

    return new KnowledgePointDTO(
      String.valueOf(generatedId),
      req.getTitle().trim(),
      req.getCategory().trim(),
      req.getSummary().trim(),
      req.getDetail().trim()
    );
  }

  /**
   * Update a knowledge point and return the updated object.
   * Equivalent to Node.js saveKnowledgePoint().
   */
  public KnowledgePointDTO updatePoint(String layerId, Long pointId, KnowledgePointRequest req) {
    String table = resolveTable(layerId);
    validatePayload(req);

    int affected = jdbc.update(
      "UPDATE " + table + " SET title = ?, category = ?, summary = ?, detail = ? WHERE id = ?",
      req.getTitle().trim(), req.getCategory().trim(),
      req.getSummary().trim(), req.getDetail().trim(),
      pointId
    );

    if (affected == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Knowledge point not found");
    }

    return new KnowledgePointDTO(
      String.valueOf(pointId),
      req.getTitle().trim(),
      req.getCategory().trim(),
      req.getSummary().trim(),
      req.getDetail().trim()
    );
  }

  /**
   * Delete a knowledge point. Throws 404 if it doesn't exist.
   * Equivalent to Node.js removeKnowledgePoint().
   */
  public void deletePoint(String layerId, Long pointId) {
    String table = resolveTable(layerId);
    int affected = jdbc.update("DELETE FROM " + table + " WHERE id = ?", pointId);
    if (affected == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Knowledge point not found");
    }
  }

  // ── private helpers ─────────────────────────────────────────────────

  /**
   * Query all knowledge points for a given layer.
   */
  private List<KnowledgePointDTO> queryPoints(String layerId) {
    String table = resolveTable(layerId);
    List<Map<String, Object>> rows = jdbc.queryForList(
      "SELECT id, title, category, summary, detail FROM " + table +
      " ORDER BY updated_at DESC, id DESC"
    );

    List<KnowledgePointDTO> points = new ArrayList<>();
    for (Map<String, Object> row : rows) {
      points.add(new KnowledgePointDTO(
        String.valueOf(row.get("id")),
        (String) row.get("title"),
        (String) row.get("category"),
        (String) row.get("summary"),
        (String) row.get("detail")
      ));
    }
    return points;
  }

  /**
   * Map a tcpip_layers row + its points into a KnowledgeLayerDTO.
   */
  private KnowledgeLayerDTO mapLayer(Map<String, Object> row, List<KnowledgePointDTO> points) {
    KnowledgeLayerDTO dto = new KnowledgeLayerDTO();
    dto.setId((String) row.get("id"));
    dto.setName((String) row.get("name"));
    dto.setFunctionText((String) row.get("function_text"));

    String protocolsStr = (String) row.get("protocols");
    dto.setProtocols(protocolsStr != null
      ? Arrays.stream(protocolsStr.split(",")).map(String::trim).collect(Collectors.toList())
      : Collections.emptyList());

    String devicesStr = (String) row.get("devices");
    dto.setDevices(devicesStr != null
      ? Arrays.stream(devicesStr.split(",")).map(String::trim).collect(Collectors.toList())
      : Collections.emptyList());

    dto.setDataUnit((String) row.get("data_unit"));
    dto.setPoints(points);
    return dto;
  }

  /**
   * Look up the point-table name for a layer id. Throws 404 for unknown layers.
   */
  private String resolveTable(String layerId) {
    String table = LAYER_POINT_TABLES.get(layerId);
    if (table == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown layer: " + layerId);
    }
    return table;
  }

  /**
   * Validate that all required fields are present (mirrors Node.js validatePointPayload).
   */
  private void validatePayload(KnowledgePointRequest req) {
    if (isBlank(req.getTitle()) || isBlank(req.getCategory()) ||
        isBlank(req.getSummary()) || isBlank(req.getDetail())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
        "title, category, summary and detail are required");
    }
  }

  private boolean isBlank(String s) {
    return s == null || s.trim().isEmpty();
  }
}
