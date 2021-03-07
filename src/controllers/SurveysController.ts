import { Request, Response, response } from 'express';
import { getCustomRepository } from 'typeorm';
import SurveysRepository from '../repositories/SurveysRepository';

class SurveysController {

  async create(req: Request, res: Response) {
    const { title, description } = req.body;

    const surveysRepository = getCustomRepository(SurveysRepository);

    const surveys = await surveysRepository.create({ title, description });

    await surveysRepository.save(surveys);

    return res.json(surveys);

  }

  async show(req: Request, res: Response) {

    const surveysRepository = getCustomRepository(SurveysRepository);

    const all = await surveysRepository.find();

    return res.status(201).json(all);

  }
}

export default SurveysController;