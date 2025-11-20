import React, { useEffect, useState } from "react";
import { getRarities, addRarity, updateRarity } from "../services/rarityApi";
import RarityDialog from "../components/RarityDialog";
import Layout from "../components/Layout";
import styles from "./Rarities.module.css";

const Rarities = () => {
    const [rarities, setRarities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRarity, setEditingRarity] = useState(null);

    const fetchRarities = () => {
        setLoading(true);
        getRarities(null)
            .then((data) => {
                const rarities = (data.data || []).map(r => ({
                    id: r.id,
                    name: r.name,
                    default_weight: r.default_weight,
                    is_active: r.is_active
                }));
                setRarities(rarities);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to fetch rarities");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRarities();
    }, []);

    const handleAddRarity = () => {
        setEditingRarity(null);
        setDialogOpen(true);
    };

    const handleEditRarity = (rarity) => {
        setEditingRarity(rarity);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingRarity(null);
    };

    const handleSaveRarity = async (formData) => {
        try {
            if (editingRarity) {
                await updateRarity(editingRarity.id, formData);
            } else {
                await addRarity(formData);
            }
            fetchRarities();
            handleCloseDialog();
        } catch (err) {
            console.error("Error saving rarity:", err);
            alert("Failed to save rarity");
        }
    };

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.raritiesContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Rarities</h1>
                        <div className={styles.headerControls}>
                            <button
                                className={styles.tableIcon}
                                title="Add Rarity"
                                onClick={handleAddRarity}
                            >
                                ➕
                            </button>
                        </div>
                    </div>
                    <div className={styles.tableWrapper}>
                        {loading && <div className={styles.loading}>Loading...</div>}
                        {error && <div className={styles.error}>{error}</div>}
                        {!loading && !error && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>NAME</th>
                                        <th>DEFAULT WEIGHT</th>
                                        <th>STATUS</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rarities.map((rarity) => (
                                        <tr key={rarity.id}>
                                            <td>{rarity.id}</td>
                                            <td>
                                                <span className={styles.nameCell}>{rarity.name}</span>
                                            </td>
                                            <td>{rarity.default_weight}</td>
                                            <td>
                                                <span className={rarity.is_active ? styles.statusActive : styles.statusInactive}>
                                                    {rarity.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className={styles.actionButton} title="Edit Rarity" onClick={() => handleEditRarity(rarity)}>
                                                    ✏️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
            <RarityDialog
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSaveRarity}
                rarity={editingRarity}
            />
        </Layout>
    );
};

export default Rarities;
