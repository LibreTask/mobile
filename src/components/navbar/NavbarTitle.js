/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  StyleSheet,
  Text,
} from 'react-native'

import AppConstants from '../../constants'

class NavbarTitle extends Component {
  static propTypes = {
    title: PropTypes.string,
  }

  render = () => {
    return (
      <Text style={[styles.navbarTitle]}>
        {this.props.title || AppConstants.APP_NAME}
      </Text>
    )
  }
}

const styles = StyleSheet.create({
  navbarTitle: {
    color: '#ffffff',
    bottom: 6,
    fontSize: 13,
  },
})

export default NavbarTitle
