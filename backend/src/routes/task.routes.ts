import express from 'express';
import TaskController from '../controllers/task.controller';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(protect); // All task routes are protected

router.route('/')
  .get(TaskController.getAll)
  .post(TaskController.create);

router.route('/:id')
  .get(TaskController.getOne)
  .put(TaskController.update)
  .delete(TaskController.delete);

export default router;
