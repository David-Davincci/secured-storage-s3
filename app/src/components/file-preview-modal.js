import React, { Component } from 'react';
import { getFilePreviewUrl } from '../helpers/file-api';

class FilePreviewModal extends Component {
    renderPreview() {
        const { file } = this.props;

        if (!file || !file.mimeType) {
            return <div>Preview not available</div>;
        }

        const previewUrl = getFilePreviewUrl(file.id);

        if (file.mimeType.startsWith('image/')) {
            return (
                <img
                    src={previewUrl}
                    alt={file.originalName}
                    style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }}
                />
            );
        }

        if (file.mimeType === 'application/pdf') {
            return (
                <iframe
                    src={previewUrl}
                    title={file.originalName}
                    style={{ width: '100%', height: '70vh', border: 'none' }}
                />
            );
        }

        if (file.mimeType.startsWith('text/')) {
            return (
                <iframe
                    src={previewUrl}
                    title={file.originalName}
                    style={{ width: '100%', height: '70vh', border: '1px solid #e0e0e0', borderRadius: '5px' }}
                />
            );
        }

        return (
            <div className="app-text-center">
                <p>Preview not available for this file type</p>
                <p style={{ marginTop: '10px' }}>File type: {file.mimeType}</p>
            </div>
        );
    }

    render() {
        const { file, onClose } = this.props;

        if (!file) return null;

        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <div
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '10px',
                        padding: '20px',
                        maxWidth: '90%',
                        maxHeight: '90%',
                        overflow: 'auto',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: '#1b65f6',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            lineHeight: '25px'
                        }}
                    >
                        ×
                    </button>

                    <h3 style={{ marginBottom: '20px', color: '#96a3bb' }}>{file.originalName}</h3>

                    {this.renderPreview()}
                </div>
            </div>
        );
    }
}

export default FilePreviewModal;
