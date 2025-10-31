import React, { useState, useEffect } from 'react';
import styles from './PackDialog.module.css';
import { uploadImage } from '../../services/userAuth';

const PackDialog = ({
    isOpen,
    onClose,
    onSubmit,
    pack = null,
    collections = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        total_supply: '',
        collection_id: '',
        icon: null,
        assets: {},
        status: 'active'
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadButton, setShowUploadButton] = useState(false);

    // Initialize form when dialog opens or pack data changes
    useEffect(() => {
        if (isOpen) {
            if (pack) {
                // Edit mode
                setFormData({
                    name: pack.name || '',
                    description: pack.description || '',
                    price: pack.price || '',
                    total_supply: pack.total_supply || pack.total_supply || '',
                    collection_id: pack.collection_id || pack.collection_id || '',
                    icon: null,
                    iconUrl: pack.assets?.thumb || '',
                    assets: pack.assets || {
                        thumb: pack.assets?.thumb || null
                    },
                    status: pack.status || 'active'
                });
                setImagePreview(pack.assets?.thumb || null);
            } else {
                // Add mode
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    total_supply: '',
                    collection_id: '',
                    icon: null,
                    assets: {
                        thumb: null
                    },
                    status: 'active'
                });
                setImagePreview(null);
            }
            setShowUploadButton(false);
            setErrors({});
        }
    }, [isOpen, pack]);

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
                    icon: 'Please select a valid image file'
                }));
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    icon: 'Image size should be less than 5MB'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                icon: file,
                assets: {
                    thumb: ''
                }
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
            if (errors.icon) {
                setErrors(prev => ({
                    ...prev,
                    icon: ''
                }));
            }
        }
    };

    const handleUploadImage = async () => {
        if (!formData.icon) return;

        setIsUploading(true);
        try {
            const response = await uploadImage(formData.icon);
            const imageUrl = response.fileUrl;

            setFormData(prev => ({
                ...prev,
                assets: {
                    thumb: imageUrl
                }
            }));

            setShowUploadButton(false);

            // Clear any upload errors
            if (errors.icon) {
                setErrors(prev => ({
                    ...prev,
                    icon: ''
                }));
            }
        } catch {
            setErrors(prev => ({
                ...prev,
                icon: 'Failed to upload image. Please try again.'
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

        if (!formData.price) {
            newErrors.price = 'Price is required';
        } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Price must be a valid positive number';
        }

        if (!formData.total_supply) {
            newErrors.total_supply = 'Total supply is required';
        } else if (isNaN(formData.total_supply) || parseInt(formData.total_supply) <= 0 || !Number.isInteger(parseFloat(formData.total_supply))) {
            newErrors.total_supply = 'Total supply must be a valid positive integer';
        }

        if (!formData.collection_id) {
            newErrors.collection_id = 'Collection is required';
        }

        if (!pack && !formData.icon) {
            newErrors.icon = 'Icon is required';
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
                price: parseFloat(formData.price),
                total_supply: parseInt(formData.total_supply),
                id: pack?.id
            };

            await onSubmit(submitData);
            onClose();
        } catch (error) {
            console.error('Error submitting pack:', error);
            setErrors({ submit: 'Failed to save pack. Please try again.' });
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
                        {pack ? 'Edit Pack' : 'Add New Pack'}
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
                                placeholder="Enter pack name"
                                disabled={isSubmitting}
                            />
                            {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Collection *
                            </label>
                            <select
                                name="collection_id"
                                value={formData.collection_id}
                                onChange={handleInputChange}
                                className={`${styles.select} ${errors.collection_id ? styles.inputError : ''}`}
                                disabled={isSubmitting}
                            >
                                <option value="">Select a collection</option>
                                {collections.map(collection => (
                                    <option key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </option>
                                ))}
                            </select>
                            {errors.collection_id && <span className={styles.errorMessage}>{errors.collection_id}</span>}
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
                            placeholder="Enter pack description"
                            rows="3"
                            disabled={isSubmitting}
                        />
                        {errors.description && <span className={styles.errorMessage}>{errors.description}</span>}
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Price (ETH) *
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className={`${styles.input} ${errors.price ? styles.inputError : ''}`}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                disabled={isSubmitting}
                            />
                            {errors.price && <span className={styles.errorMessage}>{errors.price}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>
                                Total Supply *
                            </label>
                            <input
                                type="number"
                                name="total_supply"
                                value={formData.total_supply}
                                onChange={handleInputChange}
                                className={`${styles.input} ${errors.total_supply ? styles.inputError : ''}`}
                                placeholder="100"
                                min="1"
                                step="1"
                                disabled={isSubmitting}
                            />
                            {errors.total_supply && <span className={styles.errorMessage}>{errors.total_supply}</span>}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>
                            Icon Image * (PNG, JPG, GIF - Max 5MB)
                        </label>
                        <div className={styles.imageUpload}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.fileInput}
                                id="iconUpload"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="iconUpload" className={styles.fileLabel}>
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Icon preview"
                                        className={styles.imagePreview}
                                    />
                                ) : (
                                    <div className={styles.uploadPlaceholder}>
                                        <span className={styles.uploadIcon}>📁</span>
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                            </label>
                            {imagePreview && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setFormData(prev => ({
                                            ...prev, icon: null, assets: {
                                                thumb: ''
                                            }
                                        }));
                                        setShowUploadButton(false);
                                    }}
                                    className={styles.removeImageButton}
                                    disabled={isSubmitting}
                                >
                                    Remove
                                </button>
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
                            {formData.iconUrl && (
                                <div className={styles.uploadSuccess}>
                                    ✅ Image uploaded successfully
                                </div>
                            )}
                        </div>
                        {errors.icon && <span className={styles.errorMessage}>{errors.icon}</span>}
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
                            <span className={styles.checkboxText}>Enable this pack</span>
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
                            {isSubmitting ? 'Saving...' : (pack ? 'Update Pack' : 'Add Pack')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PackDialog;