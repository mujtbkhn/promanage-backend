const { Todo } = require("../models/todo");

const authorizeTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.email;

        const todo = await Todo.findById(id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.assignedTo !== userId) {
            return res.status(403).json({ message: 'You do not have permission to access this task' });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = authorizeTask;
