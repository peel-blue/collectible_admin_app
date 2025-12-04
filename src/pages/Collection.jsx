import React, { useState, useEffect } from 'react';
import { getAllCollections, addCollection, updateCollection } from '../services/collectionApi';
import Layout from "../components/Layout";
import CollectionDialog from "../components/CollectionDialog";
import styles from './Collection.module.css';

const Collection = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [dialogLoading, setDialogLoading] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await getAllCollections();
            console.log('Fetched collections:', data);
            setItems(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCollection = () => {
        setEditingItem(null);
        setDialogOpen(true);
    };

    const handleEditCollection = (item) => {
        setEditingItem(item);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingItem(null);
    };

    const handleSaveCollection = async (formData) => {
        try {
            setDialogLoading(true);

            // TODO: Implement API calls for create/update
            if (editingItem) {
                // Update existing collection
                await updateCollection(editingItem.id, formData);
            } else {
                // Create new collection
                await addCollection(formData);
            }

            // Refresh the list
            await fetchItems();

            // Close dialog
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving collection:', error);
            // TODO: Show error message to user
        } finally {
            setDialogLoading(false);
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
                <h1 className={styles.title}>Collections</h1>
                <button
                    className={styles.tableIcon}
                    title="Add Collection"
                    onClick={handleAddCollection}
                >
                    Add Collection
                </button>
            </div>
            <div className={styles.collectionContainer}>
                <div className={styles.tableWrapper}>
                    <table className={styles.collectionTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${item.is_active ? styles.statusActive : styles.statusInactive}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={styles.actionButton}
                                            onClick={() => handleEditCollection(item)}
                                            title="Edit Collection"
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

            <CollectionDialog
                isOpen={dialogOpen}
                onClose={handleCloseDialog}
                onSave={handleSaveCollection}
                editData={editingItem}
                isLoading={dialogLoading}
            />
        </Layout>
    );
};

export default Collection;