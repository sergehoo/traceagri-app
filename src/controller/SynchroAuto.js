
import { GetFile } from "../IndexDB/GetFiles";

export const SynchroAuto = async (user) => {
    const data = JSON.parse(localStorage.getItem("data")) || []

    if (data && data.length > 0) {
        let errorOccurred = "";

        // Utilisation de Promise.all pour attendre toutes les promesses
        const result = await Promise.all(data.map(async (item) => {
            if (item && !item.isSynchro && item.isSynchro === false) {
                item.isSynchro = true;

                try {

                    if (item.idphoto && item.idphoto !== undefined) {
                        const photo = await GetFile(item.idphoto)
                        item.photo = photo.file
                    }

                    const form = new FormData();
                    for (const key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key)) {
                            if (key === "photo" && item[key] instanceof File) {
                                form.append(key, item[key]);
                            } else {
                                form.append(key, item[key]);
                            }
                        }
                    }
                    const api = await fetch("https://traceagri.com/fr/api/mobiledata/", {
                        headers: {
                            "Authorization": `Token ${user.token}`
                        },
                        method: "post",
                        body: form,
                    });

                    const res = await api.json();
                    if (res && res.id !== undefined) {
                        localStorage.setItem("data", JSON.stringify(data));
                        errorOccurred = "ok";
                        return "success";  // Retour succès pour cet élément
                    } else {
                        item.isSynchro = false;
                        errorOccurred = "err";
                        return "echec";  // Si l'API échoue
                    }
                } catch (error) {
                    console.log(error)
                    item.isSynchro = false;
                    errorOccurred = "err";
                    return "erreur";  // Si une erreur se produit lors de l'appel
                }
            } else {
                errorOccurred = "";
                return "skipped";  // Si l'élément est déjà synchronisé
            }

        }));

        // Si une erreur est survenue, on ne renvoie pas les données
        if (errorOccurred === "err") {
            return { status: 500, message: "Données en cache en attente d'une connexion internet." };
        } else if (errorOccurred === "ok") {
            return { status: 201, message: "Donnèes sauvegardèes et synchronièes avec succès", data };
        }

    }
}
