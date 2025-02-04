import { useSnackbar } from 'notistack';
import React, { useState, useRef, useEffect } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from 'react-router-dom';
import { storeFileInIndexedDB } from '../IndexDB/SaveFiles';
import { FaCamera } from "react-icons/fa";
import { GetFile } from '../IndexDB/GetFiles';

function ModalNewForm() {

    const navigate = useNavigate()

    const { uid } = useParams()

    const handleReturn = () => {
        navigate(-1)
    }

    const { enqueueSnackbar } = useSnackbar()

    const [DataFields, setDataFields] = useState({});
    const [cultureType, setCultureType] = useState("");
    const [otherCropPlanted, setOtherCropPlanted] = useState(false);
    const [useFertilizers, setUseFertilizers] = useState(false);
    const [useCooperative, setUseCooperative] = useState(false);
    const [load, setLoad] = useState(false)
    const [Listeville, setListeville] = useState([])



    const [loadingVilles, setLoadingVilles] = useState(false);
    const [errorVilles, setErrorVilles] = useState(null);

    const [message, setMessage] = useState("")
    const [file, setFile] = useState(null)



    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Succès : coordonnées récupérées
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    setDataFields({
                        ...DataFields,
                        ["longitude"]: longitude,
                        ["latitude"]: latitude
                    });
                },
                (error) => {
                    console.log(error)
                }
            );
        } else {
            console.error("La géolocalisation n'est pas supportée par ce navigateur.");
        }

        setTimeout(() => {
            const reqTo = JSON.parse(localStorage.getItem("token"));
            if (reqTo) {
                Localiter(reqTo.token)
            }
        }, 100);

        if (uid && uid !== undefined && uid !== "") {
            console.log()
            const req = JSON.parse(localStorage.getItem("data")) || []
            if (req && req.length > 0) {
                const dataList = req.find(item => Number(item.uid) === Number(uid))
                if (dataList) {
                    setDataFields(dataList)
                    setCultureType(dataList?.cultureType)
                    setUseCooperative(dataList?.useCooperative)
                }
            }
        }
    }, [])

    const [photo, setPhoto] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);


    const handleSavePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
            setPhoto(blob);
            setDataFields({ ...DataFields, photo: blob });
        });

        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        video.srcObject = null;
    };


    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFile(files[0])
        setDataFields({ ...DataFields, [name]: files[0] });
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDataFields({ ...DataFields, [name]: value });
    };

    const handleCropTypeChange = (e) => {
        const { value } = e.target;
        setCultureType(value);
        setDataFields({ ...DataFields, cultureType: value });
    };

    const handleOtherCropChange = (e) => {
        const { value } = e.target;
        setOtherCropPlanted(value === "Oui");
        setDataFields({ ...DataFields, otherCropPlanted: value });
    };

    const handleUseFertilizersChange = (e) => {
        const { value } = e.target;
        setUseFertilizers(value === "Oui");
        setDataFields({ ...DataFields, useFertilizers: value });
    };


    const handleUseCooperativeChange = (e) => {
        const { value } = e.target;
        setUseCooperative(value === "Oui");
        setDataFields({ ...DataFields, useCooperative: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = JSON.parse(localStorage.getItem("token")) || null
        let dataSeve = JSON.parse(localStorage.getItem("data")) || []
        const indexBD = (DataFields?.idphoto !== undefined && DataFields?.idphoto !== "") ?
            DataFields?.idphoto : (DataFields.photo !== undefined && DataFields.photo !== null) && await storeFileInIndexedDB(DataFields.photo)
        DataFields.idphoto = indexBD

        try {
            setLoad(true)
            if (user !== null) {
                DataFields.uid = (uid && uid !== undefined) ? uid : Math.floor(100000 + Math.random() * 900000)
                DataFields.createdDate = (DataFields.createdDate) ? DataFields.createdDate : new Date()

                if (DataFields.idphoto && Number(DataFields.idphoto) !== 0) {
                    const photo = await GetFile(DataFields.idphoto)
                    DataFields.photo = photo.file
                }

                const form = new FormData()
                for (const key in DataFields) {
                    if (Object.prototype.hasOwnProperty.call(DataFields, key)) {
                        if (key === "photo" && DataFields[key] instanceof File) {
                            form.append(key, DataFields[key]);
                        } else {
                            form.append(key, DataFields[key]);
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
                    DataFields.isSynchro = true
                    enqueueSnackbar("Donnèes sauvegardèes et synchronièes avec succès", { variant: "success" })
                } else {
                    DataFields.isSynchro = false
                    enqueueSnackbar("Donnèes sauvegardèes et en attente de synchronisation", { variant: "warning" })
                }

                if (dataSeve && dataSeve.length > 0) {
                    const indexToUpdate = dataSeve.find(item => Number(item.uid) === Number(uid));
                    console.log(indexToUpdate)
                    if (indexToUpdate && indexToUpdate !== undefined) {
                        dataSeve = dataSeve.map(item => {
                            if (Number(item.uid) === Number(uid)) {
                                return DataFields;
                            }
                            return item;
                        });
                    } else {
                        dataSeve.push(DataFields);
                    }
                    localStorage.setItem("data", JSON.stringify(dataSeve))
                } else {
                    localStorage.setItem("data", JSON.stringify([DataFields]))
                }

                console.log("log", DataFields)
                console.log("res", res)
                setLoad(false)
            } else {
                enqueueSnackbar("Utilisqteur non reconnu", { variant: "danger" })
                console.log("token vide")
            }
            setLoad(false)
            setTimeout(() => {
                document.getElementById("formsubmit").reset()
            }, 100);
        } catch (error) {

            DataFields.uid = (uid && uid !== undefined) ? uid : Math.floor(100000 + Math.random() * 900000)
            DataFields.createdDate = (DataFields.createdDate) ? DataFields.createdDate : new Date()
            DataFields.isSynchro = false

            if (dataSeve && dataSeve.length > 0) {
                const indexToUpdate = dataSeve.find(item => Number(item.uid) === Number(uid));
                console.log(indexToUpdate)
                if (indexToUpdate && indexToUpdate !== undefined) {
                    dataSeve = dataSeve.map(item => {
                        if (Number(item.uid) === Number(uid)) {
                            return DataFields;
                        }
                        return item;
                    });
                } else {
                    dataSeve.push(DataFields);
                }
                localStorage.setItem("data", JSON.stringify(dataSeve))
            } else {
                localStorage.setItem("data", JSON.stringify([DataFields]))
            }



            enqueueSnackbar("Donnèes sauvegardèes et en attente de synchronisation", { variant: "warning" })
            setLoad(false)
            setTimeout(() => {
                document.getElementById("formsubmit").reset()
            }, 100);
        }

        //console.log(DataFields);
    };




    const Localiter = async (token) => {
        const app = await fetch("https://traceagri.com/fr/api/localites/", {
            headers: {
                "Authorization": `Token ${token}`
            },
            method: "get"
        })
        const res = await app.json()
        setListeville(res)
    }

    return (
        <div className="container pt-2 mb-5">

            <div className="d-flex align-items-center justify-content-between mb-4">
                <span className='btn btn-transparent' onClick={() => handleReturn()}><FaArrowLeft /></span>
                <h2 className='fw-bold h6 text-center pt-2'>Formulaire d'enquête</h2>
                <span></span>
            </div>

            <form className="container mb-5" id="formsubmit" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="small">
                        Sélectionner la ville de l'enquête (<span className="text-danger">*</span>)
                    </label>

                    <input type="num" list='ville' name="ville_enquette" value={DataFields?.ville_enquette}
                        className="form-control"
                        onChange={handleInputChange}
                        required id="localite" placeholder="ville de l'enquette" />

                    <datalist id='ville'>
                        {Listeville && Listeville.length > 0 && Listeville.map(item => (
                            <option key={item.id} value={item.name}>{item.name}</option>
                        ))}
                    </datalist>
                </div>

                <h6>Section A (Hautement sensible)</h6>
                <div className="mb-3">
                    <label className="small">2.	Quel est le nom du producteur ? (<span className="text-danger">*</span>)</label>
                    <input type="text" value={DataFields?.nom} name="nom" className="form-control" placeholder="Entrez le nom du producteur" onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                    <label className="small">Son Prenom (<span className="text-danger">*</span>)</label>
                    <input type="text" value={DataFields?.prenom} name="prenom" className="form-control" placeholder="Entrez le prenom du producteur"
                        onChange={handleInputChange} required />
                </div>
                <div className="mb-3">
                    <label className="small">Quel est le téléphone du producteur ? (<span className="text-danger">*</span>)</label>
                    <input type="tel" value={DataFields?.telephone} name="telephone" className="form-control" laceholder="Entrez le numéro de téléphone" onChange={handleInputChange} required
                    />
                </div>
                <div className="mb-3">
                    <label className="small">Sexe du producteur (<span className="text-danger">*</span>)</label>
                    <select name="sexe" value={DataFields?.sexe} className="form-select" onChange={handleInputChange} >
                        <option value="">Sélectionnez le genre</option>
                        <option value="M">Homme</option>
                        <option value="F">Femme</option>
                        <option value="Préfère ne pas dire">Préfère ne pas dire</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="small">Date de naissance</label>
                    <input
                        type="date"
                        value={DataFields?.date_naissance}
                        name="date_naissance"
                        className="form-control"
                        placeholder="Entrez l'âge"
                        onChange={handleInputChange}

                    />
                </div>
                <div className="mb-3">
                    <label className="small">Nbre de personnes dans le foyer du producteur</label>
                    <input
                        type="number"
                        value={DataFields?.nbre_personne_foyer}
                        name="nbre_personne_foyer"
                        className="form-control"
                        placeholder="Entrez un nombre"
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="small">Revenu de la dernière saison de récolte du producteur</label>
                    <input
                        type="number"
                        name="revenue_derniere_recolte"
                        value={DataFields?.revenue_derniere_recolte}
                        className="form-control"
                        placeholder="Entrez un nombre"
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="small">Combien de personnes sont à la charge du producteur ?</label>
                    <input
                        type="number"
                        name="nbre_personne_charge"
                        value={DataFields?.nbre_personne_charge}
                        className="form-control"
                        placeholder="Entrez un nombre"
                        onChange={handleInputChange}
                    />
                </div>
                <div className="mb-3">
                    <label className="small mb-2">Identifier le producteur à l’une des situations suivantes ? (Vous pouvez choisir plusieurs réponses – par l’observation d’un agent de terrain)</label>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="flexCheckDefault" checked={DataFields?.option1} name='option1' onChange={handleInputChange} />
                        <label className="form-check-label" htmlFor="flexCheckDefault">
                            Femme
                        </label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" name='option2' checked={DataFields?.option2} onChange={handleInputChange} />
                        <label className="form-check-label" htmlFor="flexCheckChecked">
                            Personne handicapée
                        </label>
                    </div>
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" name='option3' checked={DataFields?.option3} onChange={handleInputChange} />
                        <label className="form-check-label" htmlFor="flexCheckChecked">
                            Aucune des réponses ci-dessus
                        </label>
                    </div>
                </div>


                <div className="mb-3">
                    <label className="small">Quel type de culture est actuellement planté dans la plantation ? (<span className="text-danger">*</span>) </label>
                    <select
                        name="cultureType"
                        value={DataFields?.cultureType}
                        className="form-select"
                        onChange={handleCropTypeChange}

                    >
                        {DataFields?.cultureType && <option value={DataFields?.cultureType}>{DataFields?.cultureType}</option>}
                        <option value="">Sélectionnez le type de culture</option>
                        <option value="Pérenne">Culture Pérenne</option>
                        <option value="annuelle">Culture annuelle</option>
                    </select>
                </div>

                {cultureType === "Pérenne" && (
                    <>
                        <h6>Section B (Culture Pérenne)</h6>
                        <div className="mb-3">
                            <label className="small">Quelle culture est actuellement cultivée dans la plantation ? </label>
                            <select
                                name="nom_culture"
                                value={DataFields?.nom_culture}
                                className="form-select"
                                onChange={handleInputChange}
                            >
                                {DataFields?.nom_culture && <option value={DataFields?.nom_culture}>{DataFields?.nom_culture}</option>}
                                <option value="">Sélectionnez une culture</option>
                                <option value="Cacao">Cacao</option>
                                <option value="Huile de palme">Huile de palme</option>
                                <option value="Hévéa">Hévéa</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="small">En quelle année la plantation a-t-elle été établie ? </label>
                            <input
                                type="number"
                                name="annee_mise_en_place"
                                value={DataFields?.annee_mise_en_place}
                                className="form-control"
                                placeholder="Entrez l'année"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="small">Quand a-t-il récolté pour la dernière fois ? </label>
                            <input
                                type="date"
                                name="annee_premiere_recole"
                                value={DataFields?.annee_premiere_recole}
                                className="form-control"
                                placeholder="Entrez le mois et l'année"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="small">Quel était le rendement approximatif ? - Précisez l'unité (par exemple 20 sacs, 2 remorques, 2 tonnes, etc.) </label>
                            <input
                                type="text"
                                name="rendement_approximatif"
                                value={DataFields?.rendement_approximatif}
                                className="form-control"
                                placeholder="Entrez le rendement approximatif"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label className="small mb-2">Pratique-t-il l’une des pratiques agricoles suivantes ? (Vous pouvez en choisir plusieurs)</label>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="flexCheckDefault" name='Agroforesterie' onChange={handleInputChange} />
                                <label className="form-check-label" htmlFor="flexCheckDefault">
                                    Agroforesterie
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" checked={DataFields?.culture_intercalaire} id="flexCheckChecked" name='Culture_intercalaire ' onChange={handleInputChange} />
                                <label className="form-check-label" htmlFor="flexCheckChecked">
                                    Culture intercalaire
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Compostage} name='Compostage' onChange={handleInputChange} />
                                <label className="form-check-label" htmlFor="flexCheckChecked">
                                    Compostage
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Elevage_associatif} name='Elevage_associatif' onChange={handleInputChange} />
                                <label className="form-check-label" htmlFor="flexCheckChecked">
                                    Elevage associatif
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Paillage} name=' Paillage' onChange={handleInputChange} />
                                <label className="form-check-label" htmlFor="flexCheckChecked">
                                    Paillage
                                </label>
                            </div>
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Aucun} name='Aucun' onChange={handleInputChange} />
                                <label className="form-check-label" htmlFor="flexCheckChecked">
                                    Aucun
                                </label>
                            </div>
                            <div className="mt-2 mb-3">
                                <input className="form-control" type="text" value={DataFields?.Autre} name='Autre' placeholder='Autre, précisez' onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="small">Avec quelles cultures faites-vous de la culture intercalaire ?</label>
                            <input
                                type="text"
                                name="culture_intercalaire"
                                value={DataFields?.culture_intercalaire}
                                className="form-control"
                                placeholder="culture intercalaire"
                                onChange={handleInputChange}
                            />
                        </div>
                    </>
                )}

                {cultureType === "annuelle" && (
                    <>
                        <h6>Section C (Culture annuelle)</h6>
                        <div className="mb-3">
                            <label className="small">Quelle culture est actuellement cultivée dans la plantation ? (Il s'agit de la plantation dans laquelle les polygones seront capturés)</label>
                            <select
                                name="nom_culture"
                                className="form-select"
                                onChange={handleInputChange}

                            >
                                <option value={DataFields?.nom_culture}>{DataFields?.nom_culture}</option>
                                <option value="">Sélectionnez une culture</option>
                                <option value="Maïs">Maïs</option>
                                <option value="Riz">Riz</option>
                                <option value="Yam">Yam</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="small">Au cours des 4 dernières années, le producteur a-t-il planté une autre culture dans la même plantation ? *</label>
                            <select name="otherCropPlanted" className="form-select" onChange={handleOtherCropChange}>
                                <option value={DataFields?.otherCropPlanted}>{DataFields?.otherCropPlanted}</option>
                                <option value="">Sélectionnez</option>
                                <option value="Oui">Oui</option>
                                <option value="Non">Non</option>
                            </select>
                        </div>

                        {otherCropPlanted && (
                            <>
                                <div className="mb-3">
                                    <label className="small">Quel type de culture a-t-il planté ?	</label>
                                    <select name="otherCropType" className="form-select" onChange={handleInputChange} >
                                        <option value={DataFields?.otherCropType}>{DataFields?.otherCropType}</option>
                                        <option value="">Sélectionnez une culture</option>
                                        <option value="Maïs">Maïs</option>
                                        <option value="Riz">Riz</option>
                                        <option value="Cacao">Cacao</option>
                                        <option value="Huile de palme">Huile de palme</option>
                                        <option value="Ignames">Ignames</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="small">En quelle année l'a-t-il plantée ?</label>
                                    <input type="number" name="otherCropYear" value={DataFields?.otherCropYear} className="form-control" placeholder="Entrez l'année" onChange={handleInputChange} />
                                </div>

                                <div className="mb-3">
                                    <label className="small">Quelle est la date probable de la récolte ?	</label>
                                    <input type="date" name="dateProbaleRecole" value={DataFields?.dateProbaleRecole} className="form-control" placeholder="Quelle est la date probable de la récolte" onChange={handleInputChange} />
                                </div>


                                <div className="mb-3">
                                    <label className="small">Quel était le rendement approximatif ? - Précisez l'unité (par exemple 20 sacs, 2 remorques, 2 tonnes, etc.) </label>
                                    <input
                                        type="text"
                                        name="rendement_approximatif"
                                        value={DataFields?.rendement_approximatif}
                                        className="form-control"
                                        placeholder="Entrez le rendement approximatif"
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="small mb-2">Quelles pratiques agricoles pratique-t-il ? (Vous pouvez en choisir plusieurs)</label>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="flexCheckDefault" checked={DataFields?.Rotation_des_cultures} name='Rotation_des_cultures' onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="flexCheckDefault">
                                            Rotation des cultures
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Culture_intercalaire} name='Culture_intercalaire ' onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="flexCheckChecked">
                                            Culture intercalaire
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Travail_de_conservation_du_sol} name='Travail_de_conservation_du_sol' onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="flexCheckChecked">
                                            Travail de conservation du sol
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Cultures_de_couverture} name='Cultures_de_couverture' onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="flexCheckChecked">
                                            Cultures de couverture
                                        </label>
                                    </div>
                                    <div className="form-check">
                                        <input className="form-check-input" type="checkbox" id="flexCheckChecked" checked={DataFields?.Aucun} name='Aucun' onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="flexCheckChecked">
                                            Aucun
                                        </label>
                                    </div>
                                    <div className="mt-2 mb-3">
                                        <input className="form-control" type="text" name='Autre' value={DataFields?.Autre} placeholder='Autre, précisez' onChange={handleInputChange} />
                                    </div>
                                </div>
                            </>
                        )}

                    </>
                )}

                <div className="mb-3">
                    <label className="small">Dimensions de la parcelle (en hectares)</label>
                    <input
                        type="number"
                        name="dimension_ha"
                        value={DataFields?.dimension_ha}
                        className="form-control"
                        placeholder="Entrez la dimension"
                        onChange={handleInputChange}

                    />
                </div>

                <div className="mb-3">
                    <label htmlFor='photo' className="btn btn-primary form-control">
                        <FaCamera className='fs-2' />
                        <br />
                        Prendre une photo de la plantation</label>
                    <input
                        id='photo'
                        type="file"
                        name="photo"
                        className="form-control"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        hidden
                    />
                </div>

                <h6>Section D (Activitèes sur la parcelle)</h6>

                <div className="mb-3">
                    <label className="small">Utilisez-vous des engrais ?</label>
                    <select name="useFertilizers" className="form-select" onChange={handleUseFertilizersChange}
                    >
                        <option value={DataFields?.useFertilizers}>{DataFields?.useFertilizers}</option>
                        <option value="">Sélectionnez</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                    </select>
                </div>

                {useFertilizers && (
                    <div className="mb-3">
                        <label className="small">Quel type d'engrais utilisez-vous ?</label>
                        <select name="fertilizerType" className="form-select" onChange={handleInputChange}
                        >
                            <option value={DataFields?.fertilizerType}>{DataFields?.fertilizerType}</option>
                            <option value="">Sélectionnez</option>
                            <option value="Engrais mineral(NPK)">Engrais mineral(NPK)</option>
                            <option value="Engrais organique">Engrais organique</option>
                            <option value="Engrais bio">Engrais bio</option>
                            <option value="Engrais organo-mineral">Engrais organo-mineral</option>
                        </select>
                    </div>
                )}


                <div className="mb-3">
                    <label className="small">Appartenez-vous à une cooperative ?</label>
                    <select
                        name="useCooperative"
                        className="form-select"
                        onChange={handleUseCooperativeChange}
                    >
                        <option value={DataFields?.useCooperative}>{DataFields?.useCooperative}</option>
                        <option value="">Sélectionnez</option>
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                    </select>
                </div>

                {useCooperative && (
                    <div className="mb-3">
                        <label className="small">Nom de la cooperative</label>
                        <input
                            type="text"
                            name="nom_cooperative"
                            value={DataFields?.nom_cooperative}
                            className="form-control"
                            placeholder="Nom de la cooperative"
                            onChange={handleInputChange}

                        />
                    </div>
                )}

                {!load ? (
                    <button type="submit" className="btn btn-success form-control mb-5">Soumettre</button>
                ) : (
                    <button className="btn btn-warning form-control mb-5" type="button" disabled>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span role="status">Traitememt en cours...</span>
                    </button>
                )}

                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">Capturer une photo</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <div className="container">
                                    <video id="video" ref={videoRef} className='img-fluid' width={"100%"}></video>
                                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    data-bs-dismiss="modal"
                                    onClick={handleSavePhoto}
                                >
                                    Capturer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </form>
        </div>

    );
}

export default ModalNewForm
