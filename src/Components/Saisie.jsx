import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaFilePen } from "react-icons/fa6";

function Saisie({ data }) {

  return (
    <div className='col-md-12 mb-3'>
      <Link to="/dash/all" className="card text-decoration-none shadow hover-zoom position-relative" style={{ borderTop: "4px solid rgba(25, 135, 84, 0.7)", height: "100%" }}>
        <div className="card-body d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className='fs-1 text-success opacity-50 me-2'><FaFilePen /></span>
            <h2 className='h5'> Données saisies</h2>
          </div>
          <div className='color-round rond'>
            {data && data.length > 0 ? data.length : 0}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default Saisie
