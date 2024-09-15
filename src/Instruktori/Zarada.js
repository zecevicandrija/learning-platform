import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './Zarada.css';

const Zarada = ({ kursevi }) => {
    const [zarada, setZarada] = useState(0);
    const [selectedKurs, setSelectedKurs] = useState(''); // State for filtering by course
    const [filteredZarada, setFilteredZarada] = useState(0); // State for filtered revenue
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Zarada po danu',
                data: [],
                borderColor: '#36a2eb',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
            },
        ],
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchKupovine = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/kupovina/popularity');
            if (response.ok) {
                const data = await response.json();
                return data; // Assuming it returns an array with course IDs and purchase counts
            } else {
                console.error('Failed to fetch purchases');
                return [];
            }
        } catch (error) {
            console.error('Error fetching purchases:', error);
            return [];
        }
    };

    const izracunajZaradu = async () => {
        const kupovine = await fetchKupovine();
        let total = 0;
        let filteredTotal = 0;

        kursevi.forEach(kurs => {
            const kursKupovine = kupovine.find(k => k.kurs_id === kurs.id);
            const brojKupovina = kursKupovine ? kursKupovine.broj_kupovina : 0;
            const zaradaPoKursu = brojKupovina * kurs.cena;

            total += zaradaPoKursu;
            
            if (selectedKurs === '' || selectedKurs === kurs.id.toString()) {
                filteredTotal += zaradaPoKursu;
            }
        });

        setZarada(total);
        setFilteredZarada(filteredTotal);
    };

    const renderChart = (filteredKupovine = []) => {
        if (!Array.isArray(filteredKupovine)) {
            filteredKupovine = [];
        }

        const labels = filteredKupovine.map(kupovina => kupovina.datum_kupovine);
        const data = filteredKupovine.map(kupovina => kupovina.cena);

        setChartData({
            labels: labels || [],
            datasets: [
                {
                    label: 'Zarada po danu',
                    data: data || [],
                    borderColor: '#36a2eb',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true,
                    tension: 0.3, // Smooth curve
                },
            ],
        });
        setIsLoading(false); // Stop the loader once data is ready
    };

    useEffect(() => {
        izracunajZaradu();
        renderChart(); // Update chart data
    }, [kursevi, selectedKurs]); // Recalculate on kursevi or filter change

    return (
        <div className="zarada-container">
            <h3>Ukupna Zarada: {zarada}$</h3>
            <div className="filter-container">
                <label htmlFor="kurs-select">Filtriraj po kursu: </label>
                <select
                    id="kurs-select"
                    value={selectedKurs}
                    onChange={(e) => setSelectedKurs(e.target.value)}
                    className="filter-select"
                >
                    <option value="">Svi kursevi</option>
                    {kursevi.map(kurs => (
                        <option key={kurs.id} value={kurs.id}>
                            {kurs.naziv}
                        </option>
                    ))}
                </select>
            </div>
            <h4>Zarada za odabrani kurs: {filteredZarada}$</h4>

            {/* Line Chart */}
            <div className="chart-container">
                <h4>Zarada po danu</h4>
                {isLoading ? (
                    <p>Loading chart data...</p>
                ) : (
                    <Line data={chartData} className="chartklasa" />
                )}
            </div>
        </div>
    );
};

export default Zarada;
