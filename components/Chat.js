import React, { Component } from 'react';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { View, StyleSheet, Platform, KeyboardAvoidingView, } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';
import { YellowBox } from 'react-native';

const firebase = require('firebase');
require('firebase/firestore');

/**
* @class Chat
* @requires React
* @requires React-native
* @requires react-native-gifted-chat
* @requires react-native-community/async-storage
* @requires react-native-community/netinfo
* @requires CustomActions from './CustomActions'
* @requires react-native-maps
* @requires firebase
* @requires firestore
*/

export default class Chat extends Component {

  //state initialization
  constructor() {
    super();

    /**
    * firestore credentials
    * @param {string} apiKey
    * @param {string} authDomain
    * @param {string} databaseURL
    * @param {string} projectId
    * @param {string} storageBucket
    * @param {string} messageSenderId
    * @param {string} appId
    * @param {string} measurementId
    */
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyDLWiulz2O4G7vsUyqcSbhmmQzdSIImLAM",
        authDomain: "chat-app-ba7e5.firebaseapp.com",
        databaseURL: "https://chat-app-ba7e5.firebaseio.com",
        projectId: "chat-app-ba7e5",
        storageBucket: "chat-app-ba7e5.appspot.com",
        messagingSenderId: "116139593118",
        appId: "1:116139593118:web:f4e168cdddb7eb6d335a8f",
        measurementId: "G-6L61FDRW1N"
      });
    }

    this.referenceMessages = firebase.firestore().collection('messages');

    this.state = {
      messages: [],
      user: {
        _id: '',
        name: '',
        avatar: '',
      },
      isConnected: false,
      image: null,
      location: null,
    };
  }

  /**
  * default function parameters to be used if the user is unspecified or undefined
  * @function setUser
  * @param {string} _id
  * @param {string} name
  * @param {string} avatar
  */
  setUser = (_id, name = 'Guest User', avatar = 'https://placeimg.com/140/140/people') => {
    this.setState({
      user: {
        _id: _id,
        name: name,
        avatar: avatar,
      }
    })
  }

  /**
   * loads messages from AsyncStorage
   * @function getMessages
   * @async
   * @return {Promise<string>}  The data from the storage 
   */

  getMessages = async () => {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
 * saves messages from AsyncStorage
 * @function saveMessages
 * @async
 * @return {Promise<AsyncStorage>} message in AsyncStorage
 */
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
 *deletes messages from AsyncStorage
 *@function deleteMessages
 * @async

 */
  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  //NetInfo is implemented to check the current network status of
  componentDidMount() {
    this._isMounted = true;
    YellowBox.ignoreWarnings(['Animated.event', 'Animated: `useNativeDriver` was not specified.']);
    NetInfo.addEventListener(state => {
      this.handleConnectivityChange(state);
    });

    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected;
      if (isConnected) {
        this.setState({
          isConnected: true,
        });

        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await firebase.auth().signInAnonymously();
            } catch (error) {
              console.log(error.message)
            }
          }

          //update user state with currently active user data
          if (!this.props.route.params.name) {
            this.setUser(user.uid);
            this.setState({
              user: {
                _id: user.uid,
                messages: []
              },
              loggedInText: 'Hello!'
            });
          } else {
            this.setUser(user.uid, this.props.route.params.name)
            this.setState({
              user: {
                _id: user.uid,
                messages: []
              },
              loggedInText: 'Hello!'
            });
          }
          this.unsubscribe = this.referenceMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
        });
      } else {
        this.setState({
          isConnected: false
        });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.unsubscribe();
    this.authUnsubscribe();


  }

  /**
  * Updates collection, sets new messages state
  * @function onCollectionUpdate
  * @param {string} _id
  * @param {string} text 
  * @param {date} createdAt 
  * @param {string} imageUri
  * @param {number} location
  * @param {object} userData
  */
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
        image: data.image || '',
        location: data.location,
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        }
      });
    });
    this.setState({
      messages,
    });
  };

  //function to check the networkstatus of the user
  handleConnectivityChange = state => {
    const isConnected = state.isConnected;
    if (isConnected == true) {
      this.setState({
        isConnected: true
      });
      this.unsubscribe = this.referenceMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    } else {
      this.setState({
        isConnected: false
      });
    }
  };

  /**
  * add messages to firebase database
  * @function addMessages
  * @param {string} _id
  * @param {string} text 
  * @param {date} createdAt 
  * @param {string} user
  * @param {string} imageUri
  * @param {number} location
  * @param {boolean} sent 
  */
  addMessages = () => {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || '',
      location: message.location || null,
      sent: true,
    });
  };

  /**
  * this is called when a user sends a message
  * @function onSend
  * @param {*} messages 
  * @returns {state} updates state with message
  */
  onSend = (messages = []) => {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      () => {
        this.addMessages();
        this.saveMessages();
      });
  }

  /**
  * renders chat bubble
  * @function renderBubble 
  * @param {*} props 
  * @returns {Bubble} 
  */
  renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    );
  }

  /**
  * renders toolbar, hides it if user is offline  
  * @function renderInputToolbar
  * @param {*} props 
  * @returns {InputToolbar} 
  */
  renderInputToolbar = (props) => {
    console.log('renderInputToolbar --> props', props.isConnected);
    if (props.isConnected === false) {
    } else {
      return (
        <InputToolbar
          {...props}
        />
      );
    }
  }

  /**
  * renders pickImage, takePhoto and getLocation 
  * @function renderCustomActions
  * @param {*} props 
  * @returns {CustomActions} 
  */
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  /**
  * renders CustomView  
  * @function renderCustomView
  * @param {*} props 
  * @returns {MapView} 
  */
  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <View>
          <MapView
            style={{
              width: 150,
              height: 100,
              borderRadius: 13,
              margin: 3
            }}
            region={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      );
    }
    return null;
  }

  render() {
    //name and color must be passed as props from Start.js
    let name = this.props.route.params.name;
    let color = this.props.route.params.color;

    //sets the title
    this.props.navigation.setOptions({ title: name })

    //renders chat interface
    return (
      <View style={[styles.body, { backgroundColor: color }]}>
        {this.state.image && (
          <Image
            source={{ uri: this.state.image.uri }}
            style={{ width: 200, height: 200 }}
          />
        )}
        <GiftedChat
          isConnected={this.state.isConnected}
          renderInputToolbar={this.renderInputToolbar}
          renderCustomView={this.renderCustomView}
          renderBubble={this.renderBubble.bind(this)}
          renderActions={this.renderCustomActions}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={this.state.user}
        />
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }
      </View>
    );
  }
}

//styling
const styles = StyleSheet.create({
  body: {
    flex: 1,
  }
})
