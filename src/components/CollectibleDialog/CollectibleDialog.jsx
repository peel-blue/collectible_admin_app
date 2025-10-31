import React, { useState, useEffect } from 'react';
import styles from './CollectibleDialog.module.css';
import { uploadImage } from '../../services/userAuth';

const CollectibleDialog = ({
    isOpen,
    onClose,
    onSubmit,
    collectible = null,
    packs = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pack_id: '',
        rarity: 'common',
        image: null,
        assets: {
            thumb: null
        },
        metadata: '{}',
        status: 'active'
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadButton, setShowUploadButton] = useState(false);

    const rarityOptions = [
        { value: 'common', label: 'Common' },
        { value: 'uncommon', label: 'Uncommon' },
        { value: 'rare', label: 'Rare' },
        { value: 'epic', label: 'Epic' },
        { value: 'legendary', label: 'Legendary' }
    ];

    // Initialize form when dialog opens or collectible data changes
    useEffect(() => {
        if (isOpen) {
            if (collectible) {
                // Edit mode
                setFormData({
                    name: collectible.name || '',
                    description: collectible.description || '',
                    pack_id: collectible.pack_id || collectible.pack_id || '',
                    rarity: collectible.rarity || 'common',
                    image: null,
                    assets: {
                        thumb: collectible.assets?.thumb || collectible.image || null
                    },
                    metadata: JSON.stringify(collectible.meta_data || {}, null, 2),
                    status: collectible.status || 'active'
                });
                setImagePreview(collectible.assets?.thumb || collectible.image || null);
            } else {
                // Add mode
                setFormData({
                    name: '',
                    description: '',
                    pack_id: '',
                    rarity: 'common',
                    image: null,
                    assets: {
                        thumb: null
                    },
                    metadata: '{}',
                    status: 'active'
                });
                setImagePreview(null);
            }
            setErrors({});
            setShowUploadButton(false);
        }
    }, [isOpen, collectible]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Please select a valid image file'
                }));
                return;
            }

            // Validate file size (10MB limit for larger images)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    image: 'Image size should be less than 10MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                image: file,
                assets: { thumb: null }
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            // Show upload button after image is selected
            setShowUploadButton(true);

            // Clear error
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: ''
                }));
            }
        }
    };

    const handleUploadImage = async () => {
        if (!formData.image) return;

        setIsUploading(true);
        try {
            const response = await uploadImage(formData.image);
            const imageUrl = response.fileUrl;

            setFormData(prev => ({
                ...prev,
                assets: { thumb: imageUrl }
            }));

            setShowUploadButton(false);

            // Clear any upload errors
            if (errors.image) {
                setErrors(prev => ({
                    ...prev,
                    image: ''
                }));
            }
        } catch {
            setErrors(prev => ({
                ...prev,
                image: 'Failed to upload image. Please try again.'
            }));
        } finally {
            setIsUploading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.pack_id) {
            newErrors.pack_id = 'Pack is required';
        }

        if (!formData.rarity) {
            newErrors.rarity = 'Rarity is required';
        }

        // Validate JSON metadata
        try {
            JSON.parse(formData.metadata);
        } catch {
            newErrors.metadata = 'Metadata must be valid JSON';
        }

        if (!collectible && !formData.image) {
            newErrors.image = 'Image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = {
                ...formData,
                metadata: JSON.parse(formData.metadata),
                id: collectible?.id
            };

            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('Error submitting collectible:', error);
            setErrors({ submit: 'Failed to save collectible. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.dialogOverlay} onClick={handleClose}>
            <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle}>
                        {collectible ? 'Edit Collectible' : 'Add New Collectible'}
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                placeholder="Enter collectible name"
                                disabled={isSubmitting}
                            />
                            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Pack *
                            </label>
                            <select
                                name="pack_id"
                                value={formData.pack_id}
                                onChange={handleInputChange}
                                className={`${styles.select} ${errors.pack_id ? styles.inputError : ''}`}
                                disabled={isSubmitting}
                            >
                                <option value="">Select a pack</option>
                                {packs.map(pack => (
                                    <option key={pack.id} value={pack.id}>
                                        {pack.name}
                                    </option>
                                ))}
                            </select>
                            {errors.pack_id && <span className={styles.errorMessage}>{errors.pack_id}</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                            placeholder="Enter collectible description"
                            rows="3"
                            disabled={isSubmitting}
                        />
                        {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Rarity *
                        </label>
                        <select
                            name="rarity"
                            value={formData.rarity}
                            onChange={handleInputChange}
                            className={`${styles.select} ${errors.rarity ? styles.inputError : ''}`}
                            disabled={isSubmitting}
                        >
                            {rarityOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {errors.rarity && <span className={styles.errorMessage}>{errors.rarity}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Metadata (JSON) *
                        </label>
                        <textarea
                            name="metadata"
                            value={formData.metadata}
                            onChange={handleInputChange}
                            className={`${styles.textarea} ${styles.metadataTextarea} ${errors.metadata ? styles.inputError : ''}`}
                            placeholder='{"strength": 75, "defense": 60, "magic": 40}'
                            rows="6"
                            disabled={isSubmitting}
                        />
                        {errors.metadata && <span className={styles.errorMessage}>{errors.metadata}</span>}
                        <small className={styles.helpText}>
                            Enter metadata as JSON format. Example: {`{"strength": 75, "defense": 60}`}
                        </small>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Collectible Image * (PNG, JPG, GIF - Max 10MB)
                        </label>
                        <div className={styles.imageUploadContainer}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.fileInput}
                                id="imageUpload"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="imageUpload" className={styles.fileInputLabel}>
                                Choose Image
                            </label>
                            {imagePreview && (
                                <div className={styles.imagePreviewContainer}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className={styles.imagePreview}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setFormData(prev => ({ ...prev, image: null, assets: { thumb: '' } }));
                                            setShowUploadButton(false);
                                        }}
                                        className={styles.removeImageButton}
                                        disabled={isSubmitting}
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            {showUploadButton && (
                                <button
                                    type="button"
                                    onClick={handleUploadImage}
                                    className={styles.uploadButton}
                                    disabled={isSubmitting || isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                </button>
                            )}
                            {formData.assets.thumb && (
                                <div className={styles.uploadSuccess}>
                                    ✅ Image uploaded successfully
                                </div>
                            )}
                        </div>
                        {errors.image && <span className={styles.errorMessage}>{errors.image}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="status"
                                checked={formData.status === 'active'}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        status: e.target.checked ? 'active' : 'inactive'
                                    }));
                                }}
                                className={styles.checkbox}
                                disabled={isSubmitting}
                            />
                            <span className={styles.checkboxText}>Enable this collectible</span>
                        </label>
                    </div>

                    {errors.submit && (
                        <div className={styles.submitError}>
                            {errors.submit}
                        </div>
                    )}

                    <div className={styles.formActions}>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={styles.cancelButton}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (collectible ? 'Update Collectible' : 'Add Collectible')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectibleDialog;