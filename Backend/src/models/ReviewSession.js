const mongoose = require('mongoose');

const reviewSessionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		noteId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Note',
			default: null,
		},
		dateKey: {
			type: String,
			required: true,
			trim: true,
		},
		sessionNumber: {
			type: Number,
			required: true,
			min: 1,
		},
		sessionLabel: {
			type: String,
			required: true,
			trim: true,
		},
		correct: {
			type: Number,
			default: 0,
		},
		partial: {
			type: Number,
			default: 0,
		},
		incorrect: {
			type: Number,
			default: 0,
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

reviewSessionSchema.index({ userId: 1, dateKey: 1, createdAt: -1 });

module.exports = mongoose.model('ReviewSession', reviewSessionSchema);