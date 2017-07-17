/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import {
  Button,
  Linking,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";

import * as SideMenuActions from "../../actions/ui/sidemenu";
import * as UserActions from "../../actions/entities/user";
import * as UserController from "../../models/controllers/user";
import * as ProfileStorage from "../../models/storage/profile-storage";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

import Validator from "validator";

import MultiTaskPage from "./MultiTaskPage";

class Login extends Component {
  static componentName = "Login";

  constructor(props) {
    super(props);

    this.state = {
      isLoggingIn: false,
      loginError: "",
      email: "",
      password: "",
      emailValidationError: "",
      passwordValidationError: ""
    };
  }

  componentWillMount = () => {
    this.props.updateHighlight(SideMenuActions.PROFILE_LINK);
  };

  _login = async () => {
    if (this.state.isLoggingIn) {
      // TODO - warn user
      return;
    }

    let email = this.state.email || "";
    let password = this.state.password || "";

    let emailValidationError = "";
    let passwordValidationError = "";

    if (!Validator.isEmail(email)) {
      emailValidationError = "Email is not valid";
    }

    if (!Validator.isLength(password, { min: 6, max: 100 })) {
      passwordValidationError = "Password must be between 6 and 100 characters";
    }

    if (passwordValidationError || emailValidationError) {
      this.setState({
        loginError: "",
        emailValidationError: emailValidationError,
        passwordValidationError: passwordValidationError
      });

      return; // validation failed; cannot login
    }

    // TODO - display a spinner while logging-in

    this.setState(
      {
        isLoggingIn: true,
        emailValidationError: "",
        passwordValidationError: "",
        loginError: ""
      },
      () => {
        UserController.login(email, password)
          .then(response => {
            let profile = response.profile;

            // TODO - handle PW in more secure way
            profile.password = password;

            ProfileStorage.createOrUpdateProfile(profile);
            this.props.createOrUpdateProfile(profile);

            this.props.navigator.replace({
              title: "Main",
              component: MultiTaskPage,
              index: 0
            });
          })
          .catch(error => {
            this.setState({
              loginError: error.message,
              isLoggingIn: false
            });
          });
      }
    );
  };

  _constructNavbar = () => {
    let title = "Login";
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={() => {
          this.props.toggleSideMenu();
        }}
        icon={"bars"}
      />
    );

    return (
      <View style={[AppStyles.navbarContainer]}>
        <NavigationBar
          title={<NavbarTitle title={title || null} />}
          statusBar={{ style: "light-content", hidden: false }}
          style={[AppStyles.navbar]}
          tintColor={AppConfig.primaryColor}
          leftButton={leftNavBarButton}
        />
      </View>
    );
  };

  render = () => {
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        ref={"scrollView"}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}
      >
        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>
          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Email</Text>
            <TextInput
              keyboardType="email-address"
              style={[AppStyles.baseTextLight]}
              onChangeText={updatedEmail => {
                this.setState({ email: updatedEmail });
              }}
              value={this.state.email}
            />

            <Text style={[AppStyles.errorText]}>
              {this.state.emailValidationError}
            </Text>
          </View>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Password</Text>
            <TextInput
              secureTextEntry={true}
              style={[AppStyles.baseTextLight]}
              onChangeText={updatedPassword => {
                this.setState({ password: updatedPassword });
              }}
              value={this.state.password}
            />

            <Text style={[AppStyles.errorText]}>
              {this.state.passwordValidationError}
            </Text>
          </View>

          <View style={[AppStyles.button, AppStyles.paddingVertical]}>
            <Button title={"Login"} onPress={this._login} />
          </View>

          <Text style={[AppStyles.baseTextSmall, AppStyles.errorText]}>
            {this.state.loginError}
          </Text>

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.PASSWORD_RESET_LINK);
            }}
          >
            <Text style={[AppStyles.baseLinkText, styles.resetPasswordLink]}>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  resetPasswordLink: {
    color: AppConfig.linkColor
  }
});

const mapStateToProps = state => ({
  /* TODO */
});

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  updateHighlight: SideMenuActions.updateHighlight
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
