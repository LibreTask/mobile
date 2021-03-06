/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import {
  Button,
  Linking,
  View,
  Text,
  TouchableOpacity,
  ScrollView
} from "react-native";
import { connect } from "react-redux";

import * as SideMenuActions from "../../actions/ui/sidemenu";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

class About extends Component {
  static componentName = "About";

  componentWillMount = () => {
    this.props.updateHighlight(SideMenuActions.ABOUT_LINK);
  };

  _constructNavbar = () => {
    let title = "About";
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
        style={[AppStyles.container]}
      >
        {this._constructNavbar()}

        <View style={[AppStyles.padding]}>
          <Text style={[AppStyles.paddingVertical, AppStyles.baseTextLarge]}>
            LibreTask
          </Text>

          <Text style={[AppStyles.paddingVertical, AppStyles.baseTextLight]}>
            Organize your goals, track your progress, and have updates
            seamlessly sync across all of your devices.
          </Text>

          <View style={[AppStyles.divider]} />

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.WEBSITE_LINK);
            }}
          >
            <Text style={[AppStyles.baseTextLight, AppStyles.linkText]}>
              Website
            </Text>
          </TouchableOpacity>

          {/* NOTE: we are open-sourcing until after beta
          <View style={[AppStyles.divider]} />

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.SOURCE_CODE_LINK);
            }}
          >
            <Text style={[AppStyles.baseTextLight, AppStyles.linkText]}>
              Source Code
            </Text>
          </TouchableOpacity>

          */}

          <View style={[AppStyles.divider]} />

          <TouchableOpacity
            style={[AppStyles.paddingVertical]}
            onPress={() => {
              Linking.openURL(AppConstants.PRODUCT_PRIVACY_LINK);
            }}
          >
            <Text style={[AppStyles.baseTextLight, AppStyles.linkText]}>
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
            <Text style={[AppStyles.baseTextLight, AppStyles.linkText]}>
              Terms of Service
            </Text>
          </TouchableOpacity>

          <View style={[AppStyles.divider]} />
        </View>
      </ScrollView>
    );
  };
}

const mapStateToProps = state => ({
  /* TODO */
});

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  updateHighlight: SideMenuActions.updateHighlight
};

export default connect(mapStateToProps, mapDispatchToProps)(About);
