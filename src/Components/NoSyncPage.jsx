import { useSnackbar } from 'notistack';
import React, { useState, useRef, useEffect } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { GoPencil } from "react-icons/go";
import { LuRefreshCcw } from "react-icons/lu";
import { GetFile } from '../IndexDB/GetFiles';
import LoadingEl from './LoadingEl';
import BtnHistory from './BtnHistory';

function NoSyncPage() {

    const [data, setData] = useState(null)
    const [load, setLoad] = useState(true)
    const [isNo, setIsNo] = useState(false)
    const [loadsynchro, setLoadsynchro] = useState(false)
    const [image, setImage] = useState(null)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [currentItems, setCurrentItems] = useState([])
    const [filterDate, setFilterDate] = useState("");

    const { enqueueSnackbar } = useSnackbar()


    const synchroData = async (uid) => {
        if (data && data.length > 0 && uid !== undefined) {
            try {
                const file = data.find(item => item.uid === uid)
                setLoadsynchro(true)
                const user = JSON.parse(localStorage.getItem("token")) || null

                const photo = await GetFile(file.idphoto)
                file.photo = photo.file

                const form = new FormData()
                for (const key in file) {
                    if (Object.prototype.hasOwnProperty.call(file, key)) {
                        if (key === "photo" && file[key] instanceof File) {
                            form.append(key, file[key]);
                        } else {
                            form.append(key, file[key]);
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
                console.log(res)
                if (res && res.id !== undefined) {
                    data.forEach((item) => {
                        if (item.uid === uid) item.isSynchro = true
                    })
                    localStorage.setItem("data", JSON.stringify(data))
                    setIsNo(true)
                    enqueueSnackbar("Donnèes sauvegardèes et synchronièes avec succès", { variant: "success" })
                } else {
                    enqueueSnackbar("Synchronisation non reussie, vèrifiez votre connection internet", { variant: "warning" })
                }
                setLoadsynchro(false)
            } catch (error) {
                console.log(error)
                enqueueSnackbar("Synchronisation non reussie, une erreure s'est produite", { variant: "warning" })
                setLoadsynchro(false)
            }
        }
    }

    useEffect(() => {
        setTimeout(() => {
            setData(JSON.parse(localStorage.getItem("data")) || [])
            const donne = JSON.parse(localStorage.getItem("data"))
            const find = donne.find(item => item.isSynchro === false) || null
            if (!find) {
                setIsNo(true)
            } else {
                // Trier les données par createdDate (le plus récent en premier)
                const sortedData = donne.sort((a, b) => {
                    const dateA = new Date(a.createdDate);
                    const dateB = new Date(b.createdDate);
                    return dateB - dateA; // Tri décroissant (plus récent en premier)
                });
                setData(sortedData)
            }
            setLoad(false)
        }, 1000);

    }, [])

    useEffect(() => {
        let filteredData = data;
        if (filterDate) {
            filteredData = data.filter(item => {
                const itemDate = new Date(item.createdDate).toISOString().split('T')[0]; // Formater la date en YYYY-MM-DD
                return itemDate === filterDate;
            });
        }

        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        if (filteredData) setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem));
        else if (data) setCurrentItems(data.slice(indexOfFirstItem, indexOfLastItem));

    }, [filterDate, currentPage, data]);

    // Fonction pour changer de page
    const nextPage = () => {
        if (currentPage < Math.ceil(data.length / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="container pt-2 mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <BtnHistory />
                <h2 className='fw-bold h6 text-center pt-2'>Donnèes non synchronisées</h2>
                <span></span>
            </div>

            <div className='row'>
                <div className="container">

                    {!load ?
                        (
                            <>
                                {data && data.length > 0 ? (
                                    <>
                                        {data && data.length && currentItems.map(item => (
                                            <>
                                                {item.isSynchro === false && (
                                                    <div className="card p-0 shadow mb-2" key={item.uid}>
                                                        <div className="card-body d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className='fw-bold mb-0'>{item.nom} {item.prenom}</p>
                                                                <p className='mb-0'>Tel.: {item.telephone} </p>
                                                            </div>
                                                            <div className='d-flex align-items-center'>
                                                                <p className='pt-3 me-2'>id: <strong>{item.uid}</strong></p>
                                                                <Link to={`/dash/form-update/${item.uid}`} className='mx-2 btn btn-info text-light me-2'><GoPencil /></Link>
                                                                {loadsynchro ? (
                                                                    <button className="btn btn-warning" type="button" disabled>
                                                                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                                                                        <span className="visually-hidden" role="status">Loading...</span>
                                                                    </button>
                                                                ) : (
                                                                    <button className='btn btn-success' onClick={() => synchroData(item.uid)}><LuRefreshCcw /></button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        ))}
                                        {!isNo && currentItems && currentItems.length > 0 &&
                                            <div className="d-flex justify-content-center mt-4 mb-5">
                                                <button className="btn btn-success me-2" onClick={prevPage} disabled={currentPage === 1}>
                                                    Précédent
                                                </button>
                                                <button className="btn btn-success" onClick={nextPage} disabled={currentPage === Math.ceil(data.length / itemsPerPage)}>
                                                    Suivant
                                                </button>
                                            </div>
                                        }
                                    </>
                                ) : (
                                    <p className='h4 fw-bold'>Aucune donnèe à afficher</p>
                                )}
                                {isNo && <p className='h4 fw-bold text-center'>Aucune donnèe à synchroniser</p>}
                            </>
                        )
                        : (
                            <LoadingEl />
                        )
                    }

                </div>
            </div>
        </div>
    )
}

export default NoSyncPage
