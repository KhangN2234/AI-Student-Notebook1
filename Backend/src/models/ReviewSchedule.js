const mongoose = require('mongoose');

const reviewScheduleSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		dateKey: {
			type: String,
			required: true,
			trim: true,
		},
		count: {
			type: Number,
			required: true,
			min: 1,
		},
		noteId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Note',
			default: null,
		},
	},
	{
		timestamps: true,
		versionKey: false,
		toJSON: {
			virtuals: true,
			transform: (_doc, ret) => {
				ret.id = ret._id.toString();
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
		toObject: {
			virtuals: true,
			transform: (_doc, ret) => {
				ret.id = ret._id.toString();
				delete ret._id;
				delete ret.__v;
				return ret;
			},
		},
	}
);

reviewScheduleSchema.index({ userId: 1, dateKey: 1, createdAt: -1 });

module.exports = mongoose.model('ReviewSchedule', reviewScheduleSchema);