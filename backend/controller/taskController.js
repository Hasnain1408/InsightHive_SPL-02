import Task from '../models/taskTable.js';
import User from "../models/userTable.js";
import Task from "../models/taskTable.js";
import User from "../models/userTable.js"; // Import User model to get gig workers
//import Incentive from "../models/incentive&ratingTable.js"
import { sendNotification } from "../socket/socket.js"; // Import WebSocket function
import { sendTaskEmailNotification } from "../utils/emailSender.js"; // Import email function

export const tasksAcceptedByWorkers = async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const email = req.params.email; // Worker email

    // Find the task by ID
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the email exists in selectedWorkers
    const selectedWorker = task.selectedWorkers.find(worker => worker.email === email);

    if (!selectedWorker) {
      return res.status(404).json({ error: 'Worker not found in selectedWorkers' });
    }

    // Check if the worker is already in acceptedByWorkers
    const isAlreadyAccepted = task.acceptedByWorkers.some(worker => worker.email === email);

    if (isAlreadyAccepted) {
      return res.status(400).json({ error: 'Worker already accepted the task' });
    }

    // Check if the worker is in rejectedByWorkers
    const isRejected = task.rejectedByWorkers.some(worker => worker.email === email);

    if (isRejected) {
      // Remove the worker from rejectedByWorkers
      task.rejectedByWorkers = task.rejectedByWorkers.filter(worker => worker.email !== email);
    }

    // Add the worker to the acceptedByWorkers array
    task.acceptedByWorkers.push({
      workerId: selectedWorker.workerId,
      email: selectedWorker.email,
    });

    // Save the updated task
    await task.save();

    res.status(200).json({ message: 'Worker accepted the task successfully', task });
  } catch (err) {
    console.error('Error accepting task:', err);
    res.status(500).json({ error: err.message });
  }
};

export const tasksRejectedByWorkers = async (req, res) => {
  try {
    const { id } = req.params; // Task ID
    const email = req.params.email; // Worker email

    // Find the task by ID
    const task = await Task.findById(id);

    console.log(task);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if the email exists in selectedWorkers
    const selectedWorker = task.selectedWorkers.find(worker => worker.email === email);

    if (!selectedWorker) {
      return res.status(404).json({ error: 'Worker not found in selectedWorkers' });
    }

    const isAlreadyRejected = task.rejectedByWorkers.some(worker => worker.email === email);

    if (isAlreadyRejected) {
      return res.status(400).json({ error: 'Worker already rejected the task' });
    }

    // Check if the worker is in rejectedByWorkers
    const isAccepted = task.acceptedByWorkers.some(worker => worker.email === email);

    if (isAccepted) {
      // Remove the worker from rejectedByWorkers
      task.rejectedByWorkers = task.acceptedByWorkers.filter(worker => worker.email !== email);
    }

    // Add the worker to the acceptedByWorkers array
    task.rejectedByWorkers.push({
      workerId: selectedWorker.workerId,
      email: selectedWorker.email,
    });

    // Save the updated task
    await task.save();

    res.status(200).json({ message: 'Worker rejected the task successfully', task });
  } catch (err) {
    console.error('Error accepting task:', err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch all tasks by company email
export const getAllTasksByCompanyId = async (req, res) => {
  try {
    const email = req.params.email; // Get email from query parameters

    // Find the user by email to get the companyId
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch all tasks that belong to the companyId
    const tasks = await Task.find({ companyId: user._id });

    res.status(200).json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch tasks by Id or email
  export const getTasksById = async (req, res) => {
    try {
      const email = req.params.email; // Get email from query parameters

      console.log(email);

      if (!email) {
        return  res.status(400).json({ error: "Email is required" });
      }

     const tasks = await Task.find({
     'selectedWorkers.email': email,
      'acceptedByWorkers.email': { $ne: email },
      'rejectedByWorkers.email': { $ne: email },
     });

      res.status(200).json(tasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      res.status(500).json({ error: err.message });
    }
  };

// Haversine formula to calculate distance between two geo coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ/2) * Math.sin(Δφ/2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ/2) * Math.sin(Δλ/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  console.log(R * c);

  return R * c; // Distance in kilometers
}

// Custom Heap class for storing nearest gig workers
class NearestWorkersHeap {
  constructor(maxSize = 3) {
    this.maxSize = maxSize;
    this.heap = [];
  }

  insert(worker, distance) {
    const entry = { worker, distance };

    if (this.heap.length < this.maxSize) {
      this.heap.push(entry);
      this.bubbleUp(this.heap.length - 1);
    }
    else if (distance < this.heap[0].distance) {
      this.heap[0] = entry;
      this.bubbleDown(0);
    }
  }

  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].distance > this.heap[index].distance) {
        [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  bubbleDown(index) {
    const lastIndex = this.heap.length - 1;
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild <= lastIndex &&
          this.heap[leftChild].distance < this.heap[smallest].distance) {
        smallest = leftChild;
      }

      if (rightChild <= lastIndex &&
          this.heap[rightChild].distance < this.heap[smallest].distance) {
        smallest = rightChild;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }

  getNearestWorkers() {
    return this.heap
      .sort((a, b) => a.distance - b.distance)
      .map(entry => ({
        worker: entry.worker,
        distance: entry.distance
      }));
  }
}

// Enhanced sendNotification function (implement based on your notification system)
const sendNotification = async (workers, task) => {
  try {
    console.log("Sending notifications to nearest workers");

    workers.forEach(({ worker, distance }) => {
      console.log(`Sending notification to worker: ${worker.email} (Distance: ${distance.toFixed(2)} km)`);
      // Example notification logic
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};

export const createTask = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Empty request body" });
    }

    console.log("Request body:", req.body);

    // Validate and convert deadline
    const deadline = req.body.deadline ? new Date(req.body.deadline) : null;

    if (deadline && isNaN(deadline.getTime())) {
      return res.status(400).json({ error: "Invalid deadline format" });
    }

    // Validate task location
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Task location (latitude and longitude) is required" });
    }

    // Create new task
    const newTask = new Task({ ...req.body, deadline });
    await newTask.save();

    // Find all gig workers
    const gigWorkers = await User.find({ role: "Gig Worker" });

    // Create heap for storing nearest workers
    const nearestWorkersHeap = new NearestWorkersHeap();

    // Calculate distances and insert into heap
    gigWorkers.forEach(worker => {
      // Check if worker has location
      if (worker.latitude && worker.longitude) {
        const distance = calculateDistance(
          latitude,
          longitude,
          worker.latitude,
          worker.longitude
        );

        nearestWorkersHeap.insert(worker, distance);
      }
    });

    // Get nearest workers with their distances
    const nearestWorkers = nearestWorkersHeap.getNearestWorkers();

    // Update task with selected workers
    newTask.selectedWorkers = nearestWorkers.map(({ worker, distance }) => ({
      workerId: worker._id,
      email: worker.email,
      distance: distance
    }));
    await newTask.save();


    // Detailed logging of nearest workers
    console.log("\n--- Nearest Gig Workers ---");
    nearestWorkers.forEach(({ worker, distance }, index) => {
      console.log(`${index + 1}. Email: ${worker.email}, Distance: ${distance.toFixed(2)} km`);
    });
    console.log("-------------------------\n");

    // Send email notifications to nearest workers
    if (nearestWorkers.length > 0) {
      // Extract emails of nearest workers
      const nearestWorkerEmails = nearestWorkers.map(({ worker }) => worker.email);

      // Send email to nearest workers
      await sendTaskEmailNotification(nearestWorkerEmails, newTask);

      // Send real-time notifications
      await sendNotification(nearestWorkers, newTask);
    }

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
      nearestWorkers: nearestWorkers.map(({ worker, distance }) => ({
        email: worker.email,
        distance: `${distance.toFixed(2)} km`
      })),
      nearestWorkersNotified: nearestWorkers.length
    // Send real-time notification to all gig workers
    sendNotification({
      title: "New Task Available",
      message: `Task: ${newTask.title} is available!`,
      taskId: newTask._id,
    });

  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({
      error: "Failed to create task",
      details: err.message,
    });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, shopName, incentive, deadline, status, latitude, longitude } = req.body;

  console.log(id);

  try {
    // Validate the deadline field
    if (deadline && isNaN(Date.parse(deadline))) {
      return res.status(400).json({ error: 'Invalid deadline format' });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { title, description, shopName, incentive, deadline, status, latitude, longitude },
      { new: true } // Return the updated task
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task', details: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  const { id } = req.params; // Extract the task ID from the URL
  const { id } = req.params;

  console.log('your task id is:', id);
  console.log('Deleting task with ID:', id);

  try {
    const deletedTask = await Task.findByIdAndDelete(id);

    console.log(deletedTask);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task', details: error.message });
  }
};



// Task completion handler
export const completeTask = async (req, res) => {
  try {
    const { taskId, workerId, rating, feedback } = req.body;

    // Update task status
    const task = await Task.findByIdAndUpdate(taskId, { status: "Completed" }, { new: true });
    if (!task) return res.status(404).json({ error: "Task not found" });

    // Issue incentive
    const incentive = new Incentive({ workerId, taskId, amount: task.incentive });
    await incentive.save();

    // Rate worker
    const ratingEntry = new Rating({ workerId, taskId, rating, feedback, ratedBy: req.user.id });
    await ratingEntry.save();

    res.status(200).json({ message: "Task completed, incentive issued, and worker rated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to complete task", details: error.message });
  }
};

