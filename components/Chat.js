import React, { Component } from 'react';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';

/*import components from react-native*/
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView, TouchableOpacity } from 'react-native';


export default class Chat extends Component {

  /*state initialization*/
  constructor() {
    super();
    this.state = {
      messages: [],
    }
  }

  /*set state with static message*/
  componentDidMount() {
    this.setState({
      messages: [
        {
          _id: 1,
          text: 'Welcome, ' + this.props.route.params.name + '!',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any',
          },
        },
        /* Use this to add a system message 
        {
          _id: 2,
          text: 'This is a system message',
          createdAt: new Date(),
          system: true,
        },*/
      ],
    })
  }

  /*this is called when a user sends a message*/
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
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
    )
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
          user={{
            _id: 1,
          }}
        />
        { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
        }
      </View>
    )
  }
}
/*styling*/
const styles = StyleSheet.create({
  body: {
    flex: 1,
  }
})