/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native'

import Icon from 'react-native-vector-icons/FontAwesome';

class NavbarRightButton extends Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
  }

  render = () => {

    let style = this.props.isRightNavButton
      ? styles.rightNavbarButton
      : styles.leftNavbarButton;

    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        activeOpacity={0.7}
        style={style}>
        <Icon
          name={this.props.icon}
          size={30}
          color={"#ffffff"} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  rightNavbarButton: {
    right: 20,
    top: 4,
  },
  leftNavbarButton: {
    left: 20,
    top: 4,
  },
});

export default NavbarRightButton
