import React, { Component } from 'react';

/*import components from react-native*/
import { StyleSheet, View, Text } from 'react-native';


export default class Chat extends Component {

  render() {
    /**name and color must be passed as props from Start.js*/
    let name = this.props.route.params.name;
    let color = this.props.route.params.color;

    /**sets the title*/
    this.props.navigation.setOptions({ title: name })

    return (
      <View style={[styles.body, { backgroundColor: color }]}>
        <Text>Hello!</Text>
      </View>
    )
  }
}
/**styling*/
const styles = StyleSheet.create({
  backgroundColor: {
    flex: 1,
  },
  body: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
})