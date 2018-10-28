/*
 * @link https://libretask.org/
 * @license https://github.com/LibreTask/mobile/blob/master/LICENSE.md
 */

import React, { Component } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import AppConfig from "../../config";
import AppStyles from "../../styles";

class Splash extends Component {
  static componentName = "Splash";

  render = () => {
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        style={[AppStyles.container, styles.splashView]}
      >
        <View style={[AppStyles.padding]}>
          <Text style={[AppStyles.paddingVertical, styles.splashText]}>
            LibreTask
          </Text>
        </View>
      </ScrollView>
    );
  };
}

const styles = StyleSheet.create({
  splashText: {
    fontFamily: AppConfig.baseFont,
    fontWeight: "500",
    fontSize: AppConfig.baseFontSize * 2,
    color: AppConfig.primaryColor
  },
  splashView: {
    backgroundColor: "white"
  }
});

export default Splash;
