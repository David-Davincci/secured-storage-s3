import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { verifyEmail } from '../helpers/auth';

class VerifyEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            verifying: true,
            success: false,
            message: ''
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const token = params.get('token');

        if (!token) {
            this.setState({
                verifying: false,
                success: false,
                message: 'Invalid verification link. No token provided.'
            });
            return;
        }

        this.verifyEmailToken(token);
    }

    verifyEmailToken = async (token) => {
        try {
            const result = await verifyEmail(token);
            this.setState({
                verifying: false,
                success: true,
                message: result.message || 'Email verified successfully! You can now log in.'
            });
        } catch (error) {
            this.setState({
                verifying: false,
                success: false,
                message: error.message || 'Email verification failed. The link may be invalid or expired.'
            });
        }
    }

    render() {
        const { verifying, success, message } = this.state;

        return (
            <div className="app-container">
                <div className="app-top-header">
                    <h1 onClick={() => this.props.history.push('/')}>Secured Storage</h1>
                </div>

                <div className="app-card" style={{ margin: '0 auto', maxWidth: '400px' }}>
                    <div className="app-card-content">
                        <div className="app-card-content-inner app-text-center">
                            {verifying ? (
                                <div>
                                    <div className="app-home-uploading-icon">
                                        <i className="icon-upload-cloud"></i>
                                        <h2>Verifying your email...</h2>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="app-upload-sent-message">
                                        <div className={`app-home-upload-sent-icon ${success ? '' : 'error'}`}>
                                            <i className={success ? 'icon-paper-plane' : 'icon-picture-streamline'}></i>
                                        </div>
                                        <h2>{success ? 'Email Verified!' : 'Verification Failed'}</h2>
                                        <p>{message}</p>
                                    </div>

                                    <div className="app-form-actions">
                                        {success ? (
                                            <button
                                                className="app-button primary"
                                                onClick={() => this.props.history.push('/login')}
                                            >
                                                Go to Login
                                            </button>
                                        ) : (
                                            <div>
                                                <button
                                                    className="app-button primary"
                                                    onClick={() => this.props.history.push('/register')}
                                                >
                                                    Register Again
                                                </button>
                                                <button
                                                    className="app-button app-button-link"
                                                    onClick={() => this.props.history.push('/')}
                                                >
                                                    Go to Home
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(VerifyEmail);
