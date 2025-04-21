#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Constants
const TASKS_FILE = path.join(__dirname, 'tasks.json');

// Initialize tasks file if it doesn't exist
if (!fs.existsSync(TASKS_FILE)) {
    fs.writeFileSync(TASKS_FILE, '[]', 'utf8');
}

// Helper functions
function readTasks() {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tasks file:', error.message);
        process.exit(1);
    }
}

function writeTasks(tasks) {
    try {
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing to tasks file:', error.message);
        process.exit(1);
    }
}

function getNextId(tasks) {
    return tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
}

function printTask(task) {
    console.log(`ID: ${task.id}`);
    console.log(`Description: ${task.description}`);
    console.log(`Status: ${task.status}`);
    console.log('---------------------');
}

// Command handlers
function addTask(description) {
    if (!description) {
        console.error('Error: Task description is required');
        process.exit(1);
    }

    const tasks = readTasks();
    const newTask = {
        id: getNextId(tasks),
        description,
        status: 'todo'
    };

    tasks.push(newTask);
    writeTasks(tasks);
    console.log(`Task added successfully (ID: ${newTask.id})`);
}

function updateTask(id, newDescription) {
    if (!id || !newDescription) {
        console.error('Error: Task ID and new description are required');
        process.exit(1);
    }

    const tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === parseInt(id));

    if (taskIndex === -1) {
        console.error(`Error: Task with ID ${id} not found`);
        process.exit(1);
    }

    tasks[taskIndex].description = newDescription;
    writeTasks(tasks);
    console.log(`Task ${id} updated successfully`);
}

function deleteTask(id) {
    if (!id) {
        console.error('Error: Task ID is required');
        process.exit(1);
    }

    const tasks = readTasks();
    const filteredTasks = tasks.filter(task => task.id !== parseInt(id));

    if (tasks.length === filteredTasks.length) {
        console.error(`Error: Task with ID ${id} not found`);
        process.exit(1);
    }

    writeTasks(filteredTasks);
    console.log(`Task ${id} deleted successfully`);
}

function markTask(id, status) {
    if (!id) {
        console.error('Error: Task ID is required');
        process.exit(1);
    }

    const validStatuses = ['todo', 'in-progress', 'done'];
    if (!validStatuses.includes(status)) {
        console.error('Error: Invalid status. Must be one of: todo, in-progress, done');
        process.exit(1);
    }

    const tasks = readTasks();
    const taskIndex = tasks.findIndex(task => task.id === parseInt(id));

    if (taskIndex === -1) {
        console.error(`Error: Task with ID ${id} not found`);
        process.exit(1);
    }

    tasks[taskIndex].status = status;
    writeTasks(tasks);
    console.log(`Task ${id} marked as ${status}`);
}

function listTasks(filter) {
    const tasks = readTasks();
    let filteredTasks = tasks;

    if (filter) {
        const validFilters = ['todo', 'in-progress', 'done'];
        if (!validFilters.includes(filter)) {
            console.error('Error: Invalid filter. Must be one of: todo, in-progress, done');
            process.exit(1);
        }
        filteredTasks = tasks.filter(task => task.status === filter);
    }

    if (filteredTasks.length === 0) {
        const message = filter ? `No ${filter} tasks found` : 'No tasks found';
        console.log(message);
        return;
    }

    filteredTasks.forEach(printTask);
}

// Main command router
function main() {
    const [,, command, ...args] = process.argv;

    switch (command) {
        case 'add':
            addTask(args.join(' '));
            break;
        case 'update':
            if (args.length < 2) {
                console.error('Error: update command requires ID and new description');
                process.exit(1);
            }
            updateTask(args[0], args.slice(1).join(' '));
            break;
        case 'delete':
            deleteTask(args[0]);
            break;
        case 'mark-in-progress':
            markTask(args[0], 'in-progress');
            break;
        case 'mark-done':
            markTask(args[0], 'done');
            break;
        case 'list':
            listTasks(args[0]);
            break;
        default:
            console.log('Available commands:');
            console.log('  add "description" - Add a new task');
            console.log('  update id "new description" - Update a task');
            console.log('  delete id - Delete a task');
            console.log('  mark-in-progress id - Mark task as in progress');
            console.log('  mark-done id - Mark task as done');
            console.log('  list [status] - List all tasks or filter by status (todo, in-progress, done)');
    }
}

main();