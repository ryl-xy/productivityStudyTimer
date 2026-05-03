// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { createStackNavigator } from '@react-navigation/stack';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { RootStackParamList, TimerStackParamList } from './types/navigation';

// import HomeScreen from './screens/HomeScreen';
// import TimerSelectionScreen from './screens/TimerSelectionScreen';
// import CountUpTimerScreen from './screens/CountUpTimerScreen';
// import PomodoroTimerScreen from './screens/PomodoroTimerScreen';

// const Tab = createBottomTabNavigator();
// const Drawer = createDrawerNavigator(); 
// const RootStack = createStackNavigator<RootStackParamList>();
// const TimerStack = createStackNavigator<TimerStackParamList>();

// function TimerStackNavigator(){
//   return(
//     <TimerStack.Navigator screenOptions={{ headerShown: false }}>
//       <TimerStack.Screen name="TimerSelection" component={TimerSelectionScreen} />
//       <TimerStack.Screen name="CountUpTimer" component={CountUpTimerScreen} />
//       <TimerStack.Screen name="PomodoroTimer" component={PomodoroTimerScreen} />
//     </TimerStack.Navigator>
//   );
// }

// function MainTabNavigator(){
//   return(
//     <Tab.Navigator
//         screenOptions={({route}) => ({
//             tabBarIcon: ({focused, color, size}) => {
//                 let iconName: string;
//                 if(route.name === 'Home'){
//                     iconName = focused ? 'home' : 'home-outline';
//                 // } else if(route.name === 'Timer'){
//                 //     iconName = focused ? 'timer' : 'timer-outline';
//                 } else {
//                     iconName = 'help-circle-outline';
//                 }
//                 // add more routes with icons here 
//                 return <Icon name={iconName} size={size} color={color}/>;
//             },
//             tabBarActiveTintColor: '#8b4513',
//             tabBarInactiveTintColor: '#d2b48c',
//             headerShown: false,
//         })}
//     >
//         <Tab.Screen name='Home' component={HomeScreen}/>
//         {/* <Tab.Screen name='Timer' component={TimerStackNavigator}/> */}
//         {/* add screens here */}
//     </Tab.Navigator>
//   );
// }

// function RootStackNavigator() {
//   return(
//     <RootStack.Navigator screenOptions={{ headerShown: false }}>
//       <RootStack.Screen name="AppTabs" component={MainTabNavigator} />
//       <RootStack.Screen
//         name="TimerFlow"
//         component={TimerStackNavigator}
//         options={{
//           presentation: 'modal',
//           animationTypeForReplace: 'push',
//         }}
//       />
//     </RootStack.Navigator>
//   )
// }

// export default function App(){
//     return(
//         <NavigationContainer>
//             <Drawer.Navigator
//                 screenOptions = {{
//                     drawerStyle: { backgroundColor: '#fff8dc'},
//                     drawerActiveTintColor: '#8b4513',
//                 }}
//             >
//                 <Drawer.Screen name='Home' component={RootStackNavigator}/>
//                 {/* add more drawer screens here */}
//             </Drawer.Navigator>
//         </NavigationContainer>
//     );
// }

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
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
import TimetableScreen from './screens/TimetableScreen';
import {ProfileProvider} from './context/profileContext';
import {LogBox} from 'react-native';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const Tab = createBottomTabNavigator();
const RootStack = createStackNavigator<RootStackParamList>();
const TimerStack = createStackNavigator<TimerStackParamList>();
const TodoStack = createStackNavigator<TodoStackParamList>();

function TimerStackNavigator() {
  return (
    <TimerStack.Navigator screenOptions={{headerShown: false}}>
      <TimerStack.Screen name="TimerSelection" component={TimerSelectionScreen} />
      <TimerStack.Screen name="CountUpTimer" component={CountUpTimerScreen} />
      <TimerStack.Screen name="PomodoroTimer" component={PomodoroTimerScreen} />
    </TimerStack.Navigator>
  );
}

// Home stack: allows pushing TimerFlow as a modal over the tab bar
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

export default function App() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName: string;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Todo') {
                iconName = focused ? 'checkbox' : 'checkbox-outline';
              } else if (route.name === 'Timetable') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Profiles') {
                iconName = focused ? 'person' : 'person-outline';
              } else {
                iconName = 'help-circle-outline';
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#8b4513',
            tabBarInactiveTintColor: '#d2b48c',
            headerShown: false,
          })}>
          <Tab.Screen
            name="Home"
            component={HomeStackNavigator}
            options={{tabBarLabel: 'Home'}}
          />
          <Tab.Screen
            name="Todo"
            component={TodoScreen}
            options={{
              tabBarLabel: 'To Do List',
              headerShown: true,
              headerTitle: 'To Do List',
              headerStyle: {backgroundColor: '#fff8dc'},
              headerTintColor: '#8b4513',
            }}
          />
          <Tab.Screen
            name="Timetable"
            component={TimetableScreen}
            options={{
              tabBarLabel: 'Timetable',
              headerShown: true,
              headerTitle: 'Timetable',
              headerStyle: {backgroundColor: '#fff8dc'},
              headerTintColor: '#8b4513',
            }}
          />
          <Tab.Screen
            name="Profiles"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profiles',
              headerShown: true,
              headerTitle: 'Profiles',
              headerStyle: {backgroundColor: '#fff8dc'},
              headerTintColor: '#8b4513',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
}
