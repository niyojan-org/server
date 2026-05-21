import { authenticate } from '@core/middlewares/auth.middleware';
import { organizationRole } from '@core/middlewares/organization.middleware';
import { isTaskMaster } from '@core/middlewares/taskmaster.middleware';
import express from 'express';
import * as adminController from './event.coupons.admin.controller';
import * as publicController from './event.coupons.public.controller';

const eventCouponsRouter = express.Router();
const adminRouter = express.Router({ mergeParams: true });
const publicRouter = express.Router({ mergeParams: true });
const tmRouter = express.Router({ mergeParams: true });

publicRouter.post('/validate', publicController.validateCoupon);

adminRouter.use(authenticate);
adminRouter.get('/', organizationRole('owner', 'admin', 'manager'), adminController.getAllEventCoupons);
adminRouter.get('/:couponId', organizationRole('owner', 'admin', 'manager'), adminController.getSingleEventCoupon);
adminRouter.post('/', organizationRole('owner', 'admin', 'manager'), adminController.addEventCoupon);
adminRouter.put('/:couponId', organizationRole('owner', 'admin', 'manager'), adminController.updateEventCoupon);
adminRouter.patch(
  '/:couponId/toggle-status',
  organizationRole('owner', 'admin', 'manager'),
  adminController.toggleEventCouponStatus,
);
adminRouter.delete('/:couponId', organizationRole('owner', 'admin'), adminController.deleteEventCoupon);

tmRouter.use(authenticate, isTaskMaster());
tmRouter.get('/', adminController.getAllEventCoupons);
tmRouter.get('/:couponId', adminController.getSingleEventCoupon);
tmRouter.post('/', adminController.addEventCoupon);
tmRouter.put('/:couponId', adminController.updateEventCoupon);
tmRouter.patch('/:couponId/toggle-status', adminController.toggleEventCouponStatus);
tmRouter.delete('/:couponId', adminController.deleteEventCoupon);

eventCouponsRouter.use('/:eventId/admin', adminRouter);
eventCouponsRouter.use('/:eventId/tm', tmRouter);
eventCouponsRouter.use('/:eventId', publicRouter);

export default eventCouponsRouter;
