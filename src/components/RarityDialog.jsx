import React, { useState, useEffect } from "react";
import styles from "./RarityDialog.module.css";

const RarityDialog = ({ isOpen, onClose, onSubmit, rarity }) => {
    const [formData, setFormData] = useState({
        rarity_name: "",
        default_weight: "",
        is_active: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (rarity) {
            setFormData({
                rarity_name: rarity.name || "",
                default_weight: rarity.default_weight || "",
                is_active: rarity.is_active !== undefined ? rarity.is_active : true
            });
        } else {
            setFormData({ rarity_name: "", default_weight: "", is_active: true });
        }
        setErrors({});
    }, [rarity, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.rarity_name.trim()) newErrors.rarity_name = "Name is required";
        if (formData.default_weight === "" || isNaN(Number(formData.default_weight))) newErrors.default_weight = "Weight must be a number";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            name: formData.rarity_name,
            default_weight: Number(formData.default_weight),
            is_active: formData.is_active
        });
    };

    if (!isOpen) return null;

    return (
        <div className={styles.dialogOverlay} onClick={onClose}>
            <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle}>{rarity ? 'Edit Rarity' : 'Add Rarity'}</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Name *</label>
                            <input
                                type="text"
                                name="rarity_name"
                                value={formData.rarity_name}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.rarity_name ? styles.inputError : ''}`}
                                placeholder="Enter rarity name"
                                disabled={false}
                            />
                            {errors.rarity_name && <span className={styles.errorMessage}>{errors.rarity_name}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Default Weight *</label>
                            <input
                                type="number"
                                name="default_weight"
                                value={formData.default_weight}
                                onChange={handleChange}
                                className={`${styles.input} ${errors.default_weight ? styles.inputError : ''}`}
                                placeholder="Enter default weight"
                            />
                            {errors.default_weight && <span className={styles.errorMessage}>{errors.default_weight}</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className={styles.checkbox}
                            />
                            <span className={styles.checkboxText}>Active</span>
                        </label>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
                        <button type="submit" className={styles.submitButton}>{rarity ? 'Update Rarity' : 'Add Rarity'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RarityDialog;
