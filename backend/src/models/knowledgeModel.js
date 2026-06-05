import { pool } from '../db.js'

const layerPointTables = {
  application: 'application_layer_points',
  transport: 'transport_layer_points',
  network: 'network_layer_points',
  datalink: 'datalink_layer_points',
  physical: 'physical_layer_points'
}

function createError(message, status = 400) {
  const error = new Error(message)
  error.status = status
  return error
}

function resolvePointTable(layerId) {
  const table = layerPointTables[layerId]
  if (!table) {
    throw createError(`Unknown layer: ${layerId}`, 404)
  }
  return table
}

function validatePointPayload(payload) {
  const title = String(payload.title || '').trim()
  const category = String(payload.category || '').trim()
  const summary = String(payload.summary || '').trim()
  const detail = String(payload.detail || '').trim()

  if (!title || !category || !summary || !detail) {
    throw createError('title, category, summary and detail are required')
  }

  return { title, category, summary, detail }
}

function mapPoint(row) {
  return {
    id: String(row.id),
    title: row.title,
    category: row.category,
    summary: row.summary,
    detail: row.detail
  }
}

function mapLayer(row, points) {
  return {
    id: row.id,
    name: row.name,
    functionText: row.function_text,
    protocols: row.protocols ? row.protocols.split(',').map((item) => item.trim()) : [],
    devices: row.devices ? row.devices.split(',').map((item) => item.trim()) : [],
    dataUnit: row.data_unit,
    points
  }
}

export async function listLayersWithPoints() {
  const [layers] = await pool.query(
    `select id, name, function_text, protocols, devices, data_unit, sort_order
     from tcpip_layers
     order by sort_order asc`
  )

  const result = []
  for (const layer of layers) {
    const table = resolvePointTable(layer.id)
    const [points] = await pool.query(
      `select id, title, category, summary, detail
       from ${table}
       order by updated_at desc, id desc`
    )
    result.push(mapLayer(layer, points.map(mapPoint)))
  }

  return result
}

export async function insertKnowledgePoint(layerId, payload) {
  const table = resolvePointTable(layerId)
  const point = validatePointPayload(payload)
  const [result] = await pool.query(
    `insert into ${table} (title, category, summary, detail)
     values (:title, :category, :summary, :detail)`,
    point
  )

  return {
    id: String(result.insertId),
    ...point
  }
}

export async function saveKnowledgePoint(layerId, pointId, payload) {
  const table = resolvePointTable(layerId)
  const point = validatePointPayload(payload)
  const [result] = await pool.query(
    `update ${table}
     set title = :title,
         category = :category,
         summary = :summary,
         detail = :detail
     where id = :id`,
    {
      id: Number(pointId),
      ...point
    }
  )

  if (result.affectedRows === 0) {
    throw createError('Knowledge point not found', 404)
  }

  return {
    id: String(pointId),
    ...point
  }
}

export async function removeKnowledgePoint(layerId, pointId) {
  const table = resolvePointTable(layerId)
  const [result] = await pool.query(`delete from ${table} where id = :id`, {
    id: Number(pointId)
  })

  if (result.affectedRows === 0) {
    throw createError('Knowledge point not found', 404)
  }
}
