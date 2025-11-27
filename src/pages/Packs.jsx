import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import PackDialog from "../components/PackDialog";
import RarityConfigDialog from "../components/RarityConfigDialog";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog/DeleteConfirmDialog";
import styles from './Packs.module.css';
import { getAllPacks, createPack, updatePack, deletePack } from '../services/packApi';
import { getAllCollections } from '../services/collectionApi';

const Packs = () => {
    const [items, setItems] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRarity, setEditingRarity] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchItems();
        fetchCollections();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await getAllPacks();
            setItems(data.data.items);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const data = await getAllCollections();
            setCollections(data.data);
        } catch (err) {
            console.error('Error fetching collections:', err);
        }
    };

    const handleAddPack = () => {
        setEditingItem(null);
        setDialogOpen(true);
    };

    const handleEditPack = (item) => {
        setEditingItem(item);
        setDialogOpen(true);
    };

    const handleOpenPackConfig = (item) => {
        setEditingItem(item);
        setEditingRarity(true);
    };

    const handleDeletePack = (item) => {
        setItemToDelete(item);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await deletePack(itemToDelete.id);
            await fetchItems();
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error('Error deleting pack:', error);
            alert('Failed to delete pack');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingItem(null);
    };

    const handleSavePack = async (formData) => {
        try {
            // TODO: Replace with actual API calls when backend is ready
            if (editingItem) {
                // Update existing pack
                console.log('Updating pack:', { id: editingItem.id, ...formData });
                await updatePack(editingItem.id, formData);
            } else {
                // Create new pack
                console.log('Creating pack:', formData);
                await createPack(formData);
            }

            // Refresh the list
            await fetchItems();

            // Close dialog
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving pack:', error);
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
                <h1 className={styles.title}>Packs</h1>
                <button
                    className={styles.tableIcon}
                    title="Add Pack"
                    onClick={handleAddPack}
                >
                    ➕
                </button>
            </div>
            <div className={styles.packsContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.packsTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Collection</th>
                                <th>Price</th>
                                <th>Supply</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.collection_name || 'N/A'}</td>
                                    <td>{item.price || '0.00'}</td>
                                    <td>{item.total_supply || '0'}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${item.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                            {item.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className={styles.actionCell}>
                                        <button
                                            className={styles.menuButton}
                                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                            title="Actions"
                                        >
                                            ⋮
                                        </button>
                                        {openMenuId === item.id && (
                                            <div className={styles.actionMenu}>
                                                <button
                                                    className={styles.menuItem}
                                                    onClick={() => {
                                                        handleEditPack(item);
                                                        setOpenMenuId(null);
                                                    }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    className={styles.menuItem}
                                                    onClick={() => {
                                                        handleOpenPackConfig(item);
                                                        setOpenMenuId(null);
                                                    }}
                                                >
                                                    ⚙️ Config
                                                </button>
                                                <button
                                                    className={styles.menuItem}
                                                    onClick={() => {
                                                        handleDeletePack(item);
                                                        setOpenMenuId(null);
                                                    }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PackDialog
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleSavePack}
                pack={editingItem}
                collections={collections}
            />

            <RarityConfigDialog
                isOpen={editingRarity}
                onClose={() => setEditingRarity(false)}
                packId={editingItem ? editingItem.id : null}
            />

            <DeleteConfirmDialog
                isOpen={deleteConfirmOpen}
                title="Delete Pack"
                message={itemToDelete ? `Are you sure you want to delete "${itemToDelete.name}"?` : ''}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                isDeleting={isDeleting}
            />
        </Layout>
    );
};

export default Packs;