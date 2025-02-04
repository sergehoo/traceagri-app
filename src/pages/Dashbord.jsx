import React, { useEffect, useState } from 'react'
import Synchroniser from '../Components/Synchroniser'
import NonSynchro from '../Components/NonSynchro'
import Saisie from '../Components/Saisie'
import { IoIosLogOut } from "react-icons/io";
import NewBtn from '../Components/NewBtn'
import { useSnackbar } from 'notistack';
import { SynchroAuto } from '../controller/SynchroAuto';

function Dashbord() {

    const { enqueueSnackbar } = useSnackbar()

    const [user, setUser] = useState(null)
    const [data, setData] = useState(null)
    const [load, setLoad] = useState(true)
    const [cardLoad, setCardLoad] = useState(true)
    const [Synchroloading, setSynchroloading] = useState(true)
    const [hasSynched, setHasSynched] = useState(false);

    const LogOut = () => {
        localStorage.removeItem("token")
        location.href = "/"
    }

    const Synchro = async (userInfo) => {

        const res = await SynchroAuto(userInfo)
        if (res && res.status === 201) {
            setData(res.data)
        } else {
            const collection = JSON.parse(localStorage.getItem("data")) || [];
            setData(collection);
        }
        setTimeout(() => {
            setSynchroloading(false)
            setTimeout(() => {
                setCardLoad(false)
                sessionStorage.setItem("hasSynched", "true")
            }, 1000)
            if (res && res.status === 201) {
                enqueueSnackbar(res.message, { variant: "success" })
            } else {
                enqueueSnackbar(res.message, { variant: "danger" })
            }
        }, 2000);
    }

    useEffect(() => {

        const initializeData = async () => {
            const userInfo = JSON.parse(localStorage.getItem("token"));
            setUser(userInfo);
            setLoad(false);
            await Synchro(userInfo);
        };

        const hasSynched = sessionStorage.getItem("hasSynched");
        if (!hasSynched) {
            initializeData()
        } else {
            const userInfo = JSON.parse(localStorage.getItem("token"));
            const collection = JSON.parse(localStorage.getItem("data")) || []
            setData(collection);
            setUser(userInfo);
            setLoad(false);
            setSynchroloading(false)
            setTimeout(() => {
                setCardLoad(false)
            }, 1000)
        }

    }, [])

    if (!load) {
        if (user && user.token !== "") {
            return (
                <>

                    {Synchroloading ? (
                        <div className='d-flex justify-content-center align-items-center ' style={{ height: "100vh" }}>
                            <div className='container text-center'>
                                <div className="clearfix">
                                    <div className="spinner-border float-center text-success" role="status">
                                    </div>
                                </div>
                                <p>Synchronisation des données en cours de traitement</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {user && user.username !== "" &&
                                <headr className="d-flex align-items-center px-3 justify-content-between bg-success">
                                    <p className='fw-bold text-white pt-3'>{user.username}</p>
                                    <button className='btn btn-light btn-sm' onClick={() => LogOut()}><IoIosLogOut /></button>
                                </headr>
                            }
                            <div className='py-5'>
                                <div className="container px-4">
                                    <h2 className='fw-bold text-center mb-5 h4'>Statistique des Données</h2>
                                    <div className="row">

                                        {cardLoad ? (
                                            <>
                                                <div className='col-md-12 mb-3'>
                                                    <div className="card p-3 shadow">
                                                        <div className="card-body d-flex justify-content-between align-items-center placeholder-glow">
                                                            <div className='col-8 '>
                                                                <h2 className="placeholder col-12"></h2>
                                                                <br />
                                                                <p className="placeholder col-8 "></p>
                                                            </div>
                                                            <div className='placeholder rond'>
                                                                <span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-md-12 mb-3'>
                                                    <div className="card p-3 shadow">
                                                        <div className="card-body d-flex justify-content-between align-items-center placeholder-glow">
                                                            <div className='col-8 '>
                                                                <h2 className="placeholder col-12"></h2>
                                                                <br />
                                                                <p className="placeholder col-8 "></p>
                                                            </div>
                                                            <div className='placeholder rond'>
                                                                <span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='col-md-12 mb-3'>
                                                    <div className="card p-3 shadow">
                                                        <div className="card-body d-flex justify-content-between align-items-center placeholder-glow">
                                                            <div className='col-8 '>
                                                                <h2 className="placeholder col-12"></h2>
                                                                <br />
                                                                <p className="placeholder col-8 "></p>
                                                            </div>
                                                            <div className='placeholder rond'>
                                                                <span></span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <p className="card-text placeholder-glow">
                                                        <span className="placeholder form-control rounded-2 p-3"></span>
                                                    </p>
                                                </div>
                                            </>

                                        ) : (
                                            <>  <Saisie data={data} />
                                                <Synchroniser data={data} />
                                                <NonSynchro data={data} />
                                                <NewBtn />
                                            </>
                                        )}



                                    </div>
                                </div>
                            </div>

                        </>
                    )}
                </>
            )
        } else {
            location.href = "/"
        }
    } else {
        return (
            <>
                <div className='d-flex justify-content-center align-items-center ' style={{ height: "100vh" }}>
                    <div className='container text-center'>
                        <div className="clearfix">
                            <div className="spinner-border float-center text-success" role="status">
                            </div>
                        </div>
                        <p>Vérification de l'utilisateur</p>
                    </div>
                </div>
            </>
        )
    }

}

export default Dashbord
