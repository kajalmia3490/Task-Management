import { createContext, useState, useEffect } from "react";

export const TaskContext = createContext();

export default function TaskProvider({ children }) {
    // Tasks
    const [tasks, setTasks] = useState(
        () => JSON.parse(localStorage.getItem("tasks")) || []
    );

    // Archived Tasks
    const [archivedTasks, setArchivedTasks] = useState(
        () => JSON.parse(localStorage.getItem("archivedTasks")) || []
    );

    // Notifications
    const [notifications, setNotifications] = useState(
        () => JSON.parse(localStorage.getItem("notifications")) || []
    );

    // Persist tasks, archivedTasks, notifications to localStorage
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem("archivedTasks", JSON.stringify(archivedTasks));
    }, [archivedTasks]);

    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    // --------------------
    // TASK FUNCTIONS
    // --------------------

    // Add new task
    const addTask = (task) => {
        setTasks((prev) => [...prev, { ...task, attachments: [] }]);
        addNotification(`Task "${task.title}" created by ${task.user || "You"}`);
    };

    // Edit existing task
    const editTask = (taskId, updatedTask) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t))
        );

        const task = tasks.find((t) => t.id === taskId);
        if (task) addNotification(`Task "${task.title}" updated`);
    };

    // Delete task
    const deleteTask = (taskId) => {
        const task = tasks.find((t) => t.id === taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        if (task) addNotification(`Task "${task.title}" deleted`);
    };

    // Update task status (e.g., In Progress → Completed)
    const updateTaskStatus = (taskId, status) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status } : t))
        );

        const task = tasks.find((t) => t.id === taskId);
        if (task) addNotification(`Task "${task.title}" marked ${status}`);

        if (status === "Completed" && task) {
            addNotification(
                `completed "${task.title}"`,
                "success",
                task.id
            );
        }

        if (status === "In Progress" && task) {
            addNotification(
                `moved "${task.title}" back to In Progress`,
                "info",
                task.id
            );
        }

    };

    // Archive task (move to archivedTasks)
    const archiveTask = (taskId) => {
        const taskToArchive = tasks.find((t) => t.id === taskId);
        if (!taskToArchive) return;

        setArchivedTasks((prev) => [
            ...prev,
            { ...taskToArchive, archivedAt: new Date() },
        ]);

        deleteTask(taskId);
        addNotification(`Task "${taskToArchive.title}" archived`);
    };

    // --------------------
    // ATTACHMENTS
    // --------------------
    const addAttachment = (taskId, file) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            setTasks((prev) =>
                prev.map((t) =>
                    t.id === taskId
                        ? {
                            ...t,
                            attachments: [
                                ...(t.attachments || []),
                                { name: file.name, data: base64 },
                            ],
                        }
                        : t
                )
            );

            const task = tasks.find((t) => t.id === taskId);
            if (task) addNotification(`Attachment "${file.name}" added to "${task.title}"`);
        };
        reader.readAsDataURL(file);
    };

    // --------------------
    // NOTIFICATIONS
    // --------------------
    const addNotification = (message, type = "info", taskId = null) => {
        const newNotification = {
            id: Date.now(),
            message,
            type, // success | info | warning
            taskId,
            seen: false,
            createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
    };

    const markNotificationSeen = (id) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, seen: true } : n))
        );
    };

    // remove attachement file
    const removeAttachment = (taskId, indexToRemove) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        attachments: task.attachments.filter(
                            (_, index) => index !== indexToRemove
                        )
                    }
                    : task
            )
        );
    };


    return (
        <TaskContext.Provider
            value={{
                tasks,
                addTask,
                editTask,
                deleteTask,
                updateTaskStatus,
                archiveTask,
                addAttachment,
                notifications,
                addNotification,
                markNotificationSeen,
                archivedTasks,
                removeAttachment,
            }}
        >
            {children}
        </TaskContext.Provider>
    );
}
