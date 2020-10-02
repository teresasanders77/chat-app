import React, { Component } from 'react';

/*import components from react-native*/
import { View, Text, TextInput, StyleSheet, ImageBackground, TouchableOpacity, KeyboardAvoidingView } from 'react-native';

export default class Start extends Component {
  constructor(props) {
    super(props);

    /*define state*/
    this.state = {
      name: '',
      color: ''
    }
  }

  /*render components*/
  render() {
    return (
      <ImageBackground source={require('../assets/start.png')} style={styles.image}>
        <Text style={styles.title}>Chat-App</Text>
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            onChangeText={(name) => this.setState({ name })}
            value={this.state.name}
            placeholder='Your Name'
          />
          <Text style={styles.colorText}>Choose Background Color:</Text>
          <View style={styles.colorSelection}>
            <TouchableOpacity
              onPress={() => this.setState({ color: '#090C08' })}
              style={[styles.circle, styles.color1]}></TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setState({ color: '#474056' })}
              style={[styles.circle, styles.color2]}></TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setState({ color: '#8A95A5' })}
              style={[styles.circle, styles.color3]}></TouchableOpacity>
            <TouchableOpacity
              onPress={() => this.setState({ color: '#B9C6AE' })}
              style={[styles.circle, styles.color4]}></TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.button]}
            onPress={() => this.props.navigation.navigate('Chat', { name: this.state.name, color: this.state.color })}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
          {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
          }
        </View>
      </ImageBackground >
    )
  }
}
/**styling*/
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 25,
    width: '88%',
    height: '44%',
    backgroundColor: '#FFFFFF',
    marginTop: 225,
  },
  image: {
    width: '100%',
    height: '100%'
  },
  title: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 45,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 75,
  },
  textInput: {
    height: 60,
    width: '88%',
    marginTop: 15,
    borderColor: 'gray',
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 0.5,
    padding: 10
  },
  colorText: {
    fontSize: 16,
    fontWeight: '300',
    color: '#757083',
    opacity: 1,
    marginLeft: -120,
    marginTop: 20,
    marginBottom: -20
  },
  colorSelection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    margin: 15,
    width: "88%"
  },
  circle: {
    borderRadius: 25,
    width: 50,
    height: 50,
    marginLeft: 10,
    marginRight: 10
  },
  color1: {
    backgroundColor: '#090C08'
  },
  color2: {
    backgroundColor: '#474056'
  },
  color3: {
    backgroundColor: '#8A95A5'
  },
  color4: {
    backgroundColor: '#B9C6AE'
  },
  button: {
    backgroundColor: '#757083',
    width: '88%',
    height: 50,
    marginBottom: 15
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    padding: 15
  }
})