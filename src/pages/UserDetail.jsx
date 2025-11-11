import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from "../components/Layout";
import styles from './UserDetail.module.css';
import { getUserById, getUserTransactions } from '../services/userAuth';

const UserDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transactionsLoading, setTransactionsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('transactions');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(20);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const fetchUserDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getUserById(userId);
            const data = response.data || response;

            // Handle the new API structure
            const userInfo = {
                ...data.user,
                wallets: data.wallets || [],
                stats: data.stats || {}
            };

            setUser(userInfo);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchUserTransactions = useCallback(async (page = 1) => {
        try {
            setTransactionsLoading(true);
            const response = await getUserTransactions(userId, page, pageSize);
            const data = response.data || response;

            setTransactions(data.items || []);
            setCurrentPage(data.page || 1);
            setTotalPages(data.totalPages || 1);
            setTotalTransactions(data.total || 0);
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setTransactions([]);
            setTotalTransactions(0);
        } finally {
            setTransactionsLoading(false);
        }
    }, [userId, pageSize]);

    useEffect(() => {
        fetchUserDetails();
        fetchUserTransactions();
    }, [fetchUserDetails, fetchUserTransactions]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch {
            return 'Invalid Date';
        }
    };



    const handleBack = () => {
        navigate('/users');
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchUserTransactions(newPage);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={styles.loading}>Loading user details...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={styles.error}>Error: {error}</div>
                    <button onClick={handleBack} className={styles.backButton}>
                        ← Back to Users
                    </button>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className={styles.container}>
                    <div className={styles.error}>User not found</div>
                    <button onClick={handleBack} className={styles.backButton}>
                        ← Back to Users
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className={styles.container}>
                <div className={styles.header}>
                    <button onClick={handleBack} className={styles.backButton}>
                        ← Back to Users
                    </button>
                    <h1 className={styles.title}>User Details</h1>
                </div>

                {/* User Info Card */}
                <div className={styles.userDetailsCard}>
                    <div className={styles.userDetailsContent}>
                        <div className={styles.userDetailsSection}>
                            <h4>Personal Information</h4>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <label>ID:</label>
                                    <span>{user.id}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Username:</label>
                                    <span>{user.username || 'N/A'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Email:</label>
                                    <span>{user.email || 'N/A'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Referral Code:</label>
                                    <span className={styles.referralCode}>{user.referral_code || 'N/A'}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Created:</label>
                                    <span>{formatDate(user.created)}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Updated:</label>
                                    <span>{formatDate(user.updated)}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.userDetailsSection}>
                            <h4>💰 Wallet Balances</h4>
                            <div className={styles.walletsGrid}>
                                {user.wallets && user.wallets.length > 0 ? (
                                    user.wallets.map((wallet, index) => (
                                        <div key={index} className={styles.walletItem}>
                                            <span className={styles.currency}>{wallet.currency}</span>
                                            <span className={styles.balance}>{wallet.balance}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.noWallets}>No wallets found</div>
                                )}
                            </div>
                        </div>

                        <div className={styles.userDetailsSection}>
                            <h4>📊 Statistics</h4>
                            <div className={styles.detailsGrid}>
                                <div className={styles.detailItem}>
                                    <label>Total Purchased Packs:</label>
                                    <span>{user.stats?.totalPurchasedPacks || 0}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Total Collectibles:</label>
                                    <span>{user.stats?.totalCollectibles || 0}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Total Transactions:</label>
                                    <span>{totalTransactions || 0}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Status:</label>
                                    <span className={`${styles.status} ${styles.active}`}>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tab} ${activeTab === 'transactions' ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab('transactions')}
                        >
                            📜 Transactions
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className={styles.tabContent}>
                        {activeTab === 'transactions' && (
                            <div className={styles.transactionsTab}>
                                <div className={styles.transactionHeader}>
                                    <h3>Transaction History</h3>
                                    {totalTransactions > 0 && (
                                        <div className={styles.transactionCount}>
                                            Total: {totalTransactions} transactions
                                        </div>
                                    )}
                                </div>
                                {transactionsLoading ? (
                                    <div className={styles.loading}>Loading transactions...</div>
                                ) : (
                                    <>
                                        <div className={styles.tableContainer}>
                                            <table className={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Type</th>
                                                        <th>Direction</th>
                                                        <th>Amount</th>
                                                        <th>Currency</th>
                                                        <th>Date</th>
                                                        <th>Note</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {transactions.length > 0 ? (
                                                        transactions.map((transaction) => (
                                                            <tr key={transaction.id}>
                                                                <td>{transaction.id}</td>
                                                                <td>
                                                                    <span className={`${styles.transactionType} ${styles[transaction.type?.toLowerCase().replace('_', '')]}`}>
                                                                        {transaction.type?.replace('_', ' ').toUpperCase() || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`${styles.direction} ${styles[transaction.direction?.toLowerCase()]}`}>
                                                                        {transaction.direction === 'in' ? '↓ IN' : transaction.direction === 'out' ? '↑ OUT' : 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td className={`${styles.amount} ${transaction.direction === 'in' ? styles.positive : styles.negative}`}>
                                                                    {transaction.direction === 'in' ? '+' : transaction.direction === 'out' ? '-' : ''}{transaction.amount || 0}
                                                                </td>
                                                                <td>
                                                                    <span className={styles.currency}>
                                                                        {transaction.currency || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td>{formatDate(transaction.created)}</td>
                                                                <td className={styles.note}>
                                                                    {transaction.note || '-'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="7" className={styles.noData}>
                                                                No transactions found
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className={styles.pagination}>
                                                <button
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                    className={styles.paginationButton}
                                                >
                                                    ← Previous
                                                </button>

                                                <div className={styles.paginationInfo}>
                                                    <span>Page {currentPage} of {totalPages}</span>
                                                    <span className={styles.pageSize}>({pageSize} per page)</span>
                                                </div>

                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                    className={styles.paginationButton}
                                                >
                                                    Next →
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserDetail;