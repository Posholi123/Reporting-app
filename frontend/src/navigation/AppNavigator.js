import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import StudentTabs from './StudentTabs';
import LecturerTabs from './LecturerTabs';
import PRLTabs from './PRLTabs';
import PLTabs from './PLTabs';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="StudentTabs" component={StudentTabs} options={{ headerShown: false }} />
        <Stack.Screen name="LecturerTabs" component={LecturerTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PRLTabs" component={PRLTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PLTabs" component={PLTabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}