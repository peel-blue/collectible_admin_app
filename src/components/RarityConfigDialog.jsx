import React, { useEffect, useState, useMemo } from 'react';
import styles from './RarityConfigDialog.module.css';
import { getRarities, updateRarity, addPackRarities } from '../services/rarityApi';

const RarityConfigDialog = ({ isOpen, onClose, packId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [values, setValues] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchRarityConfigs();
        }
    }, [isOpen]);

    const fetchRarityConfigs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getRarities(packId);
            const list = (data.data || []).map(r => ({
                id: r.id,
                name: r.name,
                default_weight: r.default_weight,
                weight: r.weight ?? r.meta_data?.weight ?? null,
                meta: r.meta_data || null
            }));
            setItems(list);
            // prepare values map: use meta.config value if present else ''
            const map = {};
            list.forEach(i => {
                // if weight is present use it; otherwise use default_weight
                const w = (i.weight !== null && i.weight !== undefined) ? i.weight : i.default_weight;
                map[i.id] = w != null ? String(w) : '';
            });
            setValues(map);
        } catch (e) {
            console.error('Failed to load rarities', e);
            setError('Failed to load rarities');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (id, value) => {
        // Clear any previous validation error when user edits
        setError(null);
        setValues(prev => ({ ...prev, [id]: value }));
    };

    // compute total of all weights; empty values treated as 0
    const total = useMemo(() => {
        if (!items || items.length === 0) return 0;
        return items.reduce((acc, item) => {
            const v = values[item.id];
            let n = 0;
            if (v === '' || v === undefined || v === null) {
                n = 0;
            } else {
                n = Number(v);
            }
            return acc + (isNaN(n) ? 0 : n);
        }, 0);
    }, [items, values]);

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        // Validate that total equals exactly 100 (allow tiny float tolerance)
        const delta = Math.abs(total - 100);
        if (delta > 1e-6) {
            setError(`Total weight must equal 100. Current total: ${Number(total).toFixed(2)}`);
            setSaving(false);
            return;
        }
        try {
            // Update only those with changed values; send meta_data with config
            if (packId) {
                // For a pack, send a single request to assign rarities (rarityId + weight)
                const payload = {
                    rarities: items.map(item => ({ rarityId: item.id, weight: values[item.id] === '' ? null : Number(values[item.id]) }))
                };
                await addPackRarities(packId, payload);
            } else {
                const updates = items.map(item => {
                    const newVal = values[item.id] ?? '';
                    // Save numeric weight (if empty, send null to reset)
                    const payload = { weight: newVal === '' ? null : Number(newVal) };
                    return updateRarity(item.id, payload);
                });
                await Promise.all(updates);
            }
            onClose();
        } catch (e) {
            console.error('Failed to save config', e);
            setError('Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.dialogOverlay} onClick={onClose}>
            <div className={styles.dialogContent} onClick={e => e.stopPropagation()}>
                <div className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle}>Rarity Config</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <div className={styles.form}>
                    <div className={styles.content}>
                        {loading && <div className={styles.loading}>Loading...</div>}
                        {error && <div className={styles.error}>{error}</div>}
                        {!loading && !error && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Config</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(item => (
                                        <tr key={item.id}>
                                            <td className={styles.small}>{item.id}</td>
                                            <td>{item.name}</td>
                                            <td>
                                                <input
                                                    className={styles.input}
                                                    type="number"
                                                    value={values[item.id] ?? ''}
                                                    onChange={e => handleChange(item.id, e.target.value)}
                                                    placeholder="Enter weight"
                                                    min="0"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {!loading && !error && (
                            <div className={styles.totalRow}>
                                <span>Total:</span>
                                <strong className={styles.totalValue}>{Number(total).toFixed(2)}</strong>
                            </div>
                        )}
                        {!loading && Math.abs(total - 100) > 1e-6 && (
                            <div className={styles.totalError}>Total must equal 100. Current: {Number(total).toFixed(2)}</div>
                        )}
                    </div>

                    <div className={styles.formActions}>
                        <button className={styles.cancelButton} onClick={onClose} disabled={saving}>Cancel</button>
                        <button className={styles.submitButton} onClick={handleSave} disabled={saving || Math.abs(total - 100) > 1e-6}>{saving ? 'Saving...' : 'Save'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RarityConfigDialog;
