import React, { useState, useEffect } from 'react';
import Layout from "../components/Layout";
import styles from './Config.module.css';
import { getAllConfigs, updateConfig } from '../services/configApi';

const Config = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getAllConfigs();
            const configList = (data.data || []).map(config => ({
                id: config.id,
                key: config.key,
                value: config.value,
                type: config.value_type || 'string'
            }));
            setConfigs(configList);
        } catch (err) {
            console.error('Error fetching configs:', err);
            setError(err.message || 'Failed to fetch configurations');
        } finally {
            setLoading(false);
        }
    };

    const handleEditStart = (config) => {
        setEditingId(config.id);
        setEditingValue(config.value);
        setSuccessMessage('');
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingValue('');
        setSuccessMessage('');
    };

    const handleSave = async (config) => {
        try {
            setSaving(true);
            setError(null);

            // Convert boolean values to 1/0 for API
            let valueToSend = editingValue;
            if (config.type === 'bool') {
                valueToSend = editingValue === 'true' ? 1 : 0;
            }

            await updateConfig({
                id: config.id,
                value: valueToSend
            });

            // Fetch updated list from API
            await fetchConfigs();

            setSuccessMessage(`${config.key} updated successfully`);
            setEditingId(null);
            setEditingValue('');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating config:', err);
            setError(err.message || 'Failed to update configuration');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Layout>
            <div className={styles.loading}>Loading configurations...</div>
        </Layout>
    );

    return (
        <Layout>
            <div className={styles.configsContainer}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Configuration</h1>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}
                {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

                <div className={styles.tableWrapper}>
                    {configs.length === 0 ? (
                        <div className={styles.noData}>No configurations found</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Key</th>
                                    <th>Value</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs.map((config) => (
                                    <tr key={config.id}>
                                        <td className={styles.keyCell}>
                                            {config.key}
                                        </td>
                                        <td className={styles.valueCell}>
                                            {editingId === config.id ? (
                                                config.type === 'bool' ? (
                                                    <div className={styles.radioGroup}>
                                                        <label className={styles.radioLabel}>
                                                            <input
                                                                type="radio"
                                                                name={`config-${config.id}`}
                                                                value="true"
                                                                checked={editingValue === 'true' || editingValue === true}
                                                                onChange={() => setEditingValue('true')}
                                                            />
                                                            <span>True</span>
                                                        </label>
                                                        <label className={styles.radioLabel}>
                                                            <input
                                                                type="radio"
                                                                name={`config-${config.id}`}
                                                                value="false"
                                                                checked={editingValue === 'false' || editingValue === false}
                                                                onChange={() => setEditingValue('false')}
                                                            />
                                                            <span>False</span>
                                                        </label>
                                                    </div>
                                                ) : config.type === 'num' ? (
                                                    <input
                                                        type="number"
                                                        className={styles.editInput}
                                                        value={editingValue}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        placeholder="Enter number"
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        className={styles.editInput}
                                                        value={editingValue}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        placeholder="Enter value"
                                                    />
                                                )
                                            ) : (
                                                <span className={styles.value}>
                                                    {config.type === 'bool' ? (String(config.value) === '1' ? 'true' : 'false') : config.value}
                                                </span>
                                            )}
                                        </td>
                                        <td className={styles.actionCell}>
                                            {editingId === config.id ? (
                                                <div className={styles.actionButtons}>
                                                    <button
                                                        className={styles.saveButton}
                                                        onClick={() => handleSave(config)}
                                                        disabled={saving}
                                                    >
                                                        {saving ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button
                                                        className={styles.cancelButton}
                                                        onClick={handleEditCancel}
                                                        disabled={saving}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => handleEditStart(config)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Config;
