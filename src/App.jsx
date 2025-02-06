import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Dashbord from "./pages/Dashbord"
import ModalNewForm from "./Components/modalNewForm"
import NoSyncPage from "./Components/NoSyncPage"
import SyncPage from "./Components/SynchoPage"
import PageSaisie from "./Components/PageSaisie"
import { useEffect, useState } from "react"


function App() {


  const [load, setLoad] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setLoad(false)
    }, 1000);
  }, [])

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dash" element={<Dashbord />} />
          <Route path="/dash/form" element={<ModalNewForm />} />
          <Route path="/dash/form-update/:uid" element={<ModalNewForm />} />
          <Route path="/dash/nosync" element={<NoSyncPage />} />
          <Route path="/dash/sync" element={<SyncPage />} />
          <Route path="/dash/all" element={<PageSaisie />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
