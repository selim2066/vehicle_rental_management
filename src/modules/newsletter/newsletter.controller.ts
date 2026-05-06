import { Request, Response, NextFunction } from 'express';
import {
  subscribeNewsletterService,
  getAllSubscribersService,
  unsubscribeNewsletterService,
} from './newsletter.service';

export const subscribeNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    await subscribeNewsletterService(email.toLowerCase());
    res.status(200).json({ success: true, message: 'Subscribed to newsletter successfully.' });
  } catch (err) {
    next(err);
  }
};

export const getAllSubscribers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscribers = await getAllSubscribersService();
    res.status(200).json({ success: true, data: subscribers });
  } catch (err) {
    next(err);
  }
};

export const unsubscribeNewsletter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    await unsubscribeNewsletterService(email.toLowerCase());
    res.status(200).json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (err) {
    next(err);
  }
};
