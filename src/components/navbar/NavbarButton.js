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

import Icon from 'react-native-vector-icons/FontAwesome'

export const FAR_RIGHT_NAV_BUTTON = 'FAR_RIGHT_NAV_BUTTON'
export const MEDIUM_RIGHT_NAV_BUTTON = 'MEDIUM_RIGHT_NAV_BUTTON'
export const LEFT_NAV_BUTTON = 'LEFT_NAV_BUTTON'

class NavbarRightButton extends Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
  }

  render = () => {

    let style;

    if (this.props.navButtonLocation === FAR_RIGHT_NAV_BUTTON) {
      style = styles.farRightNavbarButton
    } else if (this.props.navButtonLocation === MEDIUM_RIGHT_NAV_BUTTON) {
      style = styles.mediumRightNavButton
    } else if (this.props.navButtonLocation === LEFT_NAV_BUTTON) {
      style = styles.leftNavbarButton
    }

    // TODO - handle the else condition

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
    )
  }
}

const styles = StyleSheet.create({
  rightNavbarButton: {
    right: 20,
    top: 4,
  },
  farRightNavbarButton: {
    right: 40,
    top: 4,
  },
  leftNavbarButton: {
    left: 20,
    top: 4,
  },
})

export default NavbarRightButton
