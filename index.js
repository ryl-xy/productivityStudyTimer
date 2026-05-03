/**
 * @format
 */

// import 'react-native-gesture-handler';
// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);

import { AppRegistry, Text, View } from 'react-native';
import { name as appName } from './app.json';

const App = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>RN WORKS</Text>
  </View>
);

AppRegistry.registerComponent(appName, () => App);