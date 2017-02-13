/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native'

import CheckBox from 'react-native-checkbox';

import AppStyles from '../styles'
import AppConfig from '../config'

class TaskRow extends Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    taskId: PropTypes.string.isRequired,
    isInitiallyCompleted: PropTypes.bool.isRequired,
    onCheckBoxClicked: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      isCurrentlyCompleted: this.props.isInitiallyCompleted
    }
  }

  render = () => {
    let { title, onPress } = this.props;

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}>
        <View style={[AppStyles.padding, styles.taskRowInner]}>
          <CheckBox
            label={''}
            checked={this.state.isCurrentlyCompleted}
            onChange={(checked) => {

              let updatedCheckedValue = !checked

              this.props.onCheckBoxClicked(updatedCheckedValue)

              this.setState({
                isCurrentlyCompleted: updatedCheckedValue
              })
            }}
          />

          <Text style={[AppStyles.baseText]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  taskRowInner: {
    borderBottomColor: AppConfig.borderColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flex: 1,
  },
});

export default TaskRow