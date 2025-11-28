import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { register } from '../helpers/auth';

class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            form: {
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            },
            errors: {},
            isSubmitting: false,
            successMessage: '',
            errorMessage: ''
        };
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            form: {
                ...this.state.form,
                [name]: value
            },
            errors: {
                ...this.state.errors,
                [name]: ''
            }
        });
    }

    validate = () => {
        const { name, email, password, confirmPassword } = this.state.form;
        const errors = {};

        if (!name || name.trim() === '') {
            errors.name = 'Name is required';
        }

        if (!email || email.trim() === '') {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email is invalid';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    }

    handleSubmit = async (e) => {
        e.preventDefault();

        const errors = this.validate();
        if (Object.keys(errors).length > 0) {
            this.setState({ errors });
            return;
        }

        this.setState({ isSubmitting: true, errorMessage: '' });

        try {
            const { name, email, password } = this.state.form;
            const result = await register(email, password, name);

            this.setState({
                isSubmitting: false,
                successMessage: result.message || 'Registration successful! Please check your email to verify your account.',
                form: { name: '', email: '', password: '', confirmPassword: '' }
            });
        } catch (error) {
            this.setState({
                isSubmitting: false,
                errorMessage: error.message || 'Registration failed. Please try again.'
            });
        }
    }

    render() {
        const { form, errors, isSubmitting, successMessage, errorMessage } = this.state;

        return (
            <div className="app-container">
                <div className="app-top-header">
                    <h1 onClick={() => this.props.history.push('/')}>Secured Storage</h1>
                </div>

                <div className="app-card" style={{ margin: '0 auto', maxWidth: '400px' }}>
                    <div className="app-card-header">
                        <div className="app-card-header-inner">
                            <h2 className="form-title">Create Account</h2>
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
                                <div className={`app-form-item ${errors.name ? 'error' : ''}`}>
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={this.handleChange}
                                        placeholder="Enter your name"
                                    />
                                    {errors.name && <div className="error">{errors.name}</div>}
                                </div>

                                <div className={`app-form-item ${errors.email ? 'error' : ''}`}>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={this.handleChange}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <div className="error">{errors.email}</div>}
                                </div>

                                <div className={`app-form-item ${errors.password ? 'error' : ''}`}>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={this.handleChange}
                                        placeholder="Enter password (min 6 characters)"
                                    />
                                    {errors.password && <div className="error">{errors.password}</div>}
                                </div>

                                <div className={`app-form-item ${errors.confirmPassword ? 'error' : ''}`}>
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={form.confirmPassword}
                                        onChange={this.handleChange}
                                        placeholder="Confirm your password"
                                    />
                                    {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
                                </div>

                                <div className="app-form-actions">
                                    <button
                                        type="submit"
                                        className="app-button primary"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                                    </button>

                                    <button
                                        type="button"
                                        className="app-button app-button-link"
                                        onClick={() => this.props.history.push('/login')}
                                    >
                                        Already have an account? Sign In
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

export default withRouter(Register);
