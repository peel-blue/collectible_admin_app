import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import styles from './Users.module.css';
import { getUsers } from '../services/userAuth';

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const data = await getUsers(page);
            console.log("Fetched users:", data);
            setUsers(data.data.items);
            setTotalPages(data.data.totalPages || 1);
            setTotalUsers(data.data.total || 0);
            setPageSize(data.data.limit || 10);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch {
            return 'Invalid Date';
        }
    };

    const handleViewUser = (userId) => {
        navigate(`/users/${userId}`);
    };

    // Calculate display range for pagination info
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, totalUsers);

    if (loading) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={styles.loading}>Loading users...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={styles.error}>Error: {error}</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Users</h1>
                    <div className={styles.userCount}>
                        Total Users: {totalUsers}
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Mobile Number</th>
                                <th>Created Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.email || 'N/A'}</td>
                                        <td>{user.phone_number || 'N/A'}</td>
                                        <td>{formatDate(user.created)}</td>
                                        <td>
                                            <button
                                                onClick={() => handleViewUser(user.id)}
                                                className={styles.actionButton}
                                                title="View Details"
                                            >
                                                →
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={styles.noData}>
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInfo}>
                        Showing {startIndex}-{endIndex} of {totalUsers}
                    </div>
                    <div className={styles.paginationControls}>
                        <button
                            className={styles.paginationButton}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            ← Previous
                        </button>
                        <div className={styles.pageNumbers}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    className={`${styles.pageButton} ${currentPage === page ? styles.pageButtonActive : ''}`}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            className={styles.paginationButton}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Users;