import { createContext, useState, useEffect } from "react";

export const FolderContext = createContext();

export default function FolderProvider({ children }) {
    const [folders, setFolders] = useState(() => {
        return JSON.parse(localStorage.getItem("folders")) || [];
    });

    const [activeFolder, setActiveFolder] = useState(null);

    useEffect(() => {
        localStorage.setItem("folders", JSON.stringify(folders));
    }, [folders]);

    const addFolder = (name) => {
        const newFolder = {
            id: Date.now(),
            name,
        };
        setFolders([...folders, newFolder]);
    };

    return (
        <FolderContext.Provider
            value={{
                folders,
                addFolder,
                activeFolder,
                setActiveFolder,
            }}
        >
            {children}
        </FolderContext.Provider>
    );
}
