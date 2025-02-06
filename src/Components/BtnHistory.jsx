import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

function BtnHistory() {

    const navigate = useNavigate();

    return (
        <span className='btn btn-transparent' onClick={() => navigate(-1)}><FaArrowLeft /></span>
    )
}

export default BtnHistory