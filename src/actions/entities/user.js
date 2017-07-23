/*
 * @link https://www.algernon.io/
 * @license https://github.com/AlgernonLabs/mobile/blob/master/LICENSE.md
 */

export const CREATE_OR_UPDATE_PROFILE = "CREATE_OR_UPDATE_PROFILE";

export const createOrUpdateProfile = profile => {
  return {
    type: CREATE_OR_UPDATE_PROFILE,
    profile: profile,
    isLoggedIn: true
  };
};

export const DELETE_PROFILE = "DELETE_PROFILE";

export const deleteProfile = () => {
  return {
    type: DELETE_PROFILE
  };
};

export const START_USER_SYNC = "START_USER_SYNC";

export const startUserSync = intervalId => {
  return {
    type: START_USER_SYNC,
    intervalId: intervalId
  };
};

export const END_USER_SYNC = "END_USER_SYNC";

export const endUserSync = () => {
  return {
    type: END_USER_SYNC
  };
};

import * as UserController from "../../models/controllers/user";
import * as ProfileStorage from "../../models/storage/profile-storage";

export const SYNC_USER = "SYNC_USER";

export const syncUser = () => {
  return function(dispatch, getState) {
    console.log(" FROM ACTION sync user state...");
    //console.dir(getState());

    let user = getState().entities.user;

    // only sync is the user is logged in
    if (user && user.isLoggedIn) {
      let currentSyncDateTimeUtc = new Date(); // TODO - refine

      UserController.syncUser()
        .then(response => {
          if (response && response.profile) {
            let syncAction = {
              type: SYNC_USER,
              profile: response.profile,
              lastSuccessfulSyncDateTimeUtc: currentSyncDateTimeUtc
            };

            dispatch(syncAction);
          }
        })
        .catch(error => {
          console.log("sync profile error....");
          console.log("profile err: " + error);
          //console.dir(error);
        });
    }
  };
};

export const ADD_PENDING_PROFILE_UPDATE = "ADD_PENDING_PROFILE_UPDATE";

export const addPendingProfileUpdate = profile => {
  return {
    type: ADD_PENDING_PROFILE_UPDATE,
    queuedProfile: profile
  };
};

export const REMOVE_PENDING_PROFILE_UPDATE = "REMOVE_PENDING_PROFILE_UPDATE";

export const removePendingProfileUpdate = () => {
  return {
    type: REMOVE_PENDING_PROFILE_UPDATE
  };
};

export const START_QUEUED_PROFILE_SUBMIT = "START_QUEUED_PROFILE_SUBMIT";

export const startQueuedProfileSubmission = intervalId => {
  return {
    type: START_QUEUED_PROFILE_SUBMIT,
    intervalId: intervalId
  };
};

export const STOP_QUEUED_PROFILE_SUBMIT = "STOP_QUEUED_PROFILE_SUBMIT";

export const stopQueuedProfileSubmission = () => {
  return {
    type: STOP_QUEUED_PROFILE_SUBMIT
  };
};

export const submitQueuedProfileUpdate = () => {
  return function(dispatch, getState) {
    console.log("queued profile submit state...");
    ////console.dir(getState());

    const profile = getState().entities.user.profile;

    // only submit queued tasks if the user can access the network
    if (UserController.canAccessNetwork(profile)) {
      const queuedProfile = getState().entities.user.queuedProfile;

      if (queuedProfile) {
        // update queued profile credentials, so that API access is possible
        queuedProfile.id = profile.id;
        queuedProfile.password = profile.password;

        UserController.updateProfile(queuedProfile)
          .then(response => {
            ProfileStorage.deletedQueuedProfile();

            dispatch({
              type: REMOVE_PENDING_PROFILE_UPDATE
            });
          })
          .catch(error => {
            console.log("submited queued profile error....");
            ////console.dir(error);
          });
      }

      return;
    }
  };
};
