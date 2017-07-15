/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
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
import * as TaskViewActions from "../../actions/ui/taskview";

import CheckBox from "react-native-checkbox";

import NavigationBar from "react-native-navbar";
import NavbarTitle from "../navbar/NavbarTitle";
import NavbarButton from "../navbar/NavbarButton";

import AppConfig from "../../config";
import AppStyles from "../../styles";
import AppConstants from "../../constants";

class Settings extends Component {
  static componentName = "Settings";

  constructor(props) {
    super(props);

    this.state = {
      /* todo */
    };
  }

  _constructNavbar = () => {
    let title = "Settings";
    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={() => {
          this.props.navigator.pop();
        }}
        icon={"arrow-left"}
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
            Settings
          </Text>

          <CheckBox
            labelStyle={AppStyles.baseTextLight}
            label={"Show completed tasks"}
            checked={this.props.showCompletedTasks}
            onChange={checked => {
              let updatedStatus = !this.props.showCompletedTasks;
              this.props.toggleShowCompletedTasks(updatedStatus);
            }}
          />
        </View>
      </ScrollView>
    );
  };
}

const mapStateToProps = state => ({
  showCompletedTasks: state.ui.taskview.showCompletedTasks
});

const mapDispatchToProps = {
  toggleSideMenu: SideMenuActions.toggleSideMenu,
  toggleShowCompletedTasks: TaskViewActions.toggleShowCompletedTasks
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
