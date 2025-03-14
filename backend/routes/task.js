import express from 'express';
import {
    getAllTasksByCompanyId,
    createTask, updateTask,
    deleteTask,
    getTasksById,
    tasksAcceptedByWorkers,
    tasksRejectedByWorkers,
    getRejectedTasks,
    getAcceptedTasks,
    getAcceptedTasksForCompany,
    getRejectedTasksForCompany,
    getAcceptedOrRejectedTasksForCompany,
    getFinishedTasksByCompanyId,
    getAssignableTasks,
    totalFinishedTasksByCompanyId,
    totalPendingTasksByCompanyId,
} from '../controller/taskController.js';

const router = express.Router();

// New route for fetching tasks with worker details (accepted or rejected)
router.get('/getAcceptedOrRejectedTasksForCompany/:email', getAcceptedOrRejectedTasksForCompany);

// Get all tasks each individual company
router.get('/taskListByCompanyId/:email', getAllTasksByCompanyId);

// Get tasks by Id or email
router.get('/taskListById/:email', getTasksById);

// update tasks which is accepted by gig workers
router.post('/:id/taskAccepted/:email', tasksAcceptedByWorkers)

// get tasks which is rejected
router.post('/:id/taskRejected/:email', tasksRejectedByWorkers)

// get tasks in company which is accepted by gig workers
router.post('/getAcceptedTasksForCompany/:email', getAcceptedTasksForCompany)

// get tasks in company which is rejected by gig workers
router.post('/getRejectedTasksForCompany/:email', getRejectedTasksForCompany)

// get tasks which is accepted
router.get('/getAcceptedTasks/:email', getAcceptedTasks)

// update tasks which is rejected by gig workers
router.get('/getRejectedTasks/:email', getRejectedTasks)

// Create a new task
router.post('/taskCreate/', createTask); // email send korte hobe company ar

// Update a task
router.post('/taskUpdate/:id', updateTask);

// Delete a task
router.delete('/taskDelete/:id', deleteTask);

// Add the new route for finished tasks
router.get('/finishedTasksByCompanyId/:email', getFinishedTasksByCompanyId);

// Add this route to task.js
router.get('/getAssignableTasks/:email', getAssignableTasks);

// Add this route to task.js
router.get('/totalFinishedTasksByCompanyId/:email', totalFinishedTasksByCompanyId);

// Add this route to task.js
router.get('/totalPendingTasksByCompanyId/:email', totalPendingTasksByCompanyId);

export default router;