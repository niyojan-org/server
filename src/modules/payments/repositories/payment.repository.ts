import { ClientSession } from 'mongoose';
import { ObjectId } from '@helpers/zod';
import { IPayment, PaymentDocument, PaymentModel } from '../schemas/payment.schema';
import { PaymentStatus } from '../types/payment.enums';

class PaymentRepository {
	static async createPayment(
		data: Partial<IPayment>,
		session?: ClientSession,
	): Promise<PaymentDocument> {
		const payment = new PaymentModel(data);
		return payment.save({ session });
	}

	static async findById(id: ObjectId | string) {
		return PaymentModel.findById(id);
	}

	static async findByPaymentReference(reference: string) {
		return PaymentModel.findOne({ paymentReference: reference });
	}

	static async findByGatewayPaymentId(gatewayPaymentId: string) {
		return PaymentModel.findOne({ gatewayPaymentId });
	}

	static async findByGatewayOrderId(gatewayOrderId: string) {
		return PaymentModel.findOne({ gatewayOrderId });
	}

	static async updateStatus(
		paymentId: ObjectId | string,
		status: PaymentStatus,
		session?: ClientSession,
	) {
		return PaymentModel.findByIdAndUpdate(
			paymentId,
			{ status },
			{ new: true, session },
		);
	}

	static async markCaptured(
		paymentId: ObjectId | string,
		paidAt: Date,
		session?: ClientSession,
	) {
		return PaymentModel.findByIdAndUpdate(
			paymentId,
			{ status: PaymentStatus.SUCCESS, paidAt },
			{ new: true, session },
		);
	}

	static async markFailed(
		paymentId: ObjectId | string,
		failedAt: Date,
		session?: ClientSession,
	) {
		return PaymentModel.findByIdAndUpdate(
			paymentId,
			{ status: PaymentStatus.FAILED, failedAt },
			{ new: true, session },
		);
	}

	static async markRefunded(
		paymentId: ObjectId | string,
		refundedAt: Date,
		session?: ClientSession,
	) {
		return PaymentModel.findByIdAndUpdate(
			paymentId,
			{ status: PaymentStatus.REFUNDED, refundedAt },
			{ new: true, session },
		);
	}

	static async updateGatewayPaymentId(
		paymentId: ObjectId | string,
		gatewayPaymentId: string,
		session?: ClientSession,
	) {
		return PaymentModel.findByIdAndUpdate(
			paymentId,
			{ gatewayPaymentId },
			{ new: true, session },
		);
	}

	static async updateRawGatewayResponse(
		paymentId: ObjectId | string,
		payload: Record<string, unknown>,
		session?: ClientSession,
	) {
		return PaymentModel.findByIdAndUpdate(
			paymentId,
			{ rawPaymentGatewayResponse: payload },
			{ new: true, session },
		);
	}
}

export default PaymentRepository;
