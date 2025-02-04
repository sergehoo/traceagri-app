import React from 'react'

function ShowItems({ selectedItem }) {


    return (
        <>
            {/*  <!-- Button trigger modal --> */}
            <button id="popup" hidden type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Launch demo modal
            </button>

            {/* <!-- Modal --> */}

            <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <p className="modal-title fs-5" id="exampleModalLabel">Details</p>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Champ</th>
                                        <th>Détail</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedItem && (
                                        <>
                                            {Object.entries(selectedItem).map(([key, value]) => (
                                                <tr key={key}>
                                                    <td>{key}</td>
                                                    <td>{value !== false && value !== true ? value : value ? 'Oui' : 'Non'}</td>
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ShowItems