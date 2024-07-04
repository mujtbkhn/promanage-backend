const AllowedEmail = require('../models/Allowed');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { getDateRange } = require('../utils/dateFilters');
const moment = require('moment');

const createTodo = async (req, res, next) => {
    try {
        const { title, priority, assignedTo, checklist, dueDate, section } = req.body;
        const userId = req.user.userId;

        if (!title || !priority || !checklist) {
            return res.status(400).json({
                message: 'Title, priority, and checklist are required'
            });
        }

        // Validate assignedTo email if provided
        if (assignedTo) {
            const allowedEmail = await AllowedEmail.findOne({ email: assignedTo });
            if (!allowedEmail) {
                return res.status(400).json({ message: 'Assigned user email is not allowed' });
            }
        }

        // Parse dueDate if provided and validate format
        let parsedDueDate;
        if (dueDate) {
            parsedDueDate = moment(dueDate, 'DD-MM-YY').toDate();
            if (!parsedDueDate) {
                return res.status(400).json({
                    message: 'Invalid due date format. Please use DD-MM-YY.'
                });
            }
        }

        const newTodo = new Todo({
            title,
            priority,
            assignedTo,
            checklist,
            dueDate: parsedDueDate,
            section,
            userId
        });

        await newTodo.save();
        res.json({
            message: 'Todo created successfully',
            todo: newTodo
        });
    } catch (error) {
        next(error);
    }
};

const logTodoById = async (req, res, next) => {
    try {
        const id = '6677c7d2f85295bf113a8556'; // The specific ID
        const todo = await Todo.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        console.log(todo); // Log the todo to the console
        res.json(todo); // Also return the todo as the response
    } catch (error) {
        next(error);
    }
};

const getTodoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userEmail = req.user?.email;

        const todo = await Todo.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const isCreator = todo.userId.toString() === userId;
        const isAssignee = todo.assignedTo === userEmail;

        res.json({
            todo,
            isCreator,
            isAssignee
        });
    } catch (error) {
        next(error);
    }
};

const viewTodoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const todo = await Todo.findById(id);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json(todo);
    } catch (error) {
        next(error);
    }
};

// const getTodos = async (req, res, next) => {
//     try {
//         const filter = req.query.filter || 'week';
//         const { startDate, endDate } = getDateRange(filter);
//         const userId = req.user.userId;
//         const userEmail = req.user.email;

//         // Fetch todos where the logged-in user is either the creator or assignedTo
//         const todos = await Todo.find({
//             $or: [
//                 { userId: userId },
//                 { assignedTo: userEmail }
//             ],
//             createdAt: { $gte: startDate, $lte: endDate }
//         });

// Filter todos where assignedTo email is in AllowedEmail schema
// const allowedEmails = await AllowedEmail.find({}, { email: 1 });
// const allowedEmailList = allowedEmails.map(entry => entry.email);

// const filteredTodos = todos.filter(todo => {
//     // Check if assignedTo email is in allowedEmailList
//     return allowedEmailList.includes(todo.assignedTo);
// });

//         res.json(todos);
//     } catch (error) {
//         next(error);
//     }
// };

const getTodos = async (req, res, next) => {
    try {
        const filter = req.query.filter || 'week';
        const { startDate, endDate } = getDateRange(filter);
        const userId = req.user.userId;
        const userEmail = req.user.email;

        // Fetch all allowed emails
        const allowedEmails = await AllowedEmail.find({}, { email: 1 });
        const allowedEmailList = allowedEmails.map(entry => entry.email);

        // Fetch todos where the logged-in user is either the creator or assignedTo
        const todos = await Todo.find({
            $or: [
                { userId: userId },
                { assignedTo: userEmail },
                { assignedTo: { $exists: false } } // Include todos without assignedTo
            ],
            createdAt: { $gte: startDate, $lte: endDate }
        });

        // Filter todos where assignedTo email is in AllowedEmail schema or doesn't exist
        const filteredTodos = todos.filter(todo => {
            return !todo.assignedTo || allowedEmailList.includes(todo.assignedTo);
        });

        res.json(filteredTodos);
    } catch (error) {
        next(error);
    }
};


const updateTodo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, priority, checklist, dueDate, section, assignedTo } = req.body;
        const todo = await Todo.findById(id);

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const userId = req.user.userId;

        // Allow only the creator of the todo to update the assignedTo field
        if (assignedTo && todo.userId.toString() === userId) {
            const user = await User.findOne({ email: assignedTo });
            if (!user) {
                return res.status(400).json({ message: 'Assigned user does not exist' });
            }
            todo.assignedTo = assignedTo;
        }

        if (title) todo.title = title;
        if (priority) todo.priority = priority;
        if (checklist) todo.checklist = checklist;
        if (dueDate) {
            const parsedDueDate = moment(dueDate, 'DD-MM-YY').toDate();
            if (!parsedDueDate) {
                return res.status(400).json({ message: 'Invalid due date format. Please use DD-MM-YY.' });
            }
            todo.dueDate = parsedDueDate;
        }
        if (section) todo.section = section;

        await todo.save();
        res.json({ message: 'Todo updated successfully', todo });
    } catch (error) {
        next(error);
    }
};

const updateChecklistItem = async (req, res, next) => {
    try {
        const { todoId, itemIndex } = req.params;
        const { completed } = req.body;

        const todo = await Todo.findById(todoId);
        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.checklist[itemIndex]) {
            todo.checklist[itemIndex].completed = completed;
            await todo.save();
            return res.json({ message: 'Checklist item updated successfully', todo });
        } else {
            return res.status(404).json({ message: 'Checklist item not found' });
        }
    } catch (error) {
        next(error);
    }
};

const deleteTodo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }
        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        next(error);
    }
};

const getTaskCounts = async (req, res, next) => {
    try {
        const userId = req.user.userId;

        // Query to count tasks based on different criteria
        const backlogCount = await Todo.countDocuments({ userId: userId, section: 'BACKLOG' });
        const lowPriorityCount = await Todo.countDocuments({ userId: userId, priority: 'LOW' });
        const todoCount = await Todo.countDocuments({ userId: userId, section: 'TODO' });
        const highPriorityCount = await Todo.countDocuments({ userId: userId, priority: 'HIGH' });
        const inProgressCount = await Todo.countDocuments({ userId: userId, section: 'IN PROGRESS' });
        const moderatePriorityCount = await Todo.countDocuments({ userId: userId, priority: 'MODERATE' });
        const doneCount = await Todo.countDocuments({ userId: userId, section: 'DONE' });
        const dueDateCount = await Todo.countDocuments({ userId: userId, dueDate: { $exists: true } });

        // Construct response with counts
        const counts = {
            backlogTasks: backlogCount,
            lowPriorityTasks: lowPriorityCount,
            todoTasks: todoCount,
            highPriorityTasks: highPriorityCount,
            inProgressTasks: inProgressCount,
            moderatePriorityTasks: moderatePriorityCount,
            doneTasks: doneCount,
            dueDateTasks: dueDateCount
        };

        res.json(counts);
    } catch (error) {
        next(error);
    }
};

const moveTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { section } = req.body;

        const updatedTodo = await Todo.findByIdAndUpdate(
            id,
            { section },
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        res.json({
            message: 'Todo moved successfully',
            todo: updatedTodo
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createTodo, getTodoById, getTodos, updateTodo, deleteTodo, getTaskCounts, moveTask, logTodoById, updateChecklistItem, viewTodoById };
