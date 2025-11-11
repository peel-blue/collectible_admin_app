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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            console.log("Fetched users:", data);
            setUsers(data.data.items);
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
    }; if (loading) {
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
                        Total Users: {users.length}
                    </div>
                </div>

                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
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
                                    <td colSpan="4" className={styles.noData}>
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Users;