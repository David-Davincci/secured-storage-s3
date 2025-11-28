import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { getFiles, deleteFile, getFilePreviewUrl, downloadFile as downloadFileHelper } from '../helpers/file-api';
import { getCurrentUser, logout } from '../helpers/auth';
import FileUploadComponent from '../components/file-upload';
import FilePreviewModal from '../components/file-preview-modal';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            loading: true,
            selectedFile: null,
            showPreview: false,
            user: null
        };
    }

    componentDidMount() {
        const user = getCurrentUser();
        if (!user) {
            this.props.history.push('/login');
            return;
        }

        this.setState({ user });
        this.loadFiles();
    }

    loadFiles = async () => {
        try {
            const files = await getFiles();
            this.setState({ files, loading: false });
        } catch (error) {
            console.error('Error loading files:', error);
            this.setState({ loading: false });
        }
    }

    handleFileUploaded = () => {
        this.loadFiles();
    }

    handlePreview = (file) => {
        this.setState({
            selectedFile: file,
            showPreview: true
        });
    }

    closePreview = () => {
        this.setState({
            selectedFile: null,
            showPreview: false
        });
    }

    handleDownload = async (file) => {
        try {
            await downloadFileHelper(file.id, file.originalName);
        } catch (error) {
            alert('Failed to download file: ' + error.message);
        }
    }

    handleDelete = async (file) => {
        if (!window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
            return;
        }

        try {
            await deleteFile(file.id);
            this.loadFiles(); // Reload files after deletion
            alert('File deleted successfully');
        } catch (error) {
            alert('Failed to delete file: ' + error.message);
        }
    }

    handleLogout = () => {
        logout();
    }

    formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    render() {
        const { files, loading, selectedFile, showPreview, user } = this.state;

        return (
            <div>
                <div className="app-top-bar">
                    <div className="app-top-bar-inner">
                        <div className="app-top-bar-left">
                            <div className="site-name" onClick={() => this.props.history.push('/')}>
                                Secured Storage
                            </div>
                        </div>
                        <div className="app-top-bar-right">
                            <div className="app-top-bar-right-inner">
                                <ul className="user-profile-menu">
                                    <li>Hello, {user?.name || user?.email}</li>
                                    <li className="user-signin-button" onClick={this.handleLogout}>
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="app-container" style={{ paddingTop: '70px' }}>
                    <div className="app-layout">
                        {/* File Upload Section */}
                        <div style={{ marginBottom: '30px' }}>
                            <FileUploadComponent onFileUploaded={this.handleFileUploaded} />
                        </div>

                        {/* Files List */}
                        <div className="app-card" style={{ width: '100%', maxWidth: '100%' }}>
                            <div className="app-card-header">
                                <div className="app-card-header-inner">
                                    <h2>My Files</h2>
                                </div>
                            </div>

                            <div className="app-card-content">
                                <div className="app-card-content-inner">
                                    {loading ? (
                                        <div className="app-text-center">Loading files...</div>
                                    ) : files.length === 0 ? (
                                        <div className="app-text-center">
                                            <p>No files uploaded yet. Upload your first file above!</p>
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '2px solid #e3eaf8' }}>
                                                        <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                                                        <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                                                        <th style={{ padding: '10px', textAlign: 'left' }}>Size</th>
                                                        <th style={{ padding: '10px', textAlign: 'left' }}>Uploaded</th>
                                                        <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {files.map((file) => (
                                                        <tr key={file.id} style={{ borderBottom: '1px solid #e3eaf8' }}>
                                                            <td style={{ padding: '10px' }}>{file.originalName}</td>
                                                            <td style={{ padding: '10px' }}>{file.mimeType || 'Unknown'}</td>
                                                            <td style={{ padding: '10px' }}>{this.formatFileSize(file.size)}</td>
                                                            <td style={{ padding: '10px' }}>{this.formatDate(file.createdAt)}</td>
                                                            <td style={{ padding: '10px', textAlign: 'right' }}>
                                                                {file.mimeType && (file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf' || file.mimeType.startsWith('text/')) && (
                                                                    <button
                                                                        onClick={() => this.handlePreview(file)}
                                                                        className="app-button"
                                                                        style={{ margin: '0 5px', padding: '5px 10px', fontSize: '11px' }}
                                                                    >
                                                                        Preview
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => this.handleDownload(file)}
                                                                    className="app-button primary"
                                                                    style={{ margin: '0 5px', padding: '5px 10px', fontSize: '11px' }}
                                                                >
                                                                    Download
                                                                </button>
                                                                <button
                                                                    onClick={() => this.handleDelete(file)}
                                                                    className="app-button"
                                                                    style={{ margin: '0 5px', padding: '5px 10px', fontSize: '11px', borderColor: '#d0152e', color: '#d0152e' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showPreview && selectedFile && (
                    <FilePreviewModal file={selectedFile} onClose={this.closePreview} />
                )}
            </div>
        );
    }
}

export default withRouter(Dashboard);
