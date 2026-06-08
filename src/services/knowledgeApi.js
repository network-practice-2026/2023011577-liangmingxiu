/**
 * Knowledge system API — Task 3.
 * All data comes exclusively from the Spring Boot backend / MySQL database.
 */

async function requestJson(endpoint, options) {
  const response = await fetch(endpoint, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`Request failed: ${response.status}${text ? ' - ' + text : ''}`)
  }
  // DELETE returns 204 No Content with no body
  if (response.status === 204) {
    return null
  }
  return response.json()
}

export async function fetchKnowledgeLayers() {
  return requestJson('/api/knowledge/layers')
}

export async function createKnowledgePoint(layerId, point) {
  return requestJson(`/api/knowledge/layers/${layerId}/points`, {
    method: 'POST',
    body: JSON.stringify(point)
  })
}

export async function updateKnowledgePoint(layerId, point) {
  return requestJson(`/api/knowledge/layers/${layerId}/points/${point.id}`, {
    method: 'PUT',
    body: JSON.stringify(point)
  })
}

export async function deleteKnowledgePoint(layerId, pointId) {
  return requestJson(`/api/knowledge/layers/${layerId}/points/${pointId}`, {
    method: 'DELETE'
  })
}
