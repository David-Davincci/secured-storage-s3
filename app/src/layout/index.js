import React, { Component } from "react";
import Home from "../pages/home";
import View from "../pages/view";
import Register from "../pages/register";
import VerifyEmail from "../pages/verify-email";
import ForgotPassword from "../pages/forgot-password";
import ResetPassword from "../pages/reset-password";
import Dashboard from "../pages/dashboard";
import { Router, Route, Switch } from "react-router-dom";
import { history } from "../history";
import { isAuthenticated } from "../helpers/auth";

// Protected Route Component
const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
        (window.location.href = '/login')
      )
    }
  />
);

class Layout extends Component {
  render() {
    return (
      <div className={"app-layout"}>
        <Router history={history}>
          <Switch>
            <Route exact path={"/"} component={Home} />
            <Route exact path={"/register"} component={Register} />
            <Route exact path={"/login"} component={Home} />
            <Route exact path={"/verify-email"} component={VerifyEmail} />
            <Route exact path={"/forgot-password"} component={ForgotPassword} />
            <Route exact path={"/reset-password"} component={ResetPassword} />
            <Route exact path={"/share/:id"} component={View} />
            <ProtectedRoute exact path={"/dashboard"} component={Dashboard} />
          </Switch>
        </Router>
      </div>
    );
  }
}

export default Layout;
