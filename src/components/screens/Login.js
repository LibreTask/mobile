/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  Button,
  Linking,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { connect } from 'react-redux'

import * as UserActions from '../../actions/entities/user'
import * as UserController from '../../models/controllers/user'
import * as ProfileStorage from '../../models/storage/profile-storage'

import AppStyles from '../../styles'
import AppConstants from '../../constants'

import Validator from 'validator'

import MultiTaskPage from './MultiTaskPage'

class Login extends Component {
  static componentName = 'Login';

  constructor(props) {
    super(props);

    this.state = {
      isLoggingIn: false,
      loginError: '',
      email: '',
      password: '',
      emailValidationError: '',
      passwordValidationError: ''
    }
  }

  _login = async () => {

    if (this.state.isLoggingIn) {

        // TODO - warn user
        return;
    }

    let email = this.state.email || ''
    let password = this.state.password || ''

    let emailValidationError = ''
    let passwordValidationError = ''

    if (!Validator.isEmail(email)) {
      emailValidationError = 'Email is not valid'
    }

    if (!Validator.isLength(password, {min: 6, max: 100})) {
      passwordValidationError = 'Password must be between 6 and 100 characters'
    }

    if (passwordValidationError || emailValidationError) {
      this.setState({
        emailValidationError: emailValidationError,
        passwordValidationError: passwordValidationError
      })

      return; // validation failed; cannot login
    }

    // TODO - display a spinner while logging-in

    this.setState({
      isLoggingIn: true,
      emailValidationError: '',
      passwordValidationError: '',
      loginError: ''
    }, () => {

      UserController.login(email, password)
      .then( response => {

          let profile = response.profile

          // TODO - handle PW in more secure way
          profile.password = password

          ProfileStorage.createOrUpdateProfile(profile)
          this.props.createOrUpdateProfile(profile)

          this.props.navigator.replace({
            title: 'Main',
            component: MultiTaskPage,
            index: 0,
          });
      })
      .catch( error => {
          this.setState({
            loginError: error.message,
            isLoggingIn: false
          });
      });
    });
  }

  render = () => {

    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        ref={'scrollView'}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}>
        <View style={[AppStyles.padding]}>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Email</Text>
            <TextInput
              keyboardType="email-address"
              style={[AppStyles.baseText]}
              onChangeText={(updatedEmail) => {
                this.setState({ email: updatedEmail })
              }}
              value={this.state.email}/>

            <Text style={[AppStyles.errorText]}>
              {this.state.emailValidationError}
            </Text>
          </View>

          <View style={[AppStyles.paddingVertical]}>
            <Text style={[AppStyles.baseText]}>Password</Text>
            <TextInput
              secureTextEntry={true}
              style={[AppStyles.baseText]}
              onChangeText={(updatedPassword) => {
                this.setState({ password: updatedPassword })
              }}
              value={this.state.password}/>

            <Text style={[AppStyles.errorText]}>
              {this.state.passwordValidationError}
            </Text>
          </View>

          <View style={[AppStyles.button, AppStyles.paddingVertical]}>
            <Button
              title={"Login"}
              onPress={this._login} />
          </View>

          <TouchableOpacity
            style={[ AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.PASSWORD_RESET_LINK);
            }}>
            <Text>
              Forgot password?
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({ /* TODO */ });

const mapDispatchToProps = {
  createOrUpdateProfile: UserActions.createOrUpdateProfile
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);