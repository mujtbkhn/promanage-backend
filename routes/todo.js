const express = require('express');
const { createTodo, getTodoById, updateTodo, deleteTodo, getTodos, getTaskCounts, moveTask, logTodoById, updateChecklistItem } = require('../controllers/todo');
const decodeJWT = require('../middlewares/decodeJWT');
const router = express.Router();

router.post('/create', decodeJWT, createTodo);
router.get('/getAll', decodeJWT,getTodos)
router.get('/get/:id', getTodoById);
router.put('/edit/:id', decodeJWT, updateTodo);
router.patch('/checklist/:todoId/:itemIndex', decodeJWT, updateChecklistItem);
router.delete('/delete/:id', decodeJWT, deleteTodo);
router.get('/analytics', decodeJWT, getTaskCounts);
router.patch('/move/:id', decodeJWT, moveTask)
router.get('/logTodo', decodeJWT, logTodoById); 

module.exports = router;