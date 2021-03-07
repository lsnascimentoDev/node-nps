import { resolve } from 'path';
import UserRepository from "../repositories/UserRepository"
import SurveysRepository from "../repositories/SurveysRepository"
import SurveysUsersRepository from "../repositories/SurveysUsersRepository";
import { Request, Response, response } from 'express'
import { getCustomRepository } from "typeorm";
import SendMailService from "../services/SendMailService";
import { AppError } from '../errors/AppError';


class SendMailController {
  async execute(req: Request, res: Response) {
    const { email, survey_id } = req.body;

    const usersRepository = getCustomRepository(UserRepository);
    const surveysRepository = getCustomRepository(SurveysRepository);
    const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

    const user = await usersRepository.findOne({ email });

    if (!user) {
      throw new AppError("User does not exists");
    }

    const survey = await surveysRepository.findOne({ id: survey_id });

    if (!survey) {
      throw new AppError("Survey does not exists");
    }

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

    const surveyUsersAlreadyExists = await surveysUsersRepository.findOne({
      where: { user_id: user.id, value: null },
      relations: ["user", "survey"],
    });

    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL,
    }

    if (surveyUsersAlreadyExists) {
      variables.id = surveyUsersAlreadyExists.id;
      await SendMailService.execute(email, survey.title, variables, npsPath);
      return res.json(surveyUsersAlreadyExists)
    }


    //Cria o objeto/instancia
    const surveyUser = await surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    });
    //Salva as informações na tabela SurveyUser
    await surveysUsersRepository.save(surveyUser);

    //Enviar email para o usuário
    variables.id = surveyUser.id;
    await SendMailService.execute(email, survey.title, variables, npsPath);

    res.json(surveyUser);

  }
}

export default SendMailController;