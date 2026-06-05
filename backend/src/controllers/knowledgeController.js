import {
  insertKnowledgePoint,
  listLayersWithPoints,
  removeKnowledgePoint,
  saveKnowledgePoint
} from '../models/knowledgeModel.js'

export async function getLayers(req, res, next) {
  try {
    const layers = await listLayersWithPoints()
    res.json(layers)
  } catch (error) {
    next(error)
  }
}

export async function createPoint(req, res, next) {
  try {
    const created = await insertKnowledgePoint(req.params.layerId, req.body)
    res.status(201).json(created)
  } catch (error) {
    next(error)
  }
}

export async function updatePoint(req, res, next) {
  try {
    const updated = await saveKnowledgePoint(req.params.layerId, req.params.pointId, req.body)
    res.json(updated)
  } catch (error) {
    next(error)
  }
}

export async function deletePoint(req, res, next) {
  try {
    await removeKnowledgePoint(req.params.layerId, req.params.pointId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
