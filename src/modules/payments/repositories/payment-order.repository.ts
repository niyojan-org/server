import { ClientSession } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import {
	IPaymentOrder,
	PaymentOrderDocument,
	PaymentOrderModel,
} from '../schemas/payment-order.schema';
import { PaymentOrderStatus } from '../types/payment-order.enums';

class PaymentOrderRepository {
	static async createPaymentOrder(
		data: Partial<IPaymentOrder>,
		session?: ClientSession,
	): Promise<PaymentOrderDocument> {
		const order = new PaymentOrderModel(data);
		return order.save({ session });
	}

	static async findById(id: ObjectId | string) {
		return PaymentOrderModel.findById(id);
	}

	static async findByGatewayOrderId(gatewayOrderId: string) {
		return PaymentOrderModel.findOne({ gatewayOrderId });
	}

	static async updateStatus(
		orderId: ObjectId | string,
		status: PaymentOrderStatus,
		session?: ClientSession,
	) {
		return PaymentOrderModel.findByIdAndUpdate(
			orderId,
			{ status },
			{ new: true, session },
		);
	}

	static async markPaid(
		orderId: ObjectId | string,
		paidAt: Date,
		session?: ClientSession,
	) {
		return PaymentOrderModel.findByIdAndUpdate(
			orderId,
			{ status: PaymentOrderStatus.PAID, paidAt },
			{ new: true, session },
		);
	}

	static async markFailed(
		orderId: ObjectId | string,
		failedAt: Date,
		reason?: string,
		session?: ClientSession,
	) {
		return PaymentOrderModel.findByIdAndUpdate(
			orderId,
			{ status: PaymentOrderStatus.FAILED, failedAt, failureReason: reason },
			{ new: true, session },
		);
	}
}

export default PaymentOrderRepository;
