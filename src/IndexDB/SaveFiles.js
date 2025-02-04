import { openDatabase } from "./createDB";

export const storeFileInIndexedDB = async (file) => {
    const db = await openDatabase(); // La fonction pour ouvrir IndexedDB
    const transaction = db.transaction(["files"], "readwrite");
    const store = transaction.objectStore("files");

    const fileData = {
        file: file,  // Stocke l'objet File tel quel
        name: file.name,
        type: file.type,
        size: file.size,
        createdDate: new Date().toISOString(),
    };

    const request = store.put(fileData);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            const fileId = request.result;
            console.log("Fichier sauvegardé dans IndexedDB");
            resolve(fileId);
        };

        request.onerror = () => {
            reject("Erreur lors de la sauvegarde du fichier dans IndexedDB");
        };
    });
};
