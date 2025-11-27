import React from 'react';
import styles from './DeleteConfirmDialog.module.css';

const DeleteConfirmDialog = ({ isOpen, title = 'Delete Item', message, onConfirm, onCancel, isDeleting = false }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.dialog} onClick={e => e.stopPropagation()}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <p className={styles.warning}>This action cannot be undone.</p>
                <div className={styles.actions}>
                    <button
                        className={styles.cancelButton}
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.deleteButton}
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmDialog;
