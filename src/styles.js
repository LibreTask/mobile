/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component } from 'react';
import {
  StyleSheet,
} from 'react-native';

import AppConfig from './config';

module.exports = StyleSheet.create({
  baseTextSmall: {
    fontFamily: AppConfig.baseFont,
    fontWeight: '500',
    color: AppConfig.textColor,
    fontSize: AppConfig.baseFontSize * 0.75,
  },
  baseText: {
    fontFamily: AppConfig.baseFont,
    fontWeight: '500',
    color: AppConfig.textColor,
    fontSize: AppConfig.baseFontSize,
  },
  baseTextLarge: {
    fontFamily: AppConfig.baseFont,
    fontWeight: '500',
    color: AppConfig.textColor,
    fontSize: AppConfig.baseFontSize * 1.25,
  },
  errorText: {
    color: AppConfig.errorColor,
    fontSize: AppConfig.baseFontSize * 0.70
  },
  linkText: {
    color: AppConfig.linkColor
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    flexDirection: 'column',
    position: 'relative',
  },
  containerCentered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerStretched: {
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  rightAligned: {
    alignItems: 'flex-end',
  },
  centered: {
    textAlign: 'center',
  },
  textRightAligned: {
    textAlign: 'right',
  },
  row: {
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  padding: {
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  paddingHorizontal: {
    paddingHorizontal: 20
  },
  paddingVertical: {
    paddingVertical: 20
  },
  button: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 5
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppConfig.borderColor
  },
});