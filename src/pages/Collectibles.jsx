import React, { useState, useEffect, useCallback } from 'react';
import Layout from "../components/Layout";
import CollectibleDialog from "../components/CollectibleDialog";
import styles from './Collectibles.module.css';
import { getAllCollectibles, createCollectible, updateCollectible, deleteCollectible } from '../services/collectibleApi';
import { getAllCollections } from '../services/collectionApi';

const Collectibles = () => {
    const [items, setItems] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const pageSize = 10;

    const fetchItems = useCallback(async (page = 1, collectionId = selectedCollectionId) => {
        try {
            setLoading(true);
            // Ensure empty string is converted to null
            const collectionFilter = collectionId === '' ? null : collectionId;
            console.log('Fetching items with:', { page, pageSize, collectionFilter }); // Debug log
            const data = await getAllCollectibles(page, pageSize, collectionFilter);
            setItems(data.data.items);
            setTotalPages(data.data.totalPages);
            setTotalItems(data.data.total);
            setCurrentPage(page);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedCollectionId, pageSize]);

    useEffect(() => {
        fetchItems();
        fetchCollections();
    }, [fetchItems]);

    const fetchCollections = async () => {
        try {
            const data = await getAllCollections();
            console.log('Fetched collections:', data); // Debug log
            setCollections(data.data);
        } catch (err) {
            console.error('Error fetching collections:', err);
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
            await fetchItems(currentPage, selectedCollectionId);

            // Close dialog
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving collectible:', error);
            // Don't close dialog on error so user can try again
            throw error;
        }
    };

    const handleCollectionFilterChange = (event) => {
        const collectionId = event.target.value;
        console.log('Collection filter changed to:', collectionId); // Debug log
        setSelectedCollectionId(collectionId);
        setCurrentPage(1); // Reset to first page when filter changes
        fetchItems(1, collectionId || null);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchItems(newPage, selectedCollectionId);
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
        setDeleteError(null);
    };

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const response = await deleteCollectible(itemToDelete.id);

            // Check if response status is true (success) or false (error)
            if (response.status === true) {
                // Success case
                const successMessage = response.message || 'Collectible deleted successfully';
                setDeleteError({ message: successMessage, type: 'success' });
                // Refresh the list after a short delay to show the success message
                setTimeout(async () => {
                    await fetchItems(currentPage, selectedCollectionId);
                    setDeleteConfirmOpen(false);
                    setItemToDelete(null);
                    setDeleteError(null);
                }, 1500);
            } else {
                // Error case - status is false
                const errorMessage = response.message || 'Failed to delete collectible';
                setDeleteError({ message: errorMessage, type: 'error' });
            }
        } catch (error) {
            console.error('Error deleting collectible:', error);
            // Extract error message from API response
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete collectible';
            setDeleteError({ message: errorMessage, type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        setDeleteError(null);
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
                        value={selectedCollectionId}
                        onChange={handleCollectionFilterChange}
                        className={styles.packFilter}
                    >
                        <option value="">All Collections</option>
                        {collections.map((collection) => (
                            <option key={collection.id} value={collection.id}>
                                {collection.name}
                            </option>
                        ))}
                    </select>
                    <button
                        className={styles.tableIcon}
                        title="Add Collectible"
                        onClick={handleAddCollectible}
                    >
                        Add Collectible
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
                                <th>Collection</th>
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
                                    <td>{item.collection_name || 'N/A'}</td>
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
                    {items.length === 0 && (
                        <div className={styles.noDataMessage}>
                            <p>No data found</p>
                        </div>
                    )}
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
            />

            {/* Delete Confirmation Dialog */}
            {deleteConfirmOpen && (
                <div className={styles.deleteConfirmDialog}>
                    <div className={styles.deleteConfirmContent}>
                        <h3>Delete Collectible</h3>
                        <p>Are you sure you want to delete "{itemToDelete?.name}"?</p>
                        {!deleteError && <p>This action cannot be undone.</p>}
                        {deleteError && (
                            <div className={`${styles.deleteMessage} ${deleteError.type === 'success' ? styles.deleteMessageSuccess : styles.deleteMessageError}`}>
                                {deleteError.message}
                            </div>
                        )}
                        <div className={styles.deleteConfirmActions}>
                            <button
                                className={styles.deleteConfirmCancel}
                                onClick={handleDeleteCancel}
                                disabled={isDeleting}
                            >
                                {deleteError?.type === 'success' ? 'Close' : 'Cancel'}
                            </button>
                            {!deleteError && (
                                <button
                                    className={styles.deleteConfirmProceed}
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Collectibles;