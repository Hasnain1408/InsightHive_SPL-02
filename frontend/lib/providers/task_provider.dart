import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/task_model.dart';

final taskProvider = StateNotifierProvider<TaskNotifier, List<Task>>((ref) {
  return TaskNotifier();
});

class TaskNotifier extends StateNotifier<List<Task>> {
  //final String baseUrl = 'http://192.168.0.101:3005';
  final String baseUrl = 'http://localhost:3005';

  TaskNotifier() : super([]);

  // Fetch all tasks from the backend
  Future<void> fetchTasksByCompanyId(String userEmail) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/task/taskListByCompanyId/$userEmail'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> taskList = json.decode(response.body);
        state = taskList.map((task) => Task.fromJson(task)).toList();
      } else {
        throw Exception('Failed to fetch tasks: ${response.body}');
      }
    } catch (error) {
      print('Error fetching tasks: $error');
      rethrow;
    }
  }

  Future<void> fetchTasksById(String userEmail) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/task/taskListById/$userEmail'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> taskList = json.decode(response.body);
        state = taskList.map((task) => Task.fromJson(task)).toList();
      } else {
        throw Exception('Failed to fetch tasks: ${response.body}');
      }
    } catch (error) {
      print('Error fetching tasks: $error');
      rethrow;
    }
  }

  // Create a new task
  Future<void> createTask(Task task) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/task/taskCreate/'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(task.toJson()),
      );

      if (response.statusCode == 201) {
        state = [...state, task];
      } else {
        throw Exception('Failed to create task: ${response.body}');
      }
    } catch (error) {
      print('Error creating task: $error');
      rethrow;
    }
  }

  // Update an existing task
  Future<void> updateTask(Task task) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/task/taskUpdate/${task.id}'), // Use POST instead of PUT
        headers: {'Content-Type': 'application/json'},
        body: json.encode(task.toJson()),
      );

      if (response.statusCode == 200) {
        // Update the task in the state
        state = state.map((t) => t.id == task.id ? task : t).toList();
      } else {
        throw Exception('Failed to update task: ${response.body}');
      }
    } catch (error) {
      print('Error updating task: $error');
      rethrow;
    }
  }

  // Delete a task
  Future<void> deleteTask(String taskId) async {
    try {
      final response = await http.delete(
        Uri.parse('$baseUrl/task/taskDelete/$taskId'),
        body: json.encode({}), // You can pass an empty body or additional data if needed
      );

      print(response.body);

      if (response.statusCode == 200) {
        // Remove the task from the state
        state = state.where((t) => t.id != taskId).toList();
      } else {
        throw Exception('Failed to delete task: ${response.body}');
      }
    } catch (error) {
      print('Error deleting task: $error');
      rethrow;
    }
  }

  // Optional: Fetch tasks filtered by status (e.g., "available" tasks for gig workers)
  Future<void> fetchTasksByStatus(String status) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/task/taskList/?status=$status'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> taskList = json.decode(response.body);
        state = taskList.map((task) => Task.fromJson(task)).toList();
      } else {
        throw Exception('Failed to fetch tasks by status: ${response.body}');
      }
    } catch (error) {
      print('Error fetching tasks by status: $error');
      rethrow;
    }
  }

  // Optional: Fetch tasks filtered by location (e.g., tasks near the gig worker)
  Future<void> fetchTasksByLocation(String location) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/task/taskList/?location=$location'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> taskList = json.decode(response.body);
        state = taskList.map((task) => Task.fromJson(task)).toList();
      } else {
        throw Exception('Failed to fetch tasks by location: ${response.body}');
      }
    } catch (error) {
      print('Error fetching tasks by location: $error');
      rethrow;
    }
  }
}