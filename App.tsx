import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/Ionicons';

import HomeScreen from './screens/HomeScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator(); 

function MainTabNavigator(){
    return(
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                    let iconName: string;
                    if(route.name === 'Home'){
                        iconName = focused ? 'home' : 'home-outline';
                    } else {
                        iconName = 'help-circle-outline';
                    }
                    // add more routes with icons here 
                    return <Icon name={iconName} size={size} color={color}/>;
                },
                tabBarActiveTintColor: '#8b4513',
                tabBarInactiveTintColor: '#d2b48c',
                headerShown: false,
            })}
        >
            <Tab.Screen name='Home' component={HomeScreen}/>
            {/* add screens here */}
        </Tab.Navigator>
    );
}

export default function App(){
    return(
        <NavigationContainer>
            <Drawer.Navigator
                screenOptions = {{
                    drawerStyle: { backgroundColor: '#fff8dc'},
                    drawerActiveTintColor: '#8b4513',
                }}
            >
                <Drawer.Screen name='Main' component={MainTabNavigator}/>
                {/* add more drawer screens here */}
            </Drawer.Navigator>
        </NavigationContainer>
    );
}