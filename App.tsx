import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  RootStackParamList,
  TimerStackParamList,
  TodoStackParamList,
} from './types/navigation';

import HomeScreen from './screens/HomeScreen';
import TimerSelectionScreen from './screens/TimerSelectionScreen';
import CountUpTimerScreen from './screens/CountUpTimerScreen';
import PomodoroTimerScreen from './screens/PomodoroTimerScreen';
import TodoScreen from './screens/TodoScreen';
import {LogBox} from 'react-native';
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
import ProfileScreen from './screens/ProfileScreen.tsx';
import {ProfileProvider} from './context/profileContext';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator<RootStackParamList>();
const TimerStack = createStackNavigator<TimerStackParamList>();
const TodoStack = createStackNavigator<TodoStackParamList>();

function TimerStackNavigator() {
  return (
    <TimerStack.Navigator screenOptions={{headerShown: false}}>
      <TimerStack.Screen
        name="TimerSelection"
        component={TimerSelectionScreen}
      />
      <TimerStack.Screen name="CountUpTimer" component={CountUpTimerScreen} />
      <TimerStack.Screen name="PomodoroTimer" component={PomodoroTimerScreen} />
    </TimerStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            // } else if(route.name === 'Timer'){
            //     iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Todo') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else {
            iconName = 'help-circle-outline';
          }

          // add more routes with icons here
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8b4513',
        tabBarInactiveTintColor: '#d2b48c',
        headerShown: false,
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      {/* <Tab.Screen name='Timer' component={TimerStackNavigator}/> */}
      <Tab.Screen
        name="Todo"
        component={TodoScreen}
        options={{tabBarLabel: 'To Do List'}}
      />
      {/* add screens here */}
    </Tab.Navigator>
  );
}

function RootStackNavigator() {
  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      <RootStack.Screen name="Main" component={MainTabNavigator} />
      <RootStack.Screen
        name="TimerFlow"
        component={TimerStackNavigator}
        options={{
          presentation: 'modal',
          animationTypeForReplace: 'push',
        }}
      />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            drawerStyle: {backgroundColor: '#fff8dc'},
            drawerActiveTintColor: '#8b4513',
            headerTitle: 'Home',
          }}>
          <Drawer.Screen
            name="Main"
            component={RootStackNavigator}
            options={{
              drawerLabel: 'Home',
              drawerIcon: ({color, size}) => (
                <Icon name="home-outline" size={size} color={color} />
              ),
            }}
          />
          <Drawer.Screen
            name="Profiles"
            component={ProfileScreen}
            options={{
              drawerLabel: 'Profiles',
              drawerIcon: ({color, size}) => (
                <Icon name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
}
