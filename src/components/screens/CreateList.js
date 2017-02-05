/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from 'react-native'
import { connect } from 'react-redux'

import * as ListActions from '../../actions/entities/list'
import * as ListController from '../../models/controllers/list'
import * as ListStorage from '../../models/storage/list-storage'
import * as UserController from '../../models/controllers/user'

import AppStyles from '../../styles'
import MultiTaskPage from './MultiTaskPage'

class CreateList extends Component {
	static componentName = 'CreateList';

  constructor(props) {
    super(props);

    this.state = {
      isCreatingList: false,
      creationError: '',
      listName: ''
    }
  }

  _createList = async () => {

    if (this.state.isCreatingList) {

      // TODO - warn user
      return;
    }

    let listName = this.state.listName

    // TODO - validate
    if (UserController.canAccessNetwork(this.props.profile)) {

      this.setState({isCreatingList: true,
         creationError: ''}, () => {

        ListController.createList(listName, this.props.profile.id,
           this.props.profile.password)
        .then( response => {

          let list = response.list

          ListStorage.createOrUpdateList(list);
          this.props.createOrUpdateList(list);

          // move the new list's page to the stop of the stack
          this.props.navigator.replace({
            title: listName, // set title to list's name
            component: MultiTaskPage,
            index: 0,
            passProps: {
              listId: list.id,
            }
          });
        })
        .catch( error => {

          if (error.name === 'NoConnection') {
            this._createListLocallyAndRedirect(listName,
               this.props.profile.id)
          } else {
            this.setState({
              creationError: error.message,
              isCreatingList: false
            });
          }
        })
      });
    } else {

      let userId = this.props.profile ? this.props.profile.id : undefined

      this._createListLocallyAndRedirect(listName, userId)
    }
  }

  _createListLocallyAndRedirect = (name, userId) => {
    let list = ListController.constructListLocally(name, userId)
    ListStorage.createOrUpdateList(list);
    this.props.createOrUpdateList(list);

    // move the new list's page to the stop of the stack
    this.props.navigator.replace({
      title: name, // set title to list's name
      component: MultiTaskPage,
      index: 0,
      passProps: {
        listId: list.id,
      }
    });
  }

  render = () => {
    return (
      <ScrollView
        automaticallyAdjustContentInsets={false}
        ref={'scrollView'}
        style={[AppStyles.container]}
        contentContainerStyle={[AppStyles.containerStretched]}>
        <View style={[AppStyles.padding]}>

        <Text style={[AppStyles.baseText]}>Name</Text>
        <TextInput
          style={[AppStyles.baseText]}
          onChangeText={(updatedName) => {
            this.setState({ listName: updatedName })
          }}
          value={this.state.listName}/>

          <View style={[AppStyles.row]}>

            <View style={[AppStyles.button]}>
              <Button
                title={"Create List"}
                onPress={this._createList} />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const mapStateToProps = (state) => ({
  isLoggedIn: state.user.isLoggedIn,
  profile: state.user.profile
});

const mapDispatchToProps = {
  createOrUpdateList: ListActions.createOrUpdateList
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateList);
