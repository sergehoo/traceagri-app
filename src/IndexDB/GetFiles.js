import { openDatabase } from "./createDB";

export const GetFile = async (fileId) => {
    const db = await openDatabase();
    const transaction = db.transaction(["files"], "readonly");
    const store = transaction.objectStore("files");

    const request = store.get(fileId);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => {
            if (request.result) {
                console.log("Fichier récupéré de IndexedDB", request.result);
                resolve(request.result);
            } else {
                console.log("Aucun fichier trouvé avec cet ID");
                reject("Fichier non trouvé");
            }
        };

        request.onerror = () => {
            console.error("Erreur lors de la récupération du fichier depuis IndexedDB");
            reject("Erreur lors de la récupération du fichier depuis IndexedDB");
        };
    });
};
