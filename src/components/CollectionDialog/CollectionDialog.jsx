import React, { useState, useEffect } from 'react';
import styles from './CollectionDialog.module.css';
import { uploadImage } from '../../services/userAuth';

const CollectionDialog = ({
    isOpen,
    onClose,
    onSave,
    editData = null,
    isLoading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: null,
        iconUrl: '',
        is_active: true
    });
    const [iconPreview, setIconPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadButton, setShowUploadButton] = useState(false);

    // Reset form when dialog opens/closes or editData changes
    useEffect(() => {
        if (isOpen) {
            if (editData) {
                // Populate form with edit data
                setFormData({
                    name: editData.name || '',
                    description: editData.description || '',
                    icon: null,
                    iconUrl: editData.icon_url || '',
                    is_active: editData.is_active !== undefined ? editData.is_active : true
                });
                setIconPreview(editData.icon_url || null);
            } else {
                // Reset form for new collection
                setFormData({
                    name: '',
                    description: '',
                    icon: null,
                    iconUrl: '',
                    is_active: true
                });
                setIconPreview(null);
            }
            setErrors({});
            setShowUploadButton(false);
        }
    }, [isOpen, editData]);

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

            // Validate file size (max 5MB)
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
                iconUrl: ''
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setIconPreview(e.target.result);
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
                iconUrl: imageUrl
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
            newErrors.name = 'Collection name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!editData && !formData.icon) {
            newErrors.icon = 'Icon image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            ...formData,
            id: editData?.id
        };

        onSave(submitData);
    };

    const handleClose = () => {
        if (!isLoading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {editData ? 'Edit Collection' : 'Add New Collection'}
                    </h2>
                    <button
                        className={styles.closeButton}
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>
                            Collection Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            placeholder="Enter collection name"
                            disabled={isLoading}
                        />
                        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description" className={styles.label}>
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                            placeholder="Enter collection description"
                            rows="4"
                            disabled={isLoading}
                        />
                        {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="icon" className={styles.label}>
                            Icon Image {!editData && '*'}
                        </label>
                        <div className={styles.imageUpload}>
                            <input
                                type="file"
                                id="icon"
                                accept="image/*"
                                onChange={handleImageChange}
                                className={styles.fileInput}
                                disabled={isLoading}
                            />
                            <label htmlFor="icon" className={styles.fileLabel}>
                                {iconPreview ? (
                                    <img
                                        src={iconPreview}
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
                            {showUploadButton && (
                                <button
                                    type="button"
                                    onClick={handleUploadImage}
                                    className={styles.uploadButton}
                                    disabled={isLoading || isUploading}
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
                        {errors.icon && <span className={styles.errorText}>{errors.icon}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleInputChange}
                                className={styles.checkbox}
                                disabled={isLoading}
                            />
                            <span className={styles.checkboxText}>
                                Enable Collection
                            </span>
                        </label>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={handleClose}
                            className={styles.cancelButton}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.saveButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : (editData ? 'Update' : 'Create')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CollectionDialog;