import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { forgotPassword } from '../helpers/auth';

class ForgotPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            isSubmitting: false,
            successMessage: '',
            errorMessage: ''
        };
    }

    handleChange = (e) => {
        this.setState({ email: e.target.value, errorMessage: '' });
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const { email } = this.state;

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            this.setState({ errorMessage: 'Please enter a valid email address' });
            return;
        }

        this.setState({ isSubmitting: true, errorMessage: '' });

        try {
            const result = await forgotPassword(email);
            this.setState({
                isSubmitting: false,
                successMessage: result.message || 'If the email exists, a password reset link has been sent.',
                email: ''
            });
        } catch (error) {
            this.setState({
                isSubmitting: false,
                errorMessage: error.message || 'Failed to send reset email. Please try again.'
            });
        }
    }

    render() {
        const { email, isSubmitting, successMessage, errorMessage } = this.state;

        return (
            <div className="app-container">
                <div className="app-top-header">
                    <h1 onClick={() => this.props.history.push('/')}>Secured Storage</h1>
                </div>

                <div className="app-card" style={{ margin: '0 auto', maxWidth: '400px' }}>
                    <div className="app-card-header">
                        <div className="app-card-header-inner">
                            <h2 className="form-title">Forgot Password</h2>
                        </div>
                    </div>

                    <div className="app-card-content">
                        <div className="app-card-content-inner">
                            {successMessage && (
                                <div className="app-message">
                                    <p>{successMessage}</p>
                                </div>
                            )}

                            {errorMessage && (
                                <div className="app-message">
                                    <p className="error">{errorMessage}</p>
                                </div>
                            )}

                            <form onSubmit={this.handleSubmit}>
                                <div className="app-form-item">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={this.handleChange}
                                        placeholder="Enter your email address"
                                    />
                                    <div className="app-form-description" style={{ marginTop: '10px', fontSize: '12px' }}>
                                        We'll send you a link to reset your password
                                    </div>
                                </div>

                                <div className="app-form-actions">
                                    <button
                                        type="submit"
                                        className="app-button primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(ForgotPassword);
