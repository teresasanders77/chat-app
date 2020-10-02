import React, { Component } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { View, StyleSheet, Platform, KeyboardAvoidingView, } from 'react-native';

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

    this.referenceMessageUser = null;
    this.referenceMessages = firebase.firestore().collection('messages');

    this.state = {
      messages: [],
      uid: 0,
      isConnected: false,
      user: {
        _id: '',
        name: '',
        avatar: ''
      },
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }

      //update user state with currently active user data
      this.setState({
        user: {
          _id: user.uid,
          name: this.props.route.params.name
        },
        loggedInText: 'Hello' + this.props.route.params.name + '!'
      });
      this.unsubscribe = this.referenceMessages.orderBy('createdAt', 'desc').onSnapshot(this.onCollectionUpdate);
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.authUnsubscribe();
    this.unsubscribe();
  }

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
