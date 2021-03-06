import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions'
import * as Location from 'expo-location'


const firebase = require('firebase');

/**
* @class CustomActions
* @requires React
* @requires Prop-types
* @requires react-native
* @requires expo-image-picker
* @requires expo-permissions
* @requires expo-location
* @requires firebase
*/

export default class CustomActions extends React.Component {

  /**
  * requests permission to access photos, allows you to choose photo from library 
  * @function pickImage
  * @async
  */
  pickImage = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status === 'granted') {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'Images',
        }).catch(error => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl })
        };
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  /**
  * requests permission to access camera, allows you to take new picture 
  * @function takePhoto
  * @async
  * @return {Promise<string>} Uri sent to uploadImage and onSend
  */
  takePhoto = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
      if (status === 'granted') {
        let result = await ImagePicker.launchCameraAsync().catch(error => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl })
        };
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  /**
  * upload image to Storage with XMLHttpRequest
  * @function uploadImage
  * @async
  * @return {string} URL
  */
  uploadImage = async (uri) => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
    let uriParts = uri.split('/')
    let imageName = uriParts[uriParts.length - 1]

    const ref = firebase.storage().ref().child(`${imageName}`);
    const snapshot = await ref.put(blob);
    blob.close();
    return await snapshot.ref.getDownloadURL();
  }

  /**
  * requests permission to access location
  * @function getLocation
  * @async
  * @return {Promise<number>} Geo coords
  */
  getLocation = async () => {
    try {
      const { status } = await Permissions.askAsync(Permissions.LOCATION);
      if (status === 'granted') {
        let result = await Location.getCurrentPositionAsync({}).catch(error => console.log(error));

        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          })
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  /**
  * When + is pressed actionSheet is called
  * @function onActionPress
  * @returns {actionSheet} 
  */
  onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log('user wants to pick an image');
            return this.pickImage();
          case 1:
            console.log('user wants to take a photo');
            return this.takePhoto();
          case 2:
            console.log('user wants to get their location');
            return this.getLocation();
        }
      },
    );
  };

  render() {
    return (
      <TouchableOpacity
        accessible
        accessibilityLabel="click for more options"
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
