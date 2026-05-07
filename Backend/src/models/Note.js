const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
		folderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Folder',
			default: null,
		},
		summary: {
			type: String,
			default: null,
			trim: true,
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

noteSchema.index({ folderId: 1, createdAt: -1 });
noteSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Note', noteSchema);
