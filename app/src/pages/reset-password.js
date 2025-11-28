import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { resetPassword } from '../helpers/auth';

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
            confirmPassword: '',
            isSubmitting: false,
            successMessage: '',
            errorMessage: '',
            token: null
        };
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search);
        const token = params.get('token');

        if (!token) {
            this.setState({
                errorMessage: 'Invalid reset link. No token provided.'
            });
        } else {
            this.setState({ token });
        }
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value, errorMessage: '' });
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const { password, confirmPassword, token } = this.state;

        if (!token) {
            this.setState({ errorMessage: 'Invalid reset link' });
            return;
        }

        if (!password || password.length < 6) {
            this.setState({ errorMessage: 'Password must be at least 6 characters' });
            return;
        }

        if (password !== confirmPassword) {
            this.setState({ errorMessage: 'Passwords do not match' });
            return;
        }

        this.setState({ isSubmitting: true, errorMessage: '' });

        try {
            const result = await resetPassword(token, password);
            this.setState({
                isSubmitting: false,
                successMessage: result.message || 'Password reset successfully! You can now log in with your new password.',
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            this.setState({
                isSubmitting: false,
                errorMessage: error.message || 'Password reset failed. The link may be invalid or expired.'
            });
        }
    }

    render() {
        const { password, confirmPassword, isSubmitting, successMessage, errorMessage } = this.state;

        return (
            <div className="app-container">
                <div className="app-top-header">
                    <h1 onClick={() => this.props.history.push('/')}>Secured Storage</h1>
                </div>

                <div className="app-card" style={{ margin: '0 auto', maxWidth: '400px' }}>
                    <div className="app-card-header">
                        <div className="app-card-header-inner">
                            <h2 className="form-title">Reset Password</h2>
                        </div>
                    </div>

                    <div className="app-card-content">
                        <div className="app-card-content-inner">
                            {successMessage && (
                                <div className="app-message">
                                    <p>{successMessage}</p>
                                    <div className="app-form-actions">
                                        <button
                                            className="app-button primary"
                                            onClick={() => this.props.history.push('/login')}
                                        >
                                            Go to Login
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!successMessage && (
                                <form onSubmit={this.handleSubmit}>
                                    {errorMessage && (
                                        <div className="app-message">
                                            <p className="error">{errorMessage}</p>
                                        </div>
                                    )}

                                    <div className="app-form-item">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={password}
                                            onChange={this.handleChange}
                                            placeholder="Enter new password (min 6 characters)"
                                        />
                                    </div>

                                    <div className="app-form-item">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={this.handleChange}
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    <div className="app-form-actions">
                                        <button
                                            type="submit"
                                            className="app-button primary"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                                        </button>

                                        <button
                                            type="button"
                                            className="app-button app-button-link"
                                            onClick={() => this.props.history.push('/login')}
                                        >
                                            Back to Login
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(ResetPassword);
