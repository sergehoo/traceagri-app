import { useState } from "react";

import React from 'react'

function Pagination({ data }) {

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(7);

    // Calculer les indices pour les éléments à afficher
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

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

}

export default Pagination
