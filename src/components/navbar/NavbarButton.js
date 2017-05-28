/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import AppConstants from "../../constants";

import Icon from "react-native-vector-icons/FontAwesome";

class NavbarButton extends Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
    navButtonLocation: PropTypes.string.isRequired
  };

  render = () => {
    let style;

    if (this.props.navButtonLocation === AppConstants.FAR_RIGHT_NAV_LOCATION) {
      style = styles.farRightNavButton;
    } else if (
      this.props.navButtonLocation === AppConstants.MEDIUM_RIGHT_NAV_LOCATION
    ) {
      style = styles.mediumRightNavButton;
    } else if (
      this.props.navButtonLocation === AppConstants.LEFT_NAV_LOCATION
    ) {
      style = styles.leftNavButton;
    } else {
      throw new "Internal error!"(); // TODO - properly handle else-condition
    }

    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        activeOpacity={0.7}
        style={style}
      >
        <Icon name={this.props.icon} size={30} color={"#000000"} />
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  mediumRightNavButton: {
    right: 50,
    top: 4
  },
  farRightNavButton: {
    right: 20,
    top: 4
  },
  leftNavButton: {
    left: 40,
    top: 4
  }
});

export default NavbarButton;
