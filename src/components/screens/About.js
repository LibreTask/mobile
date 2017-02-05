/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component } from 'react'
import {
  Button,
  Linking,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native'

import AppStyles from '../../styles'
import AppConstants from '../../constants';

class About extends Component {
	static componentName = 'About';

  render = () => {
    return (
      <ScrollView automaticallyAdjustContentInsets={false}
        style={[AppStyles.container]}>
        <View style={[AppStyles.padding]}>

          <Text style={[AppStyles.paddingVertical, AppStyles.baseTextLarge]}>
            Algernon
          </Text>

          <Text style={[AppStyles.paddingVertical, AppStyles.baseText]}>
            Organize your goals, track your progress, and have updates seamlessly sync across all of your devices.
          </Text>

          <View style={[AppStyles.divider]} />

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.WEBSITE_LINK);
            }}
            >
            <Text style={[AppStyles.baseTextSmall, AppStyles.linkText]}>
              Website
            </Text>
          </TouchableOpacity>

          <View style={[AppStyles.divider]} />

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.SOURCE_CODE_LINK);
            }}
            >
            <Text style={[AppStyles.baseTextSmall, AppStyles.linkText]}>
              Source Code
            </Text>
          </TouchableOpacity>

          <View style={[AppStyles.divider]} />

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.PRODUCT_PRIVACY_LINK);
            }}
            >
            <Text style={[AppStyles.baseTextSmall, AppStyles.linkText]}>
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <View style={[AppStyles.divider]} />

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.PRODUCT_TERMS_LINK);
            }}
            >
            <Text style={[AppStyles.baseTextSmall, AppStyles.linkText]}>
              Terms of Service
            </Text>
          </TouchableOpacity>

          <View style={[AppStyles.divider]} />

        </View>
      </ScrollView>
    );
  }
}

export default About
