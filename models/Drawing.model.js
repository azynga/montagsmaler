const { Schema, model } = require('mongoose');

const drawingSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    word: String,
    url: String,
    isPublic: Boolean
},
{
    timestamps: true
});

const Drawing = model('Drawing', drawingSchema);

module.exports = Drawing;