import React, { Component } from 'react';
import { GiftedChat, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { View, StyleSheet, Platform, KeyboardAvoidingView, } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import NetInfo from '@react-native-community/netinfo';

const firebase = require('firebase');
require('firebase/firestore');


export default class Chat extends Component {

  /*state initialization*/
  constructor() {
    super();

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
      isConnected: false,
      uid: 0,
    };
  }

  async getMessages() {
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

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }


  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  componentDidMount() {
    NetInfo.addEventListener(state => {
      this.handleConnectivityChange(state)
    })

    NetInfo.fetch().then(state => {
      const isConnected = state.isConnected;
      if (isConnected) {
        this.setState({
          isConnected: true,
        });

        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          }

          //update user state with currently active user data
          this.setState({
            uid: user.uid,
            messages: []
          });
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
    this.authUnsubscribe();
    this.unsubscribe();

    NetInfo.isConnected.removeEventListener(
      'connectionChange',
      this.handleConnectivityChange
    );
  };

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text.toString(),
        createdAt: data.createdAt.toDate(),
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

  handleConnectivityChange = (state) => {
    const isConnected = state.isConnected;
    if (isConnected == true) {
      this.setState({
        isConnected: true
      });
      this.unsubscribe = this.referenceChatMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
    } else {
      this.setState({
        isConnected: false
      });
    }
  };

  /*add messages to firebase database*/
  addMessages() {
    console.log(this.state.user)
    this.referenceMessages.add({
      _id: this.state.messages[0]._id,
      text: this.state.messages[0].text || '',
      createdAt: this.state.messages[0].createdAt,
      user: this.state.user,
      uid: this.state.uid,
    });
  }

  /*this is called when a user sends a message*/
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }),
      () => {
        this.addMessages();
        this.saveMessages();
      });
  }

  renderBubble(props) {
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

  renderInputToolbar(props) {
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

  render() {
    /*name and color must be passed as props from Start.js*/
    let name = this.props.route.params.name;
    let color = this.props.route.params.color;

    /*sets the title*/
    this.props.navigation.setOptions({ title: name })

    /*renders chat interface*/
    /*fix for Android keyboard placement*/
    return (
      <View style={[styles.body, { backgroundColor: color }]}>
        <GiftedChat
          isConnected={this.state.isConnected}
          renderInputToolbar={this.renderInputToolbar}
          renderBubble={this.renderBubble.bind(this)}
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

/*styling*/
const styles = StyleSheet.create({
  body: {
    flex: 1,
  }
})
