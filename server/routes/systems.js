import express from 'express';
import { Sequelize } from 'sequelize';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { System } = req.app.get('models');
    
    const systems = await System.findAll({
      attributes: ['id', 'topic'],
      order: [['topic', 'ASC']]
    });
    
    res.json(systems);
  } catch (error) {
    next(error);
  }
});

export default router;