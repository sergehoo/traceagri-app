import React from 'react'
import { IoIosAddCircle } from "react-icons/io";
import { Link } from 'react-router-dom';

function NewBtn() {
  return (
    <div className='col-md-12 mb-3'>
      <Link className='btn btn-success form-control' to={"/dash/form"}>Nouvelle enquette <IoIosAddCircle /></Link>
    </div>
  )
}

export default NewBtn
