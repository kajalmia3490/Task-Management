import { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { FolderContext } from "../context/FolderContext";
import { TaskContext } from "../context/TaskContext";
import { MdDelete, MdOutlineAddCircle } from "react-icons/md";
import { ImAttachment } from "react-icons/im";
import { BiSolidEdit } from "react-icons/bi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

export default function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const { folders, addFolder, activeFolder, setActiveFolder } = useContext(FolderContext);
    const {
        tasks,
        addTask,
        editTask,
        deleteTask,
        updateTaskStatus,
        // archiveTask,
        addAttachment,
        removeAttachment,
        notifications,
        markNotificationSeen,
        // archivedTasks,
    } = useContext(TaskContext);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [newFolder, setNewFolder] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [globalSearchTerm, setGlobalSearchTerm] = useState("");
    const [highlightTaskId, setHighlightTaskId] = useState(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [showAvatarDropdown, setShowAvatarDropdown] = useState(false);
    const [showTodayOnly, setShowTodayOnly] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const taskRefs = useRef({});

    // Tasks in the active folder
    const folderTasks = tasks.filter((task) => task.folderId === activeFolder?.id);

    // Filter tasks in the active folder
    const todayDate1 = new Date().toISOString().split("T")[0];

    const filteredTasks = folderTasks.filter((task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "All" || task.status === filterStatus;
        const matchesToday = showTodayOnly ? task.dueDate === todayDate1 : true;

        return matchesSearch && matchesStatus && matchesToday;
    });

    // Global search across all folders/projects
    const todayDate2 = new Date().toISOString().split("T")[0];

    const globalFilteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
            folders.find(f => f.id === task.folderId)
                ?.name.toLowerCase()
                .includes(globalSearchTerm.toLowerCase());

        const matchesToday = showTodayOnly
            ? task.dueDate === todayDate2
            : true;

        return matchesSearch && matchesToday;
    });

    // submit function
    const handleSubmit = (e) => {
        e.preventDefault();
        const taskData = {
            title: e.target.title.value,
            dueDate: e.target.dueDate.value,
        };

        if (editingTask) {
            editTask(editingTask.id, taskData);
        } else {
            addTask({
                id: Date.now(),
                ...taskData,
                status: "In Progress",
                folderId: activeFolder.id,
                user: user.name,
                attachments: [],
            });
        }

        setShowModal(false);
        setEditingTask(null);
    };

    // upload function
    const handleFileUpload = (e, taskId) => {
        const file = e.target.files[0];
        if (file) addAttachment(taskId, file);
    };

    // date function
    const isOverdue = (task) => {
        const today = new Date();
        const due = new Date(task.dueDate);
        return task.status !== "Completed" && due < today;
    };

    // notification func
    const handleNotificationClick = (notification) => {
        const task = tasks.find((t) => notification.message.includes(t.title));
        if (!task) return;
        markNotificationSeen(notification.id);
        setHighlightTaskId(task.id);
        taskRefs.current[task.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setHighlightTaskId(null), 2000);
    };

    // avatar
    const avatarRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (avatarRef.current && !avatarRef.current.contains(event.target)) {
                setShowAvatarDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // format time ago func
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diff = Math.floor((now - past) / 1000);

        if (diff < 60) return "Just now";
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

        return past.toLocaleDateString();
    };

    // filter for today with checkbox
    const todayDate = new Date().toISOString().split("T")[0];
    const tasksToDisplay = showTodayOnly
        ? tasks.filter(task => task.dueDate === todayDate && task.status === "In Progress")
        : filteredTasks;

    const sidebarRef = useRef();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed md:static top-0 left-0 h-full w-50 bg-white shadow-md z-40 transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
            >
                {/* Logo / Brand */}
                <div className="flex items-center justify-center h-16 border-gray-200 mb-4">
                    <h2 title="Kajal Flow" className="text-2xl font-bold text-orange-400 tracking-wider cursor-pointer">KFLOW</h2>
                </div>

                {/* Folder / Project List */}
                <div
                    className="flex items-center justify-between px-4 py-2 bg-gray-200 cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <span className="font-semibold text-sm">Companies</span>
                    <span className="text-lg">
                        {isOpen ? "▾" : "▸"}
                    </span>
                </div>

                {isOpen && (
                    <ul className="flex-1 overflow-y-auto h-100 space-y-1">
                        {folders
                            .slice()
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map((folder) => (
                                <li
                                    style={{ borderBottom: "1px solid gainsboro" }}
                                    key={folder.id}
                                    onClick={() => setActiveFolder(folder)}
                                    className={`text-sm cursor-pointer px-4 py-2 flex items-center justify-between transition-all duration-200
            ${activeFolder?.id === folder.id
                                            ? "bg-indigo-500 text-white font-semibold shadow"
                                            : "hover:bg-gray-100 hover:text-gray-800"
                                        }`}
                                >
                                    <span className="truncate">{folder.name}</span>
                                    {activeFolder?.id === folder.id && (
                                        <span className="text-white text-sm font-bold">•</span>
                                    )}
                                </li>
                            ))}
                    </ul>
                )}

                {/* Add New Folder */}
                <div className="px-3 mt-4 text-sm">
                    <input
                        type="text"
                        placeholder="New Company"
                        value={newFolder}
                        onChange={(e) => setNewFolder(e.target.value)}
                        className="w-full p-2 mb-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                        onClick={() => {
                            const trimmedName = newFolder.trim();
                            if (!trimmedName) return;

                            const exists = folders.some(
                                (folder) => folder.name.toLowerCase() === trimmedName.toLowerCase()
                            );

                            if (exists) {
                                setShowDuplicateModal(true);
                                return;
                            }

                            addFolder(trimmedName);
                            setNewFolder("");
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg shadow-sm transition-all text-sm"
                    >
                        <MdOutlineAddCircle /> <span className="text-sm">Add Company</span>
                    </button>
                </div>

                {/* Duplicate Modal */}
                {showDuplicateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white text-gray-800 rounded-lg p-6 w-80 shadow-lg">
                            <h3 className="text-lg font-semibold mb-2 text-center">Duplicate Project</h3>
                            <p className="text-sm mb-4 text-center">
                                A project with this name already exists. Please choose a different name.
                            </p>
                            <button
                                onClick={() => setShowDuplicateModal(false)}
                                className="bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-600 transition font-semibold block mx-auto text-white text-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Section */}
            <div className="flex-1 flex flex-col">
                {/* Top Navbar */}
                <div className="flex items-center justify-between bg-white px-6 py-4 shadow-md" style={{ borderBottom: "1px solid gainsboro" }}>
                    <button className="md:hidden text-2xl text-gray-700" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        ☰
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center w-full md:gap-6">
                        <h1 className="text-md font-semibold text-gray-800">Welcome, {user?.name}</h1>

                        {/* Global Search */}
                        <input
                            type="text"
                            placeholder="Search all tasks"
                            value={globalSearchTerm}
                            onChange={(e) => setGlobalSearchTerm(e.target.value)}
                            className="mt-2 md:mt-0 flex-1 p-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                        />
                        <div className="flex items-center select-none space-x-3">
                            {/* Toggle container */}
                            <label className="relative">
                                <input
                                    type="checkbox"
                                    checked={showTodayOnly}
                                    onChange={() => setShowTodayOnly(prev => !prev)}
                                    className="sr-only"
                                />
                                {/* Track */}
                                <div
                                    className={`w-12 h-6 bg-gray-700 rounded-full shadow-inner transition-colors duration-300 ${showTodayOnly ? "bg-indigo-500" : ""
                                        }`}
                                ></div>
                                {/* Circle knob */}
                                <div
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 ${showTodayOnly ? "translate-x-6" : ""
                                        }`}
                                ></div>
                            </label>

                            {/* Label */}
                            <span className="text-gray-200 font-medium text-sm text-indigo-600 transition-colors">
                                Today Only
                            </span>
                        </div>

                        {showTodayOnly && (
                            <span className="text-xs text-gray-600 font-medium ml-2">
                                Today's tasks ({tasksToDisplay.length})
                            </span>
                        )}

                    </div>

                    <div className="flex items-center gap-4 relative pl-4">
                        {/* Notifications */}
                        <div className="relative">
                            <span
                                className="cursor-pointer text-2xl relative"
                                onClick={() => setShowNotifications((prev) => !prev)}
                            >
                                🔔
                                {notifications.some(n => !n.seen) && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                        {notifications.filter(n => !n.seen).length}
                                    </span>
                                )}
                            </span>

                            {showNotifications && (
                                <div className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl max-h-[500px] overflow-y-auto z-50 border border-gray-100">

                                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                                        <h3 className="font-semibold text-gray-800 text-md">
                                            Notifications
                                        </h3>

                                        {notifications.some(n => !n.seen) && (
                                            <button
                                                className="text-indigo-600 text-sm font-medium hover:underline"
                                                onClick={() =>
                                                    notifications
                                                        .filter(n => !n.seen)
                                                        .forEach(n => markNotificationSeen(n.id))
                                                }
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    {notifications.length === 0 && (
                                        <p className="p-6 text-center text-gray-400 text-sm">
                                            You're all caught up!
                                        </p>
                                    )}

                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`flex gap-3 px-4 py-3 cursor-pointer transition hover:bg-gray-50 ${!n.seen ? "bg-blue-50" : ""
                                                }`}
                                        >
                                            {/* Avatar Circle */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold
                        ${n.type === "success" ? "bg-green-500" : "bg-indigo-500"}`}
                                            >
                                                <span className="text-[9px] text-center leading-[1]">{user?.name}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800 leading-snug">
                                                    <span className="font-semibold">You</span> {n.message}
                                                </p>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTimeAgo(n.createdAt)}
                                                </p>
                                            </div>

                                            {/* Blue dot for unread */}
                                            {!n.seen && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* User Avatar with Professional Dropdown */}
                        <div ref={avatarRef} className="relative">
                            {/* Avatar */}
                            <div
                                className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center cursor-pointer text-white font-bold"
                                onClick={() => setShowAvatarDropdown(prev => !prev)}
                            >
                                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                            </div>

                            {/* Dropdown */}
                            {showAvatarDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 overflow-hidden">

                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-gray-200">
                                        <p className="font-semibold text-gray-900">{user?.name || "User"}</p>
                                        <p className="text-sm text-gray-500 truncate">{user?.email || "user@example.com"}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col">
                                        <button
                                            className="px-4 py-2 text-left hover:bg-gray-100 text-red-500 font-semibold transition text-sm"
                                            onClick={logout}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Main Content */}
                <div className="pl-2 pt-2 flex-1 overflow-y-auto bg-white">
                    {globalSearchTerm ? (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Search Results</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                {globalFilteredTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        ref={(el) => (taskRefs.current[task.id] = el)}
                                        className={`bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition relative
                                            ${isOverdue(task) ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}
                                            ${highlightTaskId === task.id ? "ring-4 ring-indigo-500" : ""}`}
                                    >
                                        <h3 className="font-semibold text-lg mb-1">{task.title}</h3>
                                        <p className="text-gray-500 mb-2">Due: {task.dueDate}</p>
                                        <span
                                            className={`text-xs px-3 py-1 rounded-full font-medium ${task.status === "Completed"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-yellow-100 text-yellow-600"
                                                }`}
                                        >
                                            {task.status}
                                        </span>
                                    </div>
                                ))}
                                {globalFilteredTasks.length === 0 && (
                                    <p className="text-gray-500 col-span-full">No tasks found.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Active Folder Header */}
                            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                                <h2 className="text-xl font-bold text-gray-400">{activeFolder ? activeFolder.name : "Your Tasks"}</h2>

                                {activeFolder && (
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => {
                                                setShowModal(true);
                                                setEditingTask(null);
                                            }}
                                            className="bg-indigo-500 px-3 py-2 rounded-lg hover:bg-indigo-600 transition text-white font-semibold text-sm cursor-pointer flex items-center"
                                        >
                                            <MdOutlineAddCircle /> <span className="text-xs pl-1"> Task</span>
                                        </button>

                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="p-1 text-sm rounded bg-gray-200 text-gray-700"
                                        >
                                            <option value="All">All Tasks</option>
                                            <option value="Today">Today</option>
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                        </select>

                                        <input
                                            type="text"
                                            placeholder="Search tasks in folder..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="p-2 rounded bg-gray-200 text-gray-700"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Task Grid */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {tasksToDisplay.map((task) => {
                                    const folder = folders.find(f => f.id === task.folderId);

                                    return (
                                        <div
                                            key={task.id}
                                            ref={(el) => (taskRefs.current[task.id] = el)}
                                            className={`bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition relative
          ${isOverdue(task) ? "border-l-4 border-red-500" : "border-l-4 border-transparent"}
          ${highlightTaskId === task.id ? "ring-4 ring-indigo-500" : ""}`}
                                        >
                                            <div className="col justify-between items-start mb-2">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold text-lg">{task.title}</h3>

                                                    {folder && (
                                                        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                                                            {folder.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Due Date */}
                                                <div className="flex justify-between pt-1 items-center">
                                                    <p className="text-gray-500 mb-2">Due: {task.dueDate}</p>

                                                    {/* Status Badge */}
                                                    <span
                                                        className={`text-xs px-3 py-1 rounded-full font-medium ${task.status === "Completed"
                                                            ? "bg-green-100 text-green-600"
                                                            : "bg-yellow-100 text-yellow-600"
                                                            }`}
                                                    >
                                                        {task.status}
                                                    </span>
                                                </div>

                                                {/* Attachments */}
                                                {task.attachments?.length > 0 && (
                                                    <div className="mt-2 text-sm">
                                                        <strong className="text-gray-500">Attachments:</strong>
                                                        <ul className="list-disc list-inside text-indigo-500">
                                                            {task.attachments.map((file, i) => (
                                                                <li key={i} className="flex justify-between items-center">
                                                                    <a
                                                                        href={file.data}
                                                                        download={file.name}
                                                                        className="hover:underline"
                                                                    >
                                                                        {file.name}
                                                                    </a>

                                                                    <MdDelete
                                                                        onClick={() => removeAttachment(task.id, i)}
                                                                        className="text-gray-500 hover:text-red-500 cursor-pointer hover:scale-110 transition text-[20px]"
                                                                    />
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-wrap items-center gap-6 mt-3">
                                                <button
                                                    onClick={() =>
                                                        updateTaskStatus(
                                                            task.id,
                                                            task.status === "Completed" ? "In Progress" : "Completed"
                                                        )
                                                    }
                                                    className={`text-xl cursor-pointer flex items-center ${task.status === "Completed"
                                                        ? "text-yellow-500 hover:underline"
                                                        : "text-indigo-500 hover:underline"
                                                        }`}
                                                >
                                                    <label className="text-sm pr-1">
                                                        {task.status === "Completed" ? "Undo" : "Mark"}
                                                    </label>
                                                    <IoMdCheckmarkCircleOutline />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setEditingTask(task);
                                                        setShowModal(true);
                                                    }}
                                                    className="text-gray-500 hover:text-gray-400 text-xl cursor-pointer flex items-center"
                                                >
                                                    <BiSolidEdit />
                                                </button>

                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="text-gray-500 hover:text-red-500 text-xl cursor-pointer flex items-center"
                                                >
                                                    <MdDelete />
                                                </button>

                                                <label
                                                    htmlFor={`file-upload-${task.id}`}
                                                    className="text-gray-500 cursor-pointer hover:text-indigo-500 text-xl flex items-center"
                                                >
                                                    <ImAttachment />
                                                </label>

                                                <input
                                                    id={`file-upload-${task.id}`}
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/webp, application/pdf"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(e, task.id)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}

                                {tasksToDisplay.length === 0 && (
                                    <p className="text-gray-500 col-span-full">
                                        {showTodayOnly ? "No tasks due today." : "No tasks found in this folder."}
                                    </p>
                                )}
                            </div>

                            {/* Archived Tasks */}
                            {/* {archivedTasks.length > 0 && (
                                <div className="mt-10">
                                    <h3 className="text-xl font-bold text-gray-700 mb-4">Archived Tasks</h3>
                                    <div className="space-y-3">
                                        {archivedTasks.map((t) => (
                                            <div key={t.id} className="p-3 bg-gray-200 rounded shadow-sm">
                                                <span className="font-semibold">{t.title}</span>{" "}
                                                <span className="text-gray-500 text-xs">
                                                    — Completed on {new Date(t.archivedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </>
                    )}
                </div>
            </div>

            {/* Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-bold mb-4">{editingTask ? "Edit Task" : "Create Task"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                name="title"
                                placeholder="Task Title"
                                defaultValue={editingTask?.title || ""}
                                required
                                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                type="date"
                                name="dueDate"
                                defaultValue={editingTask?.dueDate || ""}
                                required
                                className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingTask(null);
                                    }}
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-indigo-500 rounded text-white font-semibold hover:bg-indigo-600 transition">
                                    {editingTask ? "Update Task" : "Create Task"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
