package com.example.protocol.controller;

import com.example.protocol.common.Result;
import com.example.protocol.dto.HeaderFieldDTO;
import com.example.protocol.dto.ProtocolEncapsulationResponse;
import com.example.protocol.dto.ProtocolLayerDTO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class ProtocolController {

  @GetMapping("/api/protocol/steps")
  public Result<List<Map<String, Object>>> steps() {
    List<Map<String, Object>> data = List.of(
      Map.of("step", 1, "title", "ARP Request", "from", "Host A", "to", "Broadcast", "detail", "Who has 192.168.1.1?"),
      Map.of("step", 2, "title", "ARP Reply", "from", "Host B", "to", "Host A", "detail", "192.168.1.1 is at AA:BB:CC:DD:EE:FF")
    );
    return Result.success(data);
  }

  @GetMapping("/api/protocol/encapsulation")
  public Result<ProtocolEncapsulationResponse> encapsulation() {
    List<ProtocolLayerDTO> layers = List.of(
      new ProtocolLayerDTO(
        "Application",
        List.of(new HeaderFieldDTO("App-Type", "HTTP"), new HeaderFieldDTO("Method", "GET")),
        "GET /index.html HTTP/1.1",
        "#4F8EF7"
      ),
      new ProtocolLayerDTO(
        "Transport",
        List.of(new HeaderFieldDTO("SrcPort", "54321"), new HeaderFieldDTO("DstPort", "80")),
        "TCP payload (app data)",
        "#50C878"
      ),
      new ProtocolLayerDTO(
        "Network",
        List.of(new HeaderFieldDTO("SrcIP", "192.168.1.10"), new HeaderFieldDTO("DstIP", "93.184.216.34")),
        "IP payload (TCP segment)",
        "#F5A623"
      ),
      new ProtocolLayerDTO(
        "DataLink",
        List.of(new HeaderFieldDTO("SrcMAC", "AA:BB:CC:DD:EE:FF"), new HeaderFieldDTO("DstMAC", "11:22:33:44:55:66")),
        "Frame payload (IP packet)",
        "#9B59B6"
      )
    );
    ProtocolEncapsulationResponse response = new ProtocolEncapsulationResponse(layers, 0);
    return Result.success(response);
  }
}
