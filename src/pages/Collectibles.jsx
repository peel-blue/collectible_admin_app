import React, { useState, useEffect, useCallback } from 'react';
import Layout from "../components/Layout";
import CollectibleDialog from "../components/CollectibleDialog";
import styles from './Collectibles.module.css';
import { getAllCollectibles, createCollectible, updateCollectible, deleteCollectible } from '../services/collectibleApi';
import { getAllPacks } from '../services/packApi';

const Collectibles = () => {
    const [items, setItems] = useState([]);
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedPackId, setSelectedPackId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const pageSize = 10;

    const fetchItems = useCallback(async (page = 1, packId = selectedPackId) => {
        try {
            setLoading(true);
            // Ensure empty string is converted to null
            const packFilter = packId === '' ? null : packId;
            console.log('Fetching items with:', { page, pageSize, packFilter }); // Debug log
            const data = await getAllCollectibles(page, pageSize, packFilter);
            setItems(data.data.items);
            setTotalPages(data.data.totalPages);
            setTotalItems(data.data.total);
            setCurrentPage(page);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedPackId, pageSize]);

    useEffect(() => {
        fetchItems();
        fetchPacks();
    }, [fetchItems]);

    const fetchPacks = async () => {
        try {
            const data = await getAllPacks();
            console.log('Fetched packs:', data); // Debug log
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
            await fetchItems(currentPage, selectedPackId);

            // Close dialog
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving collectible:', error);
            // Don't close dialog on error so user can try again
            throw error;
        }
    };

    const handlePackFilterChange = (event) => {
        const packId = event.target.value;
        console.log('Pack filter changed to:', packId); // Debug log
        setSelectedPackId(packId);
        setCurrentPage(1); // Reset to first page when filter changes
        fetchItems(1, packId || null);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchItems(newPage, selectedPackId);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteCollectible(itemToDelete.id);
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
            // Refresh the list
            await fetchItems(currentPage, selectedPackId);
        } catch (error) {
            console.error('Error deleting collectible:', error);
            // Keep dialog open on error
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
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
                <div className={styles.headerControls}>
                    <select
                        value={selectedPackId}
                        onChange={handlePackFilterChange}
                        className={styles.packFilter}
                    >
                        <option value="">All Packs</option>
                        {packs.map((pack) => (
                            <option key={pack.id} value={pack.id}>
                                {pack.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className={styles.tableIcon}
                        title="Add Collectible"
                        onClick={handleAddCollectible}
                    >
                        ➕
                    </button>
                </div>
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
                                        <div className={styles.actionButtons}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => handleEditCollectible(item)}
                                                title="Edit Collectible"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteClick(item)}
                                                title="Delete Collectible"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className={styles.paginationContainer}>
                        <div className={styles.paginationInfo}>
                            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
                        </div>
                        <div className={styles.paginationControls}>
                            <button
                                className={styles.paginationButton}
                                onClick={handlePrevious}
                                disabled={currentPage === 1}
                                title="Previous page"
                            >
                                ←
                            </button>
                            <span className={styles.pageInfo}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                className={styles.paginationButton}
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                                title="Next page"
                            >
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <CollectibleDialog
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSaveCollectible}
                collectible={editingItem}
                packs={packs}
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmOpen && (
                <div className={styles.deleteConfirmDialog}>
                    <div className={styles.deleteConfirmContent}>
                        <h3>Delete Collectible</h3>
                        <p>Are you sure you want to delete "{itemToDelete?.name}"?</p>
                        <p>This action cannot be undone.</p>
                        <div className={styles.deleteConfirmActions}>
                            <button
                                className={styles.deleteConfirmCancel}
                                onClick={handleDeleteCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.deleteConfirmProceed}
                                onClick={handleDeleteConfirm}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Collectibles;