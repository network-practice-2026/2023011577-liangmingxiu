import { Router } from 'express'
import {
  createPoint,
  deletePoint,
  getLayers,
  updatePoint
} from '../controllers/knowledgeController.js'

const router = Router()

router.get('/layers', getLayers)
router.post('/layers/:layerId/points', createPoint)
router.put('/layers/:layerId/points/:pointId', updatePoint)
router.delete('/layers/:layerId/points/:pointId', deletePoint)

export default router
