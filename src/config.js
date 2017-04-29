/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import AppConstants from './constants'

import Dimensions from 'Dimensions'
var window = Dimensions.get('window')

export default {
	appName: AppConstants.APP_NAME,
	statusBarHeight: 22,
	baseFont: "Roboto",
	baseFontSize: 20,
	primaryColor: "#3436a5",
	textColor: "#4c4c4c",
  errorColor: '#e71e13',
  successColor: '#3A9237',
  linkColor: '#19198C',
	borderColor: "#bababa",
  windowHeight: window.height,
  windowWidth: window.width,
}
