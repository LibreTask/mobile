/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import { StyleSheet, Text } from "react-native";

import AppConstants from "../../constants";
import AppStyles from "../../styles";

class NavbarTitle extends Component {
  static propTypes = {
    title: PropTypes.string
  };

  render = () => {
    return (
      <Text style={[AppStyles.baseText, styles.navbarTitle]}>
        {this.props.title || AppConstants.APP_NAME}
      </Text>
    );
  };
}

const styles = StyleSheet.create({
  navbarTitle: {
    color: "#ffffff",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default NavbarTitle;
