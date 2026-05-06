import prisma from '../../config/prisma';

export const subscribeNewsletterService = async (email: string) => {
  return await prisma.newsletter_subscribers.upsert({
    where: { email },
    update: {}, // Do nothing if already subscribed
    create: { email },
  });
};

export const getAllSubscribersService = async () => {
  return await prisma.newsletter_subscribers.findMany({
    orderBy: { subscribed_at: 'desc' },
  });
};

export const unsubscribeNewsletterService = async (email: string) => {
  return await prisma.newsletter_subscribers.delete({
    where: { email },
  });
};
