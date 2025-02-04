
import React, { useState, useRef, useEffect } from 'react'
import { FaEye } from "react-icons/fa";
import BtnHistory from './BtnHistory';
import LoadingEl from './LoadingEl';
import ShowItems from './ShowItems';

function SyncPage() {

    const [data, setData] = useState(null)
    const [load, setLoad] = useState(true)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [currentItems, setCurrentItems] = useState([])
    const [filterDate, setFilterDate] = useState("");
    const [isNo, setIsNo] = useState(false)
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        setTimeout(() => {
            const donne = JSON.parse(localStorage.getItem("data"))
            const find = donne.find(item => item.isSynchro === true) || null
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

        // Calculer les items à afficher après le filtrage
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

    const show = (item) => {

        if (item && item.idphoto && item.idphoto !== undefined) {
            if (item.photo && typeof (item.photo) === "object") {
                item.photo = ""
                setSelectedItem(item)
                console.log(typeof (item.photo))
            } else {
                setSelectedItem(item)
            }
        } else {
            item.photo = null
            setSelectedItem(item)
        }

        setTimeout(() => {
            document.getElementById("popup").click()
        }, 100);
    }


    return (
        <div className="container pt-2 mb-5 ">
            <div className="d-flex align-items-center justify-content-between mb-4 sticky-top">
                <BtnHistory />
                <h2 className='fw-bold h6 text-center pt-2'>Donnèes Synchronisées</h2>
                <span></span>
            </div>

            <div className='row'>
                <div className="container">

                    <div className="ms-auto col-6 text-end mb-4">
                        <label htmlFor="filterDate" className="form-label">Filtrer par date :</label>
                        <input type="date" id="filterDate" className="form-control" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                    </div>

                    {!load ?
                        (
                            <>
                                {data && data.length > 0 ? (
                                    <>
                                        {data && data.length && currentItems.map(item => (
                                            <>
                                                {item.isSynchro === true && (
                                                    <div className="card p-0 shadow mb-2" key={item.uid}>
                                                        <div className="card-body p-2 d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <p className='fw-bold mb-0'>{item.nom} {item.prenom}</p>
                                                                <p className='mb-0'>Tel.: {item.telephone} </p>
                                                            </div>
                                                            <div className='d-flex align-items-center'>
                                                                <p className='me-2 pt-3 me-2'>id: <strong>{item.uid}</strong></p>
                                                                <button onClick={() => show(item)} className='btn btn-success btn-sm'><FaEye /></button>
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
                                    <p className='h4 fw-bold text-center'>Aucune donnèe à afficher</p>
                                )}
                                {isNo && <p className='h4 fw-bold text-center'>Aucune donnèe synchronisée</p>}
                            </>
                        )
                        : (
                            <LoadingEl />
                        )
                    }

                </div>
            </div>

            <ShowItems selectedItem={selectedItem} />

        </div>
    )
}

export default SyncPage
