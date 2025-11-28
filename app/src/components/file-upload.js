import React, { Component } from 'react';
import { uploadFiles } from '../helpers/file-api';

class FileUploadComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            toEmail: '',
            message: '',
            uploading: false,
            progress: 0,
            error: ''
        };
    }

    handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        this.setState({ files: selectedFiles, error: '' });
    }

    handleRemoveFile = (index) => {
        const files = [...this.state.files];
        files.splice(index, 1);
        this.setState({ files });
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    }

    handleUpload = async (e) => {
        e.preventDefault();

        const { files, toEmail, message } = this.state;

        if (files.length === 0) {
            this.setState({ error: 'Please select at least one file' });
            return;
        }

        this.setState({ uploading: true, error: '', progress: 0 });

        try {
            await uploadFiles(
                files,
                toEmail,
                message,
                (progress) => {
                    this.setState({ progress });
                }
            );

            this.setState({
                files: [],
                toEmail: '',
                message: '',
                uploading: false,
                progress: 0
            });

            // Clear file input
            document.getElementById('file-input').value = '';

            // Notify parent component
            if (this.props.onFileUploaded) {
                this.props.onFileUploaded();
            }

            alert('Files uploaded successfully!');
        } catch (error) {
            this.setState({
                uploading: false,
                progress: 0,
                error: error.message || 'Upload failed'
            });
        }
    }

    render() {
        const { files, toEmail, message, uploading, progress, error } = this.state;

        if (uploading) {
            return (
                <div className="app-card app-card-uploading" style={{ width: '100%', maxWidth: '100%' }}>
                    <div className="app-card-content">
                        <div className="app-card-content-inner">
                            <div className="app-home-uploading-icon">
                                <i className="icon-upload-cloud"></i>
                                <h2>Uploading files...</h2>
                            </div>
                            <div className="app-progress">
                                <div className="app-progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>
                            <div className="app-text-center" style={{ marginTop: '10px' }}>
                                {progress}%
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="app-card" style={{ width: '100%', maxWidth: '100%' }}>
                <div className="app-card-header">
                    <div className="app-card-header-inner">
                        <h2>Upload Files</h2>
                    </div>
                </div>

                <div className="app-card-content">
                    <div className="app-card-content-inner">
                        {error && (
                            <div className="app-message">
                                <p className="error">{error}</p>
                            </div>
                        )}

                        <form onSubmit={this.handleUpload}>
                            <div className="app-file-select-zone">
                                <label>
                                    <input
                                        id="file-input"
                                        type="file"
                                        multiple
                                        onChange={this.handleFileSelect}
                                    />
                                    <div className="app-upload-icon">
                                        <i className="icon-upload-cloud"></i>
                                    </div>
                                    <span className="app-upload-description">
                                        Click to select files or drag and drop
                                    </span>
                                </label>
                            </div>

                            {files.length > 0 && (
                                <div className="app-files-selected">
                                    {files.map((file, index) => (
                                        <div key={index} className="app-files-selected-item">
                                            <div className="filename">{file.name}</div>
                                            <button
                                                type="button"
                                                className="app-file-remove"
                                                onClick={() => this.handleRemoveFile(index)}
                                            >
                                                × Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="app-form-item">
                                <label>Send to (Optional)</label>
                                <input
                                    type="email"
                                    name="toEmail"
                                    value={toEmail}
                                    onChange={this.handleChange}
                                    placeholder="Recipient email (optional)"
                                />
                            </div>

                            <div className="app-form-item">
                                <label>Message (Optional)</label>
                                <textarea
                                    name="message"
                                    value={message}
                                    onChange={this.handleChange}
                                    placeholder="Add a message (optional)"
                                ></textarea>
                            </div>

                            <div className="app-form-actions">
                                <button type="submit" className="app-button primary">
                                    <i className="icon-upload"></i> Upload Files
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default FileUploadComponent;
