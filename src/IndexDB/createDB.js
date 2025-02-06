export const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("dbApp", 1); // Nom de la base de données et version

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Créer un object store (table) pour les fichiers
            if (!db.objectStoreNames.contains("files")) {
                db.createObjectStore("files", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onerror = (event) => {
            reject("Erreur lors de l'ouverture de la base de données.");
        };

        request.onsuccess = (event) => {
            resolve(event.target.result); // La base de données est ouverte avec succès
        };
    });
};