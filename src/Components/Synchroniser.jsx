import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCloud } from "react-icons/fa";

function Synchroniser({ data }) {

  const [sync, setSync] = useState(0)
  useEffect(() => {
    if (data && data.length > 0) {
      let cop = 0
      data.forEach((item) => {
        if (item.isSynchro === true) cop++
      })
      setSync(cop)
    }
  }, [])

  return (
    <div className='col-md-12 mb-3'>
      <Link to="/dash/sync" className="card text-decoration-none shadow hover-zoom position-relative" style={{ borderTop: "4px solid rgba(25, 135, 84, 0.7)", height: "100%" }}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className='fs-1 text-success opacity-50 me-2'><FaCloud /></span>
            <h2 className='h5'> Données Synchronisées</h2>
          </div>
          <div className='color-round rond'>
            {sync}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Synchroniser
