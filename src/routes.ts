import { authRoutes } from '@modules/auth';
import { domainRoutes } from '@modules/domain';
import eventRoutes from '@modules/events/routes';
import organizationRoutes from '@modules/organization/routes';
import userRouter from '@modules/user/user.routes';
import notificationRoutes from '@modules/notifications/routes/notification.routes';
import resourceRotes from '@modules/resource/resource.routes';
import { Router } from 'express';
import paymentRoutes from '@modules/payments/routes/payment.routes';
import webhookRoutes from '@modules/payments/routes/webhook.routes';
import feeConfigRoutes from '@modules/payments/routes/payment-fee.routes';
import walletRoutes from '@modules/wallet/routes';
import settlementRoutes from '@modules/settlements/routes/settlement.routes';
import payoutRoutes from '@modules/payouts/routes/payout.routes';
import registrationRoutes from '@modules/registration/routes/registration.routes';
import designTemplateRoutes from '@modules/design-template/routes/design-template.routes';

const mainRoutes = Router();

mainRoutes.use('/auth', authRoutes);
mainRoutes.use('/users', userRouter);
mainRoutes.use('/user', userRouter);
mainRoutes.use('/domains', domainRoutes);
mainRoutes.use('/events', eventRoutes);
mainRoutes.use('/organizations', organizationRoutes);
mainRoutes.use('/org', organizationRoutes);
mainRoutes.use('/notifications', notificationRoutes);
mainRoutes.use('/resources', resourceRotes);
mainRoutes.use('/payments', paymentRoutes);
mainRoutes.use('/payments/fees', feeConfigRoutes);
mainRoutes.use('/webhooks', webhookRoutes);
mainRoutes.use('/wallets', walletRoutes);
mainRoutes.use('/settlements', settlementRoutes);
mainRoutes.use('/payouts', payoutRoutes);
mainRoutes.use('/registrations', registrationRoutes);
mainRoutes.use('/design-templates', designTemplateRoutes);

export default mainRoutes;
