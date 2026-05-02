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
import ProfileScreen from './screens/ProfileScreen.tsx';
import {ProfileProvider} from './context/profileContext';
import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Found screens with the same name nested inside one another',
]);

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator<RootStackParamList>();
const TimerStack = createStackNavigator<TimerStackParamList>();
const TodoStack = createStackNavigator<TodoStackParamList>();

// ─── Timer stack (modal) ──────────────────────────────────────────────────────
function TimerStackNavigator() {
  return (
    <TimerStack.Navigator screenOptions={{headerShown: false}}>
      <TimerStack.Screen name="TimerSelection" component={TimerSelectionScreen} />
      <TimerStack.Screen name="CountUpTimer" component={CountUpTimerScreen} />
      <TimerStack.Screen name="PomodoroTimer" component={PomodoroTimerScreen} />
    </TimerStack.Navigator>
  );
}

// ─── Home wrapped in a stack so it can push TimerFlow as a modal ──────────────
function HomeStackNavigator() {
  return (
    <RootStack.Navigator screenOptions={{headerShown: false}}>
      <RootStack.Screen name="Main" component={HomeScreen} />
      <RootStack.Screen
        name="TimerFlow"
        component={TimerStackNavigator}
        options={{presentation: 'modal', animationTypeForReplace: 'push'}}
      />
    </RootStack.Navigator>
  );
}

// ─── Drawer wraps Home + Profiles, sits INSIDE the tab ───────────────────────
// This is the key change: Drawer is a child of Tab, not a parent.
// The tab bar renders at the bottom of every screen including Profiles.
function HomeDrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerStyle: {backgroundColor: '#fff8dc'},
        drawerActiveTintColor: '#8b4513',
        headerShown: true,
      }}>
      <Drawer.Screen
        name="HomeMain"
        component={HomeStackNavigator}
        options={{
          drawerLabel: 'Home',
          headerTitle: 'Home',
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
          headerTitle: 'Profiles',
          drawerIcon: ({color, size}) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// ─── Root: Tab navigator is the outermost navigator ──────────────────────────
// Tab bar is ALWAYS visible at the bottom of every screen.
function RootTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false, // each child manages its own header
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'TodoTab') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else {
            iconName = 'help-circle-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#8b4513',
        tabBarInactiveTintColor: '#d2b48c',
      })}>
      {/* Home tab contains the Drawer (Home + Profiles) */}
      <Tab.Screen
        name="HomeTab"
        component={HomeDrawerNavigator}
        options={{tabBarLabel: 'Home'}}
      />
      {/* Todo tab is a direct tab — always shows bottom bar */}
      <Tab.Screen
        name="TodoTab"
        component={TodoScreen}
        options={{
          tabBarLabel: 'To Do List',
          headerShown: true,
          headerTitle: 'To Do List',
          headerStyle: {backgroundColor: '#fff8dc'},
          headerTintColor: '#8b4513',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <RootTabNavigator />
      </NavigationContainer>
    </ProfileProvider>
  );
}
