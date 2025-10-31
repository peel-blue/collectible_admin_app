import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import CollectibleDialog from "../components/CollectibleDialog";
import styles from './Collectibles.module.css';
import { getAllCollectibles, createCollectible, updateCollectible } from '../services/collectibleApi';
import { getAllPacks } from '../services/packApi';

const Collectibles = () => {
    const [items, setItems] = useState([]);
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchItems();
        fetchPacks();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await getAllCollectibles();
            setItems(data.data.items);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPacks = async () => {
        try {
            // TODO: Replace with actual API call when backend is ready
            const data = await getAllPacks();
            setPacks(data.data.items);
        } catch (err) {
            console.error('Error fetching packs:', err);
        }
    };

    const handleAddCollectible = () => {
        setEditingItem(null);
        setDialogOpen(true);
    };

    const handleEditCollectible = (item) => {
        setEditingItem(item);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingItem(null);
    };

    const handleSaveCollectible = async (formData) => {
        try {
            // TODO: Replace with actual API calls when backend is ready
            if (editingItem) {
                // Update existing collectible
                console.log('Updating collectible:', { id: editingItem.id, ...formData });
                await updateCollectible(editingItem.id, formData);
            } else {
                // Create new collectible
                console.log('Creating collectible:', formData);
                await createCollectible(formData);
            }

            // Refresh the list
            await fetchItems();

            // Close dialog
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving collectible:', error);
            // Don't close dialog on error so user can try again
            throw error;
        }
    };

    if (loading) return (
        <Layout>
            <div className={styles.loading}>Loading...</div>
        </Layout>
    );

    if (error) return (
        <Layout>
            <div className={styles.error}>Error: {error}</div>
        </Layout>
    );

    return (
        <Layout>
            <div className={styles.header}>
                <h1 className={styles.title}>Collectibles</h1>
                <button
                    className={styles.tableIcon}
                    title="Add Collectible"
                    onClick={handleAddCollectible}
                >
                    ➕
                </button>
            </div>
            <div className={styles.collectiblesContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.collectiblesTable}>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Pack</th>
                                <th>Rarity</th>
                                <th>Total Qty</th>
                                <th>Revealed</th>
                                {/* <th>Status</th> */}
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div className={styles.imageContainer}>
                                            <img
                                                src={item.assets.thumb || '/images/placeholder.png'}
                                                alt={item.name}
                                                className={styles.collectibleImage}
                                            />
                                        </div>
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.pack_name || 'N/A'}</td>
                                    <td>
                                        <span className={`${styles.rarityBadge} ${styles[`rarity${item.rarity?.charAt(0).toUpperCase()}${item.rarity?.slice(1)}`]}`}>
                                            {item.rarity || 'Common'}
                                        </span>
                                    </td>
                                    <td>{item.total_quantity || '0'}</td>
                                    <td>{item.total_revealed || '0'}</td>
                                    {/* <td>
                                        <span className={`${styles.statusBadge} ${item.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                            {item.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td> */}
                                    <td>
                                        <button
                                            className={styles.actionButton}
                                            onClick={() => handleEditCollectible(item)}
                                            title="Edit Collectible"
                                        >
                                            ✏️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CollectibleDialog
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSaveCollectible}
                collectible={editingItem}
                packs={packs}
            />
        </Layout>
    );
};

export default Collectibles;