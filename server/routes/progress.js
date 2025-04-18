import express from 'express';
import { Sequelize } from 'sequelize';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { Question } = req.app.get('models');
    
    const totalCount = await Question.count();
    const updatedCount = await Question.count({
      where: { already_updated: true }
    });
    
    res.json({
      updatedCount,
      totalCount
    });
  } catch (error) {
    next(error);
  }
});

export default router;