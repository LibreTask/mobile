/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

import React, { Component, PropTypes } from 'react'
import {
  DeviceEventEmitter,
  Image,
  ListView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'

import * as _ from 'lodash'

import * as SideMenuActions from '../../actions/sidemenu'
import * as TaskActions from '../../actions/entities/task'
import * as TaskController from '../../models/controllers/task'
import * as TaskStorage from '../../models/storage/task-storage'
import * as UserController from '../../models/controllers/user'

import AppStyles from '../../styles'
import AppConfig from '../../config'
import AppConstants from '../../constants'

import NavigationBar from 'react-native-navbar'
import NavbarTitle from '../navbar/NavbarTitle'
import NavbarButton from '../navbar/NavbarButton'

import TaskRow from '../TaskRow'

import EditList from './EditList'
import CreateTask from './CreateTask'
import SingleTaskPage from './SingleTaskPage'

class MultiTaskPage extends Component {
  static componentName = 'MultiTaskPage'

  static propTypes = {
    navigator: PropTypes.object.isRequired,
    listId: PropTypes.string
  }

  static defaultProps = {
    listId: AppConstants.ALL_TASKS_IDENTIFIER
  }

  constructor(props) {
    super(props)

    let dataSource = new ListView.DataSource({
       rowHasChanged: (row1, row2) => row1 !== row2,
    })

    let tasks = this._getTasksToDisplay()

    this.state = {
      willFocusSubscription: null,
      isRefreshing: false,
      dataSource: dataSource.cloneWithRows(tasks),
      todaysTasksCollapsed: false, // only initially display todays
      tomorrowsTasksCollapsed: true,
      futureTasksCollapsed: true,
      overdueTasksCollapsed: true,
      tasksWithNoDateCollapsed: false
    }
  }

  shouldComponentUpdate = (nextProps, nextState) => {

    if (!_.isEqual(this.props, nextProps)) {
      return true;
    }

    if (!_.isEqual(this.state, nextState)) {
      return true;
    }

    return false;
  }

  _filterTasksToDisplay = (myListId, tasks) => {
    let tasksToDisplay = []

    for (let taskId in tasks) {
      let task = tasks[taskId]

      if (myListId === AppConstants.ALL_TASKS_IDENTIFIER
          || myListId === task.listId) {
        tasksToDisplay.push(task)
      }
    }

    return this._sortTasksByDateAndInsertHeaders(tasksToDisplay)
  }

  _getTasksToDisplay = () => {
    return this._filterTasksToDisplay(this.props.listId, this.props.tasks)
  }

  componentWillReceiveProps = (nextProps) => {
    if (!_.isEqual(this.props.tasks, nextProps.tasks)) {
      let tasks = this._filterTasksToDisplay(this.props.listId, nextProps.tasks)
      this.setState({dataSource: this.state.dataSource.cloneWithRows(tasks)})
    }
  }

  _sortTasksByDateAndInsertHeaders = (tasks) => {

    // TODO - fix the hacky date logic in this method

    const today = new Date()
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    let todaysTasks = []
    let tomorrowsTasks = []
    let futureTasks = []
    let overdueTasks = []
    let tasksWithNoDate = []

    for (let task of tasks) {

      const taskDate = task.dueDateTimeUtc
        ? new Date(task.dueDateTimeUtc)
        : null;

      if (!taskDate) {
        task.displayCategory = 'No Date'
        tasksWithNoDate.push(task)
      } else if (taskDate.toDateString() === today.toDateString()) {
        task.displayCategory = 'Today'
        todaysTasks.push(task)
      } else if (taskDate.toDateString() == tomorrow.toDateString()) {
        task.displayCategory = 'Tomorrow'
        tomorrowsTasks.push(task)
      } else if (taskDate.getTime() > tomorrow.getTime()) {
        task.displayCategory = 'Future'
        futureTasks.push(task)
      } else if (taskDate.getTime() < today.getTime()) {
        task.displayCategory = "Overdue"
        overdueTasks.push(task)
      } else {
        // TODO - what here?
      }
    }

    if (tasksWithNoDate.length > 0) {
      tasksWithNoDate.unshift({
        isHeader: true,
        name: 'No Date',
      })
    }

    if (todaysTasks.length > 0) {
      todaysTasks.unshift({
        isHeader: true,
        name: 'Today',
      })
    }

    if (tomorrowsTasks.length > 0) {
      tomorrowsTasks.unshift({
        isHeader: true,
        name: 'Tomorrow',
      })
    }

    if (futureTasks.length > 0) {
      futureTasks.unshift({
        isHeader: true,
        name: 'Future',
      })
    }

    if (overdueTasks.length > 0) {
      overdueTasks.unshift({
        isHeader: true,
        name: 'Overdue',
      })
    }

    return tasksWithNoDate.concat(
      todaysTasks, tomorrowsTasks, futureTasks, overdueTasks)
  }

  _fetchData = async() => {

    this.setState({ isRefreshing: true })

    // TODO - ensure that this works even if no profile specified
      // eg offline usage?

    let attributes = {}

    if (this.props.listId !== AppConstants.ALL_TASKS_IDENTIFIER) {
      attributes.listId = this.props.listId
    }

    let hasNetworkConnection = true // TODO

    let tasks;

    if (this.props.isLoggedIn && hasNetworkConnection) {
      tasks = await TaskController.fetchTasksByAttributes(
        attributes,
        this.props.profile.id,
        this.props.profile.password
      )
    } else {
      // no network or not logged in, revert to local storage
      tasks = (this.props.listId === AppConstants.ALL_TASKS_IDENTIFIER)
        ? (await TaskStorage.getAllTasks())
        : (await TaskStorage.getTasksByListId(this.props.listId))
    }

    if (tasks.length > 0) {
      tasks = this._sortTasksByDateAndInsertHeaders(tasks)
    }

    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(tasks),
      isRefreshing: false,
    })
  }

  _shouldRenderTask = (task) => {

    // TODO - hide if older than today and already completed

    if (task.displayCategory === 'No Date'
          && this.state.tasksWithNoDateCollapsed) {
      return false
    }

    if (task.displayCategory === 'Today'
          && this.state.todaysTasksCollapsed) {
      return false
    }

    if (task.displayCategory === 'Tomorrow'
          && this.state.tomorrowsTasksCollapsed) {
      return false
    }

    if (task.displayCategory === 'Future'
          && this.state.futureTasksCollapsed) {
      return false
    }

    if (task.displayCategory === 'Overdue'
          && this.state.overdueTasksCollapsed) {
      return false
    }

    return true
  }

  _isHeaderCurrentlyCollapsed = (header) => {

    if (header.name === 'No Date') {
      return this.state.tasksWithNoDateCollapsed
    } else if (header.name === 'Today') {
      return this.state.todaysTasksCollapsed
    } else if (header.name === 'Tomorrow') {
      return this.state.tomorrowsTasksCollapsed
    } else if (header.name === 'Future') {
      return this.state.futureTasksCollapsed
    } else if (header.name === 'Overdue') {
      return this.state.overdueTasksCollapsed
    } else {
      return false // TODO - what here?
    }
  }

  _renderRow = (row) => {
    try {
      return row.isHeader
        ? this._renderHeader(row)
        : this._renderTask(row)
    } catch (err) {
      console.log('err rendering row: ' + err)
    }
  }

  _renderTask = (task) => {

    if (this._shouldRenderTask(task)) {
      return (
        <TaskRow

          title={task.name}
          isInitiallyCompleted={task.isCompleted || false}
          taskId={task.id}
          onCheckBoxClicked={ async (isCompleted) => {
              task.isCompleted = isCompleted

              if (UserController.canAccessNetwork(this.props.profile)) {
                TaskController.updateTask(task, this.props.profile.id,
                   this.props.profile.password)
                   .then(response => {
                     this._updateTaskLocally(task)
                   })
                   .catch(error => {
                     if (error.name === 'NoConnection') {
                       this._updateTaskLocally(task)
                     } else {
                       // TODO
                     }
                   })
              } else {
                this._updateTaskLocally(task)
              }
          }}
          onPress={() => {
            this.props.navigator.push({
              title: 'Task View',
              component: SingleTaskPage,
              index: 2,
              transition: 'FloatFromBottom',
              passProps: {
                taskId: task.id,
              }
            })
          }} />
      )
    }

    return <View></View>
  }

  _updateTaskLocally = (task) => {
    TaskStorage.createOrUpdateTask(task)
    this.props.createOrUpdateTask(task)
  }

  _renderHeader = (header) => {
    let headerCollapseStatusImage =
      this._isHeaderCurrentlyCollapsed(header)
      ? require('../../images/arrow_right_black.png')
      : require('../../images/arrow_down_black.png')

    return <View style={styles.headerRow}>
      <TouchableOpacity key={'menu-item-lists'}
        onPress={() => {

          let stateUpdate = {}

          if (header.name === 'No Date') {
            stateUpdate = {
              tasksWithNoDateCollapsed: !this.state.tasksWithNoDateCollapsed
            }
          } else if (header.name === 'Today') {
            stateUpdate = {
              todaysTasksCollapsed: !this.state.todaysTasksCollapsed
            }
          } else if (header.name === 'Tomorrow') {
            stateUpdate = {
              tomorrowsTasksCollapsed: !this.state.tomorrowsTasksCollapsed
            }
          } else if (header.name === 'Future') {
            stateUpdate = {
              futureTasksCollapsed: !this.state.futureTasksCollapsed
            }
          } else if (header.name === 'Overdue') {
            stateUpdate = {
              overdueTasksCollapsed: !this.state.overdueTasksCollapsed
            }
          }

          this.setState(stateUpdate)
        }}>
        <View style={[AppStyles.row]}>
          <View>
            <Image key={`${header.name}-collapse-image`} style={styles.icon} source={headerCollapseStatusImage} />
          </View>
          <View >
            <Text style={[AppStyles.baseText]}>{header.name}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  }

  _renderCreateTaskFooter = () => {

    if (this.props.listId === AppConstants.ALL_TASKS_IDENTIFIER) {
      return <View/> // a list must be selected before a task can be created
    }

    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigator.push({
            title: 'Create Task',
            component: CreateTask,
            index: 2,
            transition: 'FloatFromBottom',
            passProps: {
              listId: this.props.listId,
            }
          })
        }}
        activeOpacity={0.7}>

        <View style={styles.createTaskRowInner}>
          <Text style={[AppStyles.baseTextSmall,  styles.createTaskRowText]}>{'CREATE NEW TASK'}</Text>
        </View>

      </TouchableOpacity>
    )
  }

  _constructNavbar = () => {
    let title = 'All Tasks'
    if (this.props.listId !== AppConstants.ALL_TASKS_IDENTIFIER
      && this.props.listId in this.props.lists) {

      // Use the name of the selected list. The only time which a specific
      // listId should not be found in this.props.lists is when it has just
      // been deleted. Otherwise, it should always be available and used.
      title = this.props.lists[this.props.listId].name
    }

    let leftNavBarButton = (
      <NavbarButton
        navButtonLocation={AppConstants.LEFT_NAV_LOCATION}
        onPress={()=>{
          this.props.toggleSideMenu()
        }}
        icon={'bars'} />
    )

    let farRightNavButton
    if (this.props.listId !== AppConstants.ALL_TASKS_IDENTIFIER) {
        farRightNavButton = (
          <NavbarButton
            navButtonLocation={AppConstants.FAR_RIGHT_NAV_LOCATION}
            onPress={() => {
              this.props.navigator.push({
                title: 'Edit List',
                component: EditList,
                index: 2,
                transition: 'FloatFromBottom',
                passProps: {
                  listId: this.props.listId
                }
              })
            }}
            icon={'edit'} />
        )
    }

    let rightNavButtons = (
      <View style={AppStyles.rightNavButtons}>
        {farRightNavButton}
      </View>
    )

    return (
      <NavigationBar
        title={<NavbarTitle title={title || null} />}
        statusBar={{style: 'light-content', hidden: false}}
        style={[AppStyles.navbar]}
        tintColor={AppConfig.primaryColor}
        leftButton={leftNavBarButton}
        rightButton={rightNavButtons}/>
    )
  }

  _renderList = () => {
    // if no tasks exist, and no list selected, display
    // text so that the screen is not blank
    if (this.props.listId === AppConstants.ALL_TASKS_IDENTIFIER
      && this.state.dataSource.getRowCount() === 0) {

        // TODO - consider adding a more accessible way to create a task
        // for this scenario, like a link, etc

        return (
          <Text style={[AppStyles.padding, AppStyles.paddingVertical,  AppStyles.baseTextLarge]}>
            Navigate to a new or existing list, then create a task.
          </Text>
        )
    }


    return (
      <ListView
        initialListSize={this.state.dataSource.getRowCount()}
        automaticallyAdjustContentInsets={false}
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        renderFooter={this._renderCreateTaskFooter}

        // TODO - use real section headers
        renderSectionHeader={() => {return <View></View>}}
        contentContainerStyle={AppStyles.paddingBottom}
        enableEmptySections={true}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this._fetchData}
            tintColor={AppConfig.primaryColor} />
        } />
    )
  }

  render = () => {

    return (
      <View style={[AppStyles.container]}>
        {this._constructNavbar()}
        {this._renderList()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  createTaskRowInner: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppConfig.borderColor,
  },
  createTaskRowText: {
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  icon: {
    marginTop:4,
    width: 30,
    height: 30,
  },
  headerRow: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: 5,
    paddingHorizontal: 5,
  },
})

const mapStateToProps = (state, ownProps) => {

  return {
    isLoggedIn: state.user.isLoggedIn,
    profile: state.user.profile,
    lists: state.entities.lists,
    tasks: state.entities.tasks,
  }
}

const mapDispatchToProps = {
  createOrUpdateTask: TaskActions.createOrUpdateTask,
  toggleSideMenu: SideMenuActions.toggleSideMenu,
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiTaskPage)
