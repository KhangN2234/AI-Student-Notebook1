const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
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

folderSchema.index({ createdAt: 1 });
folderSchema.index({ name: 1 });

module.exports = mongoose.model('Folder', folderSchema);
