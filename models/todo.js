const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },
    priority: {
        type: String,
        required: [true, 'Priority is required'],
        enum: ['HIGH', 'MODERATE', 'LOW']
    },
    assignedTo: {
        type: String,
        ref: 'User',
        validate: {
            validator: function (v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    checklist: {
        type: [{ item: String, completed: Boolean }],
        required: [true, 'Checklist is required']
    },
    date: {
        type: Date,
    },
    section: {
        type: String,
        enum: ['BACKLOG', 'TODO', 'IN PROGRESS', 'DONE'],
        default: 'TODO'
    }
}, { timestamps: true });

const Todo = mongoose.model('Todo', TodoSchema);
module.exports = { Todo };
