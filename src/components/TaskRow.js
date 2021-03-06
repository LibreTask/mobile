/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";

import CheckBox from "react-native-checkbox";

import AppStyles from "../styles";
import AppConfig from "../config";

class TaskRow extends Component {
  static propTypes = {
    onPress: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    taskId: PropTypes.string.isRequired,
    isComplete: PropTypes.bool.isRequired,
    onCheckBoxClicked: PropTypes.func.isRequired
  };

  render = () => {
    let { title, isComplete, onPress } = this.props;

    let rowStyle = isComplete ? styles.completedRow : styles.uncompletedRow;

    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={[AppStyles.paddingMinimal, styles.taskRowInner, rowStyle]}>
          <CheckBox
            label={""}
            containerStyle={styles.container}
            checkboxStyle={styles.checkboxContainer}
            checked={isComplete}
            onChange={checked => {
              let updatedCheckedValue = !checked;

              this.props.onCheckBoxClicked(updatedCheckedValue);

              this.setState({
                isCurrentlyCompleted: updatedCheckedValue
              });
            }}
          />

          <Text style={[AppStyles.baseTextLight, styles.text]}>
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
}

const styles = StyleSheet.create({
  taskRowInner: {
    //  TODO - have border style ONLY between elements
    //    For example, if only one element exists, we will not have any border
    //  borderBottomColor: AppConfig.borderColor,
    //  borderBottomWidth: 1,
    flexDirection: "row",
    flex: 1
  },
  text: {
    flexDirection: "row",
    flexWrap: "wrap",
    flex: 1
  },
  completedRow: {
    opacity: 0.3
  },
  uncompletedRow: {
    opacity: 1
  },

  // increase padding + margin so that rows are easier to check
  checkbox: {
    padding: 10
  },
  checkboxContainer: {
    /*
     keep the icon large so that user
     does not have trouble clicking it
    */
    width: 30,
    height: 30,
    padding: 10,
    marginLeft: 5,
    marginRight: 10
  }
});

export default TaskRow;
